/**
 * LanePoolDispatcher — 加权路权并发调度器
 *
 * 核心功能：
 * - 每个 worker 有独立的 maxLanes（路数上限）
 * - 全局就绪队列 + per-worker in-flight 计数
 * - 批次分配：优先填满高 priority 模型的 lane，lane 满了再填下一个
 * - 支持动态入队（如 pipeline 中 zh2en 完成后投递 en2ru 批次）
 * - 批大小自适应：大规模满路跑 / 小规模平分缩批
 * - 路利用率追踪：记录每条路的 in-flight 占比和完成统计
 *
 * 用法（替代 runDagScheduler）：
 *
 *   const dispatcher = new LanePoolDispatcher({ workers, onWaveDone, onBatchDone });
 *   await dispatcher.run(initialBatches);
 *
 * 每个 worker 对象：
 *   {
 *     id: 'xfyun:xophunyuan7bmt',
 *     provider: 'xfyun',
 *     name: '讯飞星辰/Hy-MT2-7B',
 *     maxLanes: 20,
 *     batchSize: 100,
 *     priority: 1,
 *     callBatch: (prompt, expectedCount) => Promise<string[]>
 *   }
 *
 * 每个 batch 对象：
 *   {
 *     unitId: 'en2ru-5',
 *     kind: 'en2ru_batch',
 *     stage: 'en2ru',
 *     items: [...],
 *     preferredWorkerId: 'xfyun:xophunyuan7bmt'  // 可选
 *   }
 */

class LanePoolDispatcher {
  /**
   * @param {{
   *   workers: Array<{
   *     id: string,
   *     provider?: string,
   *     name?: string,
   *     maxLanes: number,
   *     batchSize?: number,
   *     priority?: number,
   *     callBatch: (prompt: string, expectedCount: number) => Promise<string[]>,
   *     callSingle?: (prompt: string) => Promise<string>
   *   }>,
   *   onWaveDone?: (info: object) => Promise<void> | void,
   *   onBatchDone?: (info: object) => Promise<void> | void,
   *   onBatchError?: (info: object) => void,
   *   verbose?: boolean
   * }} opts
   */
  constructor(opts = {}) {
    /** @type {Array<object>} */
    this.workers = (opts.workers || []).slice().sort(
      (a, b) => (a.priority || 99) - (b.priority || 99)
    );

    /** @type {Map<string, number>} 每个 worker 的当前 in-flight 数 */
    this.inflight = new Map();
    /** @type {Map<string, number>} 每个 worker 的已完成批次数 */
    this.completed = new Map();
    /** @type {Map<string, number>} 每个 worker 的失败批次数 */
    this.failed = new Map();

    for (const w of this.workers) {
      this.inflight.set(w.id, 0);
      this.completed.set(w.id, 0);
      this.failed.set(w.id, 0);
    }

    this.onWaveDone = opts.onWaveDone || null;
    this.onBatchDone = opts.onBatchDone || null;
    this.onBatchError = opts.onBatchError || null;
    this.verbose = opts.verbose !== false;

    this._totalBatches = 0;
    this._completedBatches = 0;
    this._failedBatches = 0;
    this._waveNo = 0;
    this._startedAt = null;
    this._endedAt = null;
  }

  /**
   * 启动调度器
   * @param {Array<object>} initialBatches - 初始就绪批次队列
   * @returns {Promise<{ stats: object }>}
   */
  async run(initialBatches) {
    this._startedAt = Date.now();
    this._totalBatches = (initialBatches || []).length;

    /** @type {Array<{ batch: object, promise: Promise, workerId: string }>} */
    const flying = [];
    /** @type {Array<object>} */
    const ready = [...(initialBatches || [])];

    // 为每个 batch 预分配 preferred worker（若未指定则按优先级轮询）
    this._assignPreferredWorkers(ready);

    // 初始填充：每个 worker 打满 lanes
    this._fillLanes(ready, flying);

    // 主循环
    while (flying.length > 0 || ready.length > 0) {
      // 尝试将 ready 中的批次补入空闲 lane
      this._fillLanes(ready, flying);

      if (flying.length === 0 && ready.length === 0) break;

      this._waveNo += 1;
      const waveStart = Date.now();
      if (this.verbose) {
        const laneUsage = this._renderLaneUsage();
        console.log(
          `\n[Lane 波次 ${this._waveNo}] 飞行=${flying.length} 就绪=${ready.length}` +
          ` 总路数=${this.totalLanes} 在用=${this._activeLanes()}` +
          (laneUsage ? `\n  路利用: ${laneUsage}` : '')
        );
      }

      // 等待任意一个批次完成
      const finished = await Promise.race(flying.map((f) => f.promise));
      const idx = flying.findIndex((f) => f.promise === finished.promise);
      if (idx >= 0) {
        const { batch, workerId, promise: _p } = flying[idx];
        flying.splice(idx, 1);

        // 释放该 worker 的一个 lane
        const cur = this.inflight.get(workerId) || 1;
        this.inflight.set(workerId, Math.max(0, cur - 1));

        if (finished.ok) {
          this._completedBatches += 1;
          this.completed.set(workerId, (this.completed.get(workerId) || 0) + 1);
          if (this.onBatchDone) {
            await this.onBatchDone({
              batch,
              workerId,
              result: finished.result,
              waveNo: this._waveNo,
              waveElapsed: Date.now() - waveStart
            });
          }
          // 动态入队
          if (Array.isArray(finished.enqueue) && finished.enqueue.length > 0) {
            this._totalBatches += finished.enqueue.length;
            const newBatches = finished.enqueue;
            this._assignPreferredWorkers(newBatches);
            ready.push(...newBatches);
            if (this.verbose) {
              console.log(`  ➕ 动态入队 ${newBatches.length} 个后续批次（就绪=${ready.length}）`);
            }
          }
        } else {
          this._failedBatches += 1;
          this.failed.set(workerId, (this.failed.get(workerId) || 0) + 1);
          if (this.onBatchError) {
            this.onBatchError({
              batch,
              workerId,
              error: finished.error,
              waveNo: this._waveNo
            });
          }
          console.error(`  ❌ [${batch.unitId || batch.kind}] ${workerId} 失败: ${finished.error || 'unknown'}`);
          // 失败后重新入队（最多重试 1 次，换 worker）
          if (!batch._retried) {
            batch._retried = true;
            batch._preferredWorkerId = this._pickFallbackWorker(workerId);
            ready.push(batch);
          }
        }
      }

      // 波次完成回调
      if (this.onWaveDone && flying.length === 0 && ready.length === 0) {
        await this.onWaveDone({
          waveNo: this._waveNo,
          activeLanes: this._activeLanes(),
          totalLanes: this.totalLanes,
          completedBatches: this._completedBatches,
          failedBatches: this._failedBatches
        });
      }
    }

    this._endedAt = Date.now();
    return { stats: this.stats };
  }

  /**
   * 填满所有有空位的 lane
   */
  _fillLanes(ready, flying) {
    let assigned = true;
    while (assigned) {
      assigned = false;
      for (const worker of this.workers) {
        const cur = this.inflight.get(worker.id) || 0;
        if (cur >= (worker.maxLanes || 1)) continue;

        // 优先找 preferred 该 worker 的批次
        let batchIdx = ready.findIndex(
          (b) => (b._preferredWorkerId || b.preferredWorkerId) === worker.id
        );
        // 若没有 preferred 的，取就绪队列第一个
        if (batchIdx < 0) batchIdx = 0;
        if (batchIdx >= ready.length) continue;

        const batch = ready.splice(batchIdx, 1)[0];
        const assignedWorkerId = worker.id;
        this.inflight.set(assignedWorkerId, cur + 1);

        const promise = this._executeBatch(batch, worker, assignedWorkerId);
        flying.push({ batch, promise, workerId: assignedWorkerId });
        assigned = true;
        break; // 重新扫描 worker 列表，保证 priority 高的先抢
      }
    }
  }

  /**
   * 执行为一个批次分配 preferred worker
   */
  _assignPreferredWorkers(batches) {
    if (this.workers.length === 0) return;
    let idx = 0;
    for (const batch of batches) {
      // 如果已指定 preferred 则保留
      if (batch._preferredWorkerId || batch.preferredWorkerId) continue;
      // 按优先级轮询分配
      const w = this.workers[idx % this.workers.length];
      batch._preferredWorkerId = w.id;
      idx += 1;
    }
  }

  /**
   * 执行单个批次（调用 worker.callBatch）
   */
  async _executeBatch(batch, worker, assignedWorkerId) {
    try {
      const prompt = batch._prompt || batch.prompt || '';
      const expectedCount = (batch.items || batch.entries || []).length || 1;
      const result = await worker.callBatch(prompt, expectedCount);
      if (this.verbose) {
        console.log(
          `  ✅ [${batch.unitId || batch.kind}] ${assignedWorkerId} · ${expectedCount} 条`
        );
      }
      return {
        ok: true,
        result,
        enqueue: batch._enqueue || batch.enqueue || [],
        batch,
        promise: null
      };
    } catch (err) {
      return {
        ok: false,
        error: err && err.message ? err.message : String(err),
        enqueue: [],
        batch,
        promise: null
      };
    }
  }

  /**
   * 失败时选一个不同于当前 worker 的备选
   */
  _pickFallbackWorker(failedWorkerId) {
    const others = this.workers.filter((w) => w.id !== failedWorkerId);
    if (others.length === 0) return this.workers[0]?.id || failedWorkerId;
    return others[0].id;
  }

  /** 当前活跃 lane 数 */
  _activeLanes() {
    let total = 0;
    for (const v of this.inflight.values()) total += v;
    return total;
  }

  /** 打印路利用率 */
  _renderLaneUsage() {
    return this.workers
      .filter((w) => (this.inflight.get(w.id) || 0) > 0)
      .map((w) => `${w.id.split(':').pop()}=${this.inflight.get(w.id)}/${w.maxLanes}`)
      .join(' ');
  }

  /** 总路数（所有 worker 的 maxLanes 之和） */
  get totalLanes() {
    return this.workers.reduce((sum, w) => sum + (w.maxLanes || 1), 0);
  }

  /** 运行统计 */
  get stats() {
    const elapsed = (this._endedAt || Date.now()) - (this._startedAt || Date.now());
    return {
      totalBatches: this._totalBatches,
      completedBatches: this._completedBatches,
      failedBatches: this._failedBatches,
      totalLanes: this.totalLanes,
      waves: this._waveNo,
      elapsedMs: elapsed,
      elapsedMin: (elapsed / 60000).toFixed(2),
      perWorker: this.workers.map((w) => ({
        id: w.id,
        maxLanes: w.maxLanes,
        completed: this.completed.get(w.id) || 0,
        failed: this.failed.get(w.id) || 0
      }))
    };
  }
}

module.exports = { LanePoolDispatcher };
