/**
 * CSV词条批量翻译脚本
 * 集成所有功能：术语库提取、批量翻译、验证、CSV输出
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const iconv = require('iconv-lite');
const { extractGlossaryData, generateTranslationRules } = require('./extractGlossary');
const {
  listSiliconTranslateModels,
  parseModelsList,
  resolveSiliconModelId,
  SILICONFLOW_MODELS,
  findModelById,
  isEn2RuEchoOnlyModel,
  EN2RU_ECHO_ONLY_LIMIT
} = require('./lib/modelCatalog');
const {
  stripEn2RuEnglishGlossParen,
  extractResidualEnglishSpans,
  collectUniqueResidualTerms,
  applyTermDecisionsToRussian,
  hasEnglishGlossParen,
  parseTermDecideResponse
} = require('./lib/en2ruResidualEnglish');
const {
  loadTermDecisionCache,
  saveTermDecisionCache,
  decideMissingTermsWithLlm
} = require('./lib/en2ruTermDecide');
const {
  loadEntryKeepCache,
  saveEntryKeepCache,
  collectUniqueEntryKeepCandidates,
  decideMissingEntryKeepWithLlm,
  isEntryKeepByCache,
  isEntryKeepDecideCandidate
} = require('./lib/entryKeepDecide');

/** 企业网关/自签证书场景：默认跳过 TLS 校验（可用 TRANSLATE_TLS_INSECURE=0 关闭） */
const TLS_INSECURE = !['0', 'false', 'no', 'off'].includes(
  String(process.env.TRANSLATE_TLS_INSECURE === undefined ? '1' : process.env.TRANSLATE_TLS_INSECURE).toLowerCase()
);
const HTTPS_AGENT = new https.Agent({ rejectUnauthorized: !TLS_INSECURE });

function axiosRequestConfig(extra = {}) {
  return {
    httpsAgent: HTTPS_AGENT,
    ...extra
  };
}

function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(message) {
  const msg = String(message || '');
  return /ECONNRESET|ETIMEDOUT|ECONNABORTED|ENOTFOUND|EAI_AGAIN|socket hang up|timeout|certificate|CERT|TLS|network/i.test(msg);
}

/** 串行闸门：保证智谱同一时刻最多 1 路请求 */
function createSerialGate() {
  let tail = Promise.resolve();
  return function runSerial(fn) {
    const run = tail.then(() => fn());
    // 不让失败阻断后续排队任务
    tail = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  };
}

const runZhipuSerial = createSerialGate();

/**
 * 讯飞全局并发硬顶 20（zh2en/en2ru/pipeline 共用一池）；可用 XFYUN_CONCURRENCY 下调
 */
function getXfyunConcurrency() {
  const raw = parseInt(process.env.XFYUN_CONCURRENCY || '20', 10);
  const n = Number.isFinite(raw) ? raw : 20;
  return Math.min(20, Math.max(1, n));
}

/**
 * 把 items 按 size 切成若干批
 * @template T
 * @param {T[]} items
 * @param {number} size
 * @returns {T[][]}
 */
function chunkArray(items, size) {
  const out = [];
  const n = Math.max(1, size || 1);
  for (let i = 0; i < items.length; i += n) {
    out.push(items.slice(i, i + n));
  }
  return out;
}

/**
 * DAG 就绪队列调度：无依赖任务并行；worker 可返回 enqueue 动态入队（如 zh2en 完成后投递 en2ru）
 * 讯飞池自适应：失败减半，连续成功回升；硬顶 maxConcurrency≤20
 *
 * @param {{
 *   initialReady: object[],
 *   maxConcurrency: number,
 *   worker: (unit: object) => Promise<{ ok: boolean, reduceConcurrency?: boolean, enqueue?: object[] }>,
 *   onWaveDone?: (info: object) => Promise<void>|void
 * }} opts
 */
async function runDagScheduler(opts) {
  const maxConcurrency = Math.min(20, Math.max(1, opts.maxConcurrency || 1));
  let concurrency = maxConcurrency;
  let successStreak = 0;
  let waveNo = 0;
  let completedUnits = 0;
  const ready = Array.isArray(opts.initialReady) ? [...opts.initialReady] : [];
  /** @type {Map<number, Promise<{ id: number, result: any }>>} */
  const inflight = new Map();
  let nextId = 0;

  const launch = (unit) => {
    const id = ++nextId;
    const promise = Promise.resolve()
      .then(() => opts.worker(unit))
      .then(
        (result) => ({
          id,
          result: {
            ok: !!(result && result.ok),
            reduceConcurrency: !!(result && result.reduceConcurrency),
            enqueue: (result && result.enqueue) || []
          }
        }),
        (err) => ({
          id,
          result: {
            ok: false,
            reduceConcurrency: true,
            enqueue: [],
            error: err
          }
        })
      );
    inflight.set(id, promise);
  };

  while (ready.length > 0 || inflight.size > 0) {
    while (inflight.size < concurrency && ready.length > 0) {
      launch(ready.shift());
    }
    if (inflight.size === 0) break;

    waveNo += 1;
    const waveTarget = Math.min(concurrency, inflight.size);
    console.log(
      `\n[DAG波次 ${waveNo}] 在途=${inflight.size} 就绪=${ready.length} 当前并发上限=${concurrency}`
    );

    let waveFailed = 0;
    let waveDone = 0;
    while (waveDone < waveTarget && inflight.size > 0) {
      const { id, result } = await Promise.race(inflight.values());
      inflight.delete(id);
      waveDone += 1;
      completedUnits += 1;

      if (result.error) {
        console.error(`  ❌ 工作单元异常: ${result.error.message || result.error}`);
      }
      if (!result.ok || result.reduceConcurrency) waveFailed += 1;
      if (Array.isArray(result.enqueue) && result.enqueue.length > 0) {
        ready.push(...result.enqueue);
        console.log(`  ➕ 动态入队 ${result.enqueue.length} 个后续单元（就绪队列=${ready.length}）`);
      }

      // 空出的槽位立刻补齐，保持池打满
      while (inflight.size < concurrency && ready.length > 0) {
        launch(ready.shift());
      }
    }

    if (waveFailed > 0) {
      const prev = concurrency;
      concurrency = Math.max(1, Math.floor(concurrency / 2));
      successStreak = 0;
      if (concurrency < prev) {
        console.log(`  ⚠️ 波次失败 ${waveFailed}，并发 ${prev} → ${concurrency}`);
      }
    } else {
      successStreak += 1;
      if (successStreak >= 3 && concurrency < maxConcurrency) {
        const prev = concurrency;
        concurrency = Math.min(maxConcurrency, concurrency + 1);
        successStreak = 0;
        if (concurrency > prev) {
          console.log(`  ↑ 连续成功，并发 ${prev} → ${concurrency}`);
        }
      }
    }

    if (typeof opts.onWaveDone === 'function') {
      await opts.onWaveDone({
        waveNo,
        concurrency,
        failedCount: waveFailed,
        completedUnits,
        readySize: ready.length,
        inflightSize: inflight.size
      });
    }
  }
}

// ==================== Prompt模板（外部markdown） ====================

const PROMPT_TEMPLATE_DIR = path.join(__dirname, 'prompts');
const PROMPT_TEMPLATES = {
  single: 'prompt-single.md',
  batch: 'prompt-batch.md',
  'single-en2ru': 'prompt-single-en2ru.md',
  'batch-en2ru': 'prompt-batch-en2ru.md',
  'batch-zh2ru': 'prompt-batch-zh2ru.md'
};

/** 翻译模式：zh2en | en2ru | pipeline | dual（词条→英/俄并发，共用讯飞池） */
const MODES = {
  zh2en: {
    id: 'zh2en',
    sourceCol: '词条',
    targetCol: '英文翻译',
    skipIfFilled: false,
    // 并发池下单批过大易超时；与 en2ru 共用全局限额
    batchSize: 100,
    useGlossary: true,
    stages: ['zh2en']
  },
  en2ru: {
    id: 'en2ru',
    sourceCol: '词条',
    targetCol: '俄文翻译',
    skipIfFilled: true,
    // 100 条易触发讯飞超时 / 智谱断连；40 条更稳，便于断点续跑；Busy 时可临时降到 10
    batchSize: 40,
    useGlossary: false,
    sourceFallbackCol: '英文翻译',
    stages: ['en2ru']
  },
  pipeline: {
    id: 'pipeline',
    sourceCol: '词条',
    targetCol: '俄文翻译',
    skipIfFilled: true,
    batchSize: 40,
    batchSizeZh2en: 100,
    batchSizeEn2ru: 40,
    useGlossary: true,
    sourceFallbackCol: '英文翻译',
    stages: ['zh2en', 'en2ru']
  },
  dual: {
    id: 'dual',
    sourceCol: '词条',
    targetCol: '俄文翻译',
    skipIfFilled: true,
    batchSize: 40,
    batchSizeZh2en: 100,
    batchSizeZh2ru: 20,
    useGlossary: true,
    stages: ['zh2en', 'zh2ru']
  }
};

const TRANSLATOR_SYSTEM =
  '你是一个专业的翻译助手。请严格按用户消息中的翻译方向与格式要求输出，不要添加解释。';

const _promptTemplateCache = new Map();

function loadPromptTemplate(templateName) {
  const filename = PROMPT_TEMPLATES[templateName];
  if (!filename) {
    throw new Error(`未知prompt模板: ${templateName}`);
  }
  const fullPath = path.join(PROMPT_TEMPLATE_DIR, filename);
  if (_promptTemplateCache.has(fullPath)) {
    return _promptTemplateCache.get(fullPath);
  }
  if (!fs.existsSync(fullPath)) {
    throw new Error(`prompt模板文件不存在: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  _promptTemplateCache.set(fullPath, content);
  return content;
}

/**
 * 简单模板渲染：把 {{VAR}} 替换为 vars.VAR（不做复杂语法）
 * @param {string} template
 * @param {Record<string,string>} vars
 * @returns {string}
 */
function renderTemplate(template, vars = {}) {
  let out = String(template || '');
  for (const [k, v] of Object.entries(vars)) {
    const key = String(k);
    const value = (v === null || v === undefined) ? '' : String(v);
    out = out.split(`{{${key}}}`).join(value);
  }
  // 未提供的变量，替换为空（避免残留 {{XXX}}）
  out = out.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
  return out;
}

// ==================== 步骤1: 术语库提取 ====================

/**
 * 提取术语库（如果需要）
 * @param {string} excelPath - Excel文件路径
 * @param {string} rulesPath - 翻译规则文档路径
 */
async function ensureGlossaryExtracted(excelPath, rulesPath, forceReExtract = false) {
  if (forceReExtract) {
    console.log('强制重新提取术语库...');
  } else if (fs.existsSync(rulesPath)) {
    console.log('翻译规则文档已存在，跳过提取');
    return;
  }

  // 如果rulesPath不存在，或者强制重新提取，则执行提取
  if (forceReExtract || !fs.existsSync(rulesPath)) {
    console.log(`正在从Excel文件提取术语库: ${excelPath} ...`);
    const { abbreviationData, fullTranslationData } = extractGlossaryData(excelPath);
    generateTranslationRules(abbreviationData, fullTranslationData, rulesPath);
  } else {
    // 不会走到这里，上面的if已经覆盖
  }
}

// ==================== 步骤2: 加载翻译规则 ====================

/**
 * 解析markdown表格
 * @param {string} markdown - markdown内容
 * @param {string} sectionName - 章节名称
 * @returns {Array} 表格数据
 */
function parseMarkdownTable(markdown, sectionName) {
  const lines = markdown.split('\n');
  const result = [];
  let inSection = false;
  let inTable = false;

  for (const line of lines) {
    // 检测章节
    if (line.includes(sectionName)) {
      inSection = true;
      continue;
    }

    // 检测表格开始
    if (inSection && line.trim().startsWith('|')) {
      inTable = true;
      // 跳过表头分隔行
      if (line.includes('---')) continue;
    }

    // 检测下一个章节，结束当前表格
    if (inTable && line.trim().startsWith('##')) {
      break;
    }

    // 解析表格行
    if (inTable && line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2) {
        result.push(cells);
      }
    }
  }

  return result;
}

/**
 * 加载翻译规则
 * @param {string} rulesPath - 翻译规则文档路径
 * @returns {Object} 包含映射表和规则的对象
 */
function loadTranslationRules(rulesPath) {
  console.log(`正在加载翻译规则: ${rulesPath}`);

  if (!fs.existsSync(rulesPath)) {
    throw new Error(`翻译规则文档不存在: ${rulesPath}`);
  }

  const markdown = fs.readFileSync(rulesPath, 'utf8');

  // 解析翻译简写说明
  // 注意：markdown 表格来自 Excel "翻译简写说明" sheet
  // Excel 列结构：序号(A) | 中文(B) | 英文(C) | 英文缩写(D) | 西语翻译(E)
  // markdown 表格只包含：中文 | 英文缩写
  const abbreviationRows = parseMarkdownTable(markdown, '翻译简写说明');
  const abbreviationMap = new Map();
  for (const row of abbreviationRows) {
    if (row.length >= 2) {
      const chinese = row[0].trim();
      const english = row[1].trim();
      if (chinese && english) {
        abbreviationMap.set(chinese, english);
      }
    }
  }

  // 解析注意要点_中英
  const fullTranslationRows = parseMarkdownTable(markdown, '注意要点_中英');
  const fullTranslationMap = new Map();
  for (const row of fullTranslationRows) {
    if (row.length >= 2) {
      const chinese = row[0].trim();
      const english = row[1].trim();
      if (chinese && english) {
        fullTranslationMap.set(chinese, english);
      }
    }
  }

  // 解析伪代码术语详细说明
  const pseudoCodeRules = [];
  const pseudoCodeRuleMap = new Map();
  const lines = markdown.split('\n');
  let inPseudoCodeSection = false;
  let currentRule = null;
  let currentRawMarkdown = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测伪代码术语区块开始
    if (line.includes('### 伪代码术语详细说明')) {
      inPseudoCodeSection = true;
      continue;
    }

    // 检测区块结束（遇到下一个标题）
    if (inPseudoCodeSection && (line.trim().startsWith('##') || line.trim().startsWith('# '))) {
      // 保存最后一个规则
      if (currentRule) {
        currentRule.rawMarkdown = currentRawMarkdown.join('\n');
        pseudoCodeRules.push(currentRule);
        pseudoCodeRuleMap.set(currentRule.chinese, currentRule);
      }
      break;
    }

    // 解析伪代码术语条目
    if (inPseudoCodeSection && line.trim().startsWith('- **')) {
      // 保存上一个规则
      if (currentRule) {
        currentRule.rawMarkdown = currentRawMarkdown.join('\n');
        pseudoCodeRules.push(currentRule);
        pseudoCodeRuleMap.set(currentRule.chinese, currentRule);
      }

      // 解析新规则：- **中文**: 英文 - 备注
      const match = line.match(/^-\s+\*\*([^*]+)\*\*:\s+([^-]+)(?:\s+-\s+(.+))?$/);
      if (match) {
        currentRule = {
          chinese: match[1].trim(),
          english: match[2].trim(),
          note: match[3] ? match[3].trim() : ''
        };
        currentRawMarkdown = [line];
      }
    } else if (inPseudoCodeSection && currentRule && line.trim()) {
      // 继续收集当前规则的内容（多行备注等）
      currentRawMarkdown.push(line);
    }
  }

  // 保存最后一个规则（如果有）
  if (currentRule && inPseudoCodeSection) {
    currentRule.rawMarkdown = currentRawMarkdown.join('\n');
    pseudoCodeRules.push(currentRule);
    pseudoCodeRuleMap.set(currentRule.chinese, currentRule);
  }

  console.log(`加载完成: 缩写 ${abbreviationMap.size} 条, 完整翻译 ${fullTranslationMap.size} 条, 伪代码术语 ${pseudoCodeRules.length} 条`);

  return {
    abbreviationMap,
    fullTranslationMap,
    pseudoCodeRules,
    pseudoCodeRuleMap
  };
}

// ==================== 翻译规则（从xlsx加载，用于prompt增强） ====================

/**
 * 从术语库Excel的 sheet「翻译规则」读取“额外翻译规则”，拼成 markdown 段落注入 prompt
 * 设计目标：
 * - 让规则更新只改 Excel，不改代码/markdown
 * - 规则文本尽量原样保留，避免误解释
 *
 * 期望表格结构（宽松兼容）：
 * - 每行至少 1 列：规则正文
 * - 第 2 列可选：备注/原因/示例
 *
 * @param {string} excelPath
 * @returns {string} markdown（可能为空字符串）
 */
function loadExcelTranslationRulesMarkdown(excelPath) {
  if (!excelPath) return '';
  if (!fs.existsSync(excelPath)) return '';

  let wb;
  try {
    wb = XLSX.readFile(excelPath);
  } catch (e) {
    return '';
  }

  const sheetName = (wb.SheetNames || []).find(n => String(n || '').includes('翻译规则')) || '翻译规则';
  const ws = wb.Sheets && wb.Sheets[sheetName];
  if (!ws) return '';

  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
  if (!aoa || aoa.length === 0) return '';

  // 过滤空行
  const rows = aoa
    .map((r) => (Array.isArray(r) ? r : []))
    .map((r) => r.map((c) => String(c || '').trim()))
    .filter((r) => r.some((c) => c));

  if (rows.length === 0) return '';

  // 若首行看起来像表头（例如：单元格内容就是“规则/备注/原因/说明/示例”这种），则跳过
  // 注意：不要用“包含原因/说明”等做判断，否则像“……原因：xxx”这样的真实规则会被误判为表头
  const headerSet = new Set(['规则', '备注', '原因', '说明', '示例']);
  const firstRowCells = (rows[0] || []).filter(Boolean).map((c) => String(c).trim());
  const headerLike = firstRowCells.length > 0 && firstRowCells.every((c) => {
    const normalized = c.replace(/[：:]/g, '').trim();
    return headerSet.has(normalized);
  });
  const dataRows = headerLike ? rows.slice(1) : rows;
  if (dataRows.length === 0) return '';

  const blocks = [];
  for (const r of dataRows) {
    const rule = String(r[0] || '').trim();
    const note = String(r[1] || '').trim();
    if (!rule) continue;
    if (note) {
      blocks.push(`- ${rule}\n  - 备注：${note}`);
    } else {
      blocks.push(`- ${rule}`);
    }
  }

  if (blocks.length === 0) return '';

  return `## 额外翻译规则（来自Excel：翻译规则 sheet）\n${blocks.join('\n')}\n`;
}

// ==================== comment场景规则（从xlsx加载） ====================

/**
 * 加载 comment 场景规则（comment对应场景及规则.xlsx）
 * @param {string} excelPath
 * @returns {Map<string, { comment: string, source: string, scene: string, tips: string, caseType?: 'SentenceCase' | 'TitleCase' }>}
 */
function loadCommentScenarioRules(excelPath) {
  const map = new Map();
  if (!excelPath) return map;
  if (!fs.existsSync(excelPath)) {
    throw new Error(`comment规则Excel不存在: ${excelPath}`);
  }

  const wb = XLSX.readFile(excelPath);
  const sheetName = wb.SheetNames.find(n => String(n).toLowerCase().includes('comment')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  if (!aoa || aoa.length < 2) return map;

  // 期望表头：comment, 词条来源, 场景, 翻译补充要点/规则
  const header = (aoa[0] || []).map(x => String(x || '').trim());
  const idxComment = header.findIndex(h => h === 'comment' || h.toLowerCase() === 'comment');
  const idxSource = header.findIndex(h => h === '词条来源');
  const idxScene = header.findIndex(h => h === '场景');
  // 兼容旧表头“翻译补充要点”和新表头“规则”
  let idxTips = header.findIndex(h => h === '翻译补充要点');
  if (idxTips === -1) {
    idxTips = header.findIndex(h => h === '规则');
  }

  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const comment = String(row[idxComment] || '').trim();
    const source = String(row[idxSource] || '').trim();
    const scene = String(row[idxScene] || '').trim();
    const tips = String(row[idxTips] || '').trim();
    if (!comment) continue;
    // 解析大小写规则类型（SentenceCase / TitleCase）
    const mergedText = `${scene}\n${tips}`.toLowerCase();
    let caseType;
    const hasSentence =
      mergedText.includes('sentence case') ||
      mergedText.includes('第一个单词首字母大写') ||
      mergedText.includes('首个单词首字母大写');
    const hasTitle =
      mergedText.includes('title case') ||
      mergedText.includes('每个单词首字母都要大写') ||
      mergedText.includes('每个单词首字母大写');
    if (hasSentence && !hasTitle) {
      caseType = 'SentenceCase';
    } else if (hasTitle && !hasSentence) {
      caseType = 'TitleCase';
    } else {
      caseType = undefined;
    }

    map.set(comment, { comment, source, scene, tips, caseType });
  }

  return map;
}

/**
 * 将 comment 规则条目转为 markdown（用于喂给模型）
 * @param {{ comment: string, source: string, scene: string, tips: string }} rule
 * @returns {string}
 */
function formatCommentRuleToMarkdown(rule) {
  if (!rule) return '';
  const parts = [];
  parts.push(`- **comment**: \`${rule.comment}\``);
  if (rule.source) {
    parts.push(`  - **词条来源**: ${rule.source}`);
  }
  if (rule.scene) {
    const sceneLines = String(rule.scene)
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (sceneLines.length > 0) {
      parts.push('  - **场景**:');
      for (const line of sceneLines) {
        // 保留行内原有的“1.”、“2.”等编号，仅作为列表展示
        parts.push(`    - ${line}`);
      }
    }
  }
  if (rule.tips) {
    // tips 中通常是“1.xxx / 2.xxx”多行规则，这里统一整理成“规则”列表，提升可读性
    const tipLines = String(rule.tips)
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (tipLines.length > 0) {
      parts.push('  - **规则**:');
      for (const line of tipLines) {
        parts.push(`    - ${line}`);
      }
    }
  }
  return parts.join('\n');
}

/**
 * 从 CSV 的 comment 字段提取 comment key（支持多值分隔）
 * @param {string} commentValue
 * @returns {string[]}
 */
function parseCommentKeys(commentValue) {
  const raw = String(commentValue || '').trim();
  if (!raw) return [];
  // 常见分隔符：逗号/分号/中文逗号/换行
  const keys = raw.split(/[;,，\n]+/g).map(s => s.trim()).filter(Boolean);
  // 去重但保序
  const seen = new Set();
  const out = [];
  for (const k of keys) {
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

/**
 * 从 comment / tag 两个字段统一抽取 comment-like key
 * @param {string} commentValue
 * @param {string} tagValue
 * @returns {{ keys: string[], meta: Map<string, { fromComment: boolean, fromTag: boolean }> }}
 */
function extractCommentLikeKeys(commentValue, tagValue) {
  const commentKeys = parseCommentKeys(commentValue);
  const tagKeys = parseCommentKeys(tagValue);

  const keys = [];
  const meta = new Map();

  // 先处理 comment 字段中的 key，保序去重
  for (const k of commentKeys) {
    if (!meta.has(k)) {
      keys.push(k);
      meta.set(k, { fromComment: true, fromTag: false });
    } else {
      const info = meta.get(k);
      info.fromComment = true;
      meta.set(k, info);
    }
  }

  // 再处理 tag 字段中的 key，同样去重，并记录来源
  for (const k of tagKeys) {
    if (!meta.has(k)) {
      keys.push(k);
      meta.set(k, { fromComment: false, fromTag: true });
    } else {
      const info = meta.get(k);
      info.fromTag = true;
      meta.set(k, info);
    }
  }

  return { keys, meta };
}

/**
 * 为某个词条生成 comment 场景规则 markdown（可能为空）
 * @param {string} commentValue - CSV中的 comment 字段值
 * @param {Map<string, any>} commentRuleMap
 * @returns {string}
 */
function buildCommentRulesSectionMarkdown(commentValue, commentRuleMap, tagValue = '') {
  const { keys, meta } = extractCommentLikeKeys(commentValue, tagValue);
  if (keys.length === 0) return '';
  const blocks = [];
  for (const key of keys) {
    const rule = commentRuleMap && commentRuleMap.get(key);
    if (rule) {
      let block = formatCommentRuleToMarkdown(rule);
      const info = meta && meta.get(key);
      if (info && (info.fromComment || info.fromTag)) {
        const sources = [];
        if (info.fromComment) sources.push('comment');
        if (info.fromTag) sources.push('tag');
        block += `\n  - **出现字段**: ${sources.join(' & ')}`;
      }
      blocks.push(block);
    } else {
      const info = meta && meta.get(key);
      const sources = [];
      if (info && info.fromComment) sources.push('comment');
      if (info && info.fromTag) sources.push('tag');
      const sourceLabel = sources.length > 0 ? `；来源: ${sources.join(' & ')}` : '';
      blocks.push(`- **comment**: \`${key}\`（未在 comment对应场景及规则.xlsx 的 comment 列中找到对应条目${sourceLabel}）`);
    }
  }
  if (blocks.length === 0) return '';
  return `## comment 场景规则（来自 comment对应场景及规则.xlsx）\n\n${blocks.join('\n\n')}\n`;
}

/**
 * 检查 comment/tag 字段中是否存在“trim 后才能命中规则”的可疑写法
 * 仅在以下场景追加提示：
 * - 原始片段包含首尾空格（segment !== segment.trim()）
 * - 去掉首尾空格后的值能在 comment 规则表中命中
 *
 * @param {Object} entry - 原始CSV行对象
 * @param {Map<string, any>} commentRuleMap
 * @returns {{ note1Issues: string[] }}
 */
function detectCommentTagTrimMatchIssues(entry, commentRuleMap) {
  const note1Issues = [];
  if (!entry || !commentRuleMap || commentRuleMap.size === 0) {
    return { note1Issues };
  }

  /**
   * 针对单个字段执行检测
   * @param {string} fieldName - 'comment' 或 'tag'
   */
  function checkField(fieldName) {
    const rawVal = entry[fieldName];
    if (rawVal === undefined || rawVal === null) return;
    const raw = String(rawVal);
    if (!raw) return;

    // 按与 parseCommentKeys 相同的分隔符拆分，但不对片段做 trim
    const segments = raw.split(/[;,，\n]+/g);
    const seen = new Set();

    for (const seg of segments) {
      if (!seg) continue;
      const trimmed = seg.trim();
      if (!trimmed) continue;
      if (seg === trimmed) continue; // 没有首尾空格，不属于本次关注范围

      const dedupeKey = `${fieldName}::${seg}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      if (!commentRuleMap.has(trimmed)) {
        // trim 后也无法命中规则表：不提示，避免把“本来就没有规则的 key”当成问题
        continue;
      }

      note1Issues.push(
        `${fieldName} 值 '${seg}' 去掉首尾空格后可命中规则 '${trimmed}'，请检查是否多写了空格`
      );
    }
  }

  checkField('comment');
  checkField('tag');

  return { note1Issues };
}

/**
 * 为规则生成稳定的签名，用于比较“规则内容是否一致”
 * @param {{ comment?: string, source?: string, scene?: string, tips?: string }} rule
 * @returns {string}
 */
function buildCommentRuleSignature(rule) {
  if (!rule) return '';
  const norm = (v) => String(v || '').replace(/\r\n/g, '\n').trim();
  // 注意：不包含 key 本身（rule.comment）也可以，但带上更利于排查
  return JSON.stringify({
    comment: norm(rule.comment),
    source: norm(rule.source),
    scene: norm(rule.scene),
    tips: norm(rule.tips)
  });
}

/**
 * 检测：comment 与 tag 同时命中规则，且两边命中的规则内容不一致
 * @param {Object} entry - 原始CSV行对象
 * @param {Map<string, any>} commentRuleMap
 * @returns {{ note1Issues: string[] }}
 */
function detectCommentTagRuleConflict(entry, commentRuleMap) {
  const note1Issues = [];
  if (!entry || !commentRuleMap || commentRuleMap.size === 0) {
    return { note1Issues };
  }

  const rawComment = entry['comment'];
  const rawTag = entry['tag'];
  const commentValue = rawComment !== undefined && rawComment !== null ? String(rawComment) : '';
  const tagValue = rawTag !== undefined && rawTag !== null ? String(rawTag) : '';

  const { keys, meta } = extractCommentLikeKeys(commentValue, tagValue);
  if (!keys || keys.length === 0) {
    return { note1Issues };
  }

  const commentSigs = new Set();
  const tagSigs = new Set();
  const commentKeys = [];
  const tagKeys = [];

  for (const key of keys) {
    if (!commentRuleMap.has(key)) continue;
    const rule = commentRuleMap.get(key);
    const sig = buildCommentRuleSignature(rule);
    if (!sig) continue;

    const info = meta && meta.get(key);
    if (info && info.fromComment) {
      commentSigs.add(sig);
      commentKeys.push(key);
    }
    if (info && info.fromTag) {
      tagSigs.add(sig);
      tagKeys.push(key);
    }
  }

  // 两边都没有命中规则 → 不冲突
  if (commentSigs.size === 0 || tagSigs.size === 0) {
    return { note1Issues };
  }

  // 集合相等判断：只要存在任意一边独有 signature 就视为冲突
  let hasDiff = false;
  for (const s of commentSigs) {
    if (!tagSigs.has(s)) {
      hasDiff = true;
      break;
    }
  }
  if (!hasDiff) {
    for (const s of tagSigs) {
      if (!commentSigs.has(s)) {
        hasDiff = true;
        break;
      }
    }
  }

  if (hasDiff) {
    const cKeys = Array.from(new Set(commentKeys)).join(', ');
    const tKeys = Array.from(new Set(tagKeys)).join(', ');
    note1Issues.push(
      `comment/tag 规则冲突：comment 与 tag 同时命中规则，但规则内容不一致；请检查配置是否正确（comment keys: ${cKeys || '-'}；tag keys: ${tKeys || '-'}）`
    );
  }

  return { note1Issues };
}

/**
 * 计算某条词条在 comment/tag 规则下的大小写约束类型
 * @param {Object} entry - 原始CSV行对象
 * @param {Map<string, any>} commentRuleMap
 * @returns {{ caseType: 'SentenceCase' | 'TitleCase' | null, hasConflict: boolean }}
 */
function getCaseTypeForEntry(entry, commentRuleMap) {
  if (!entry || !commentRuleMap || commentRuleMap.size === 0) {
    return { caseType: null, hasConflict: false };
  }

  const rawComment = entry['comment'];
  const rawTag = entry['tag'];
  const commentValue = rawComment !== undefined && rawComment !== null ? String(rawComment) : '';
  const tagValue = rawTag !== undefined && rawTag !== null ? String(rawTag) : '';

  const { keys } = extractCommentLikeKeys(commentValue, tagValue);
  if (!keys || keys.length === 0) {
    return { caseType: null, hasConflict: false };
  }

  const caseTypeSet = new Set();
  for (const key of keys) {
    const rule = commentRuleMap.get(key);
    if (!rule || !rule.caseType) continue;
    caseTypeSet.add(rule.caseType);
  }

  if (caseTypeSet.size === 0) {
    return { caseType: null, hasConflict: false };
  }
  if (caseTypeSet.size > 1) {
    return { caseType: null, hasConflict: true };
  }
  return { caseType: Array.from(caseTypeSet)[0], hasConflict: false };
}

/**
 * 对英文译文应用 Sentence case：只有第一个单词首字母大写，其余字母小写
 * @param {string} text
 * @returns {string}
 */
function enforceSentenceCase(text) {
  const original = String(text || '');
  if (!original) return original;
  const lower = original.toLowerCase();
  const chars = lower.split('');
  for (let i = 0; i < chars.length; i++) {
    if (/[a-z]/.test(chars[i])) {
      chars[i] = chars[i].toUpperCase();
      break;
    }
  }
  return chars.join('');
}

/**
 * 对英文译文应用 Title Case：每个单词首字母大写，其余字母小写
 * @param {string} text
 * @returns {string}
 */
function enforceTitleCase(text) {
  const original = String(text || '');
  if (!original) return original;
  const lower = original.toLowerCase();
  // \b[a-z][a-z]*\b 匹配英文字母单词
  return lower.replace(/\b([a-z])([a-z]*)\b/g, (m, first, rest) => {
    return first.toUpperCase() + rest;
  });
}

/**
 * 根据 comment/tag 中的 caseType 规则，自动纠正英文翻译的大小写
 * @param {string} translatedText
 * @param {Object} entry - 原始CSV行对象
 * @param {Map<string, any>} commentRuleMap
 * @returns {{ text: string, issues: string[] }}
 */
function applyCaseRuleForEntry(translatedText, entry, commentRuleMap) {
  let text = String(translatedText || '');
  const issues = [];

  if (!text || !entry || !commentRuleMap || commentRuleMap.size === 0) {
    return { text, issues };
  }

  const { caseType, hasConflict } = getCaseTypeForEntry(entry, commentRuleMap);
  if (hasConflict) {
    issues.push('comment/tag 大小写规则冲突：同时存在 Sentence case 和 Title Case，未自动纠正，请检查 comment对应场景及规则.xlsx 配置');
    return { text, issues };
  }
  if (!caseType) {
    return { text, issues };
  }

  let fixed = text;
  if (caseType === 'SentenceCase') {
    fixed = enforceSentenceCase(text);
  } else if (caseType === 'TitleCase') {
    fixed = enforceTitleCase(text);
  }

  if (fixed !== text) {
    text = fixed;
    issues.push(`已根据 comment/tag 中的大小写规则自动纠正英文大小写（应用 ${caseType === 'SentenceCase' ? 'Sentence case' : 'Title Case'}）`);
  }

  return { text, issues };
}

// ==================== 步骤3: 批量读取CSV/XLSX ====================

/**
 * 检测文件编码（简单检测：尝试UTF-8，失败则尝试GBK）
 * @param {Buffer} buffer - 文件内容Buffer
 * @returns {string} 编码类型 'utf8' 或 'gbk'
 */
function detectEncoding(buffer) {
  // 检查是否有UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return 'utf8';
  }

  // 尝试UTF-8解码，如果成功则可能是UTF-8
  try {
    const testStr = buffer.toString('utf8');
    // 检查是否包含无效的UTF-8序列（替换字符）
    if (!testStr.includes('\uFFFD')) {
      return 'utf8';
    }
  } catch (e) {
    // UTF-8解码失败
  }

  // 默认尝试GBK
  return 'gbk';
}

/**
 * 读取CSV文件（支持UTF-8和GBK编码）
 * @param {string} csvPath - CSV文件路径
 * @returns {Object} { headers, entries }
 */
function readCsvFile(csvPath) {
  console.log(`正在读取CSV文件: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`文件不存在: ${csvPath}`);
  }

  // 读取文件Buffer
  const buffer = fs.readFileSync(csvPath);
  
  // 检测编码
  const encoding = detectEncoding(buffer);
  console.log(`检测到文件编码: ${encoding}`);

  // 根据编码解码文件内容
  let content;
  if (encoding === 'utf8') {
    // 移除UTF-8 BOM（如果存在）
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      content = buffer.slice(3).toString('utf8');
    } else {
      content = buffer.toString('utf8');
    }
  } else {
    // GBK编码
    content = iconv.decode(buffer, 'gbk');
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV文件格式错误：至少需要标题行和一行数据');
  }

  // 解析标题行
  const headers = parseCsvLine(lines[0]);
  console.log(`CSV列: ${headers.join(', ')}`);

  // 解析数据行
  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || !values[0]) continue; // 跳过空行

    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    entries.push(entry);
  }

  console.log(`读取完成: ${entries.length} 条词条`);
  return { headers, entries };
}

/**
 * 读取XLSX文件
 * @param {string} xlsxPath - XLSX文件路径
 * @returns {Object} { headers, entries }
 */
function readXlsxFile(xlsxPath) {
  console.log(`正在读取XLSX文件: ${xlsxPath}`);

  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`文件不存在: ${xlsxPath}`);
  }

  // 使用XLSX库读取文件
  const workbook = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0]; // 读取第一个工作表
  const worksheet = workbook.Sheets[sheetName];

  // 方法1：尝试使用对象格式（第一行作为键）
  let jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '', // 空单元格默认值
    raw: false, // 不保留原始值，进行格式化
    blankrows: false // 跳过空行
  });

  // 如果对象格式读取成功且有数据
  if (jsonData && jsonData.length > 0) {
    // 从第一个对象提取表头
    const firstRow = jsonData[0];
    const headers = Object.keys(firstRow).map(key => String(key || '').trim());
    
    // 检查表头是否有效（不是__EMPTY等占位符，且包含常见的中文列名）
    const commonHeaders = ['id', '词条', '英文翻译', 'comment', '俄文翻译', '备注', '翻译最大长度', '备注1'];
    const hasValidHeader = headers.some(h => {
      const lowerH = h.toLowerCase();
      return commonHeaders.some(ch => lowerH.includes(ch.toLowerCase()) || ch.toLowerCase().includes(lowerH));
    });
    
    // 如果表头看起来有效，或者没有__EMPTY占位符，使用这些表头
    const hasEmptyPlaceholder = headers.some(h => h.startsWith('__EMPTY'));
    const validHeaders = hasValidHeader || !hasEmptyPlaceholder 
      ? headers.filter(h => h && !h.startsWith('__EMPTY'))
      : [];
    
    if (validHeaders.length > 0) {
      console.log(`XLSX列: ${validHeaders.join(', ')}`);
      
      // 转换为统一格式
      // 注意：不进行 trim，保持原始数据（特别是词条列的前后空格），避免修改输入数据导致更新失败
      const entries = jsonData.map(row => {
        const entry = {};
        validHeaders.forEach(header => {
          entry[header] = row[header] !== undefined && row[header] !== null 
            ? String(row[header])
            : '';
        });
        return entry;
      }).filter(entry => {
        // 过滤掉所有字段都为空的行（使用 trim 仅用于判断是否为空，不修改数据）
        return validHeaders.some(header => entry[header] && String(entry[header]).trim() !== '');
      });

      console.log(`读取完成: ${entries.length} 条词条`);
      return { headers: validHeaders, entries };
    }
  }

  // 方法2：如果对象格式失败，使用数组格式
  console.log('尝试使用数组格式读取XLSX文件...');
  const arrayData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1, // 使用数组格式
    defval: '', // 空单元格默认值
    raw: false, // 不保留原始值，进行格式化
    blankrows: false // 跳过空行
  });

  if (arrayData.length < 1) {
    throw new Error('XLSX文件格式错误：文件为空');
  }

  // 第一行作为表头
  const rawHeaders = arrayData[0] || [];
  const headers = rawHeaders.map((h, index) => {
    const str = String(h || '').trim();
    // 如果表头为空，使用默认列名
    return str || `列${index + 1}`;
  });

  // 过滤掉所有表头都为空的情况
  const validHeaders = headers.filter((h, index) => {
    // 保留非默认列名，或者至少保留前几列
    return !h.startsWith('列') || index < 10;
  });

  if (validHeaders.length === 0) {
    throw new Error('XLSX文件格式错误：无法识别表头');
  }

  console.log(`XLSX列: ${validHeaders.join(', ')}`);

  // 解析数据行（从第二行开始）
  const entries = [];
  for (let i = 1; i < arrayData.length; i++) {
    const row = arrayData[i] || [];
    // 检查是否为空行
    const isEmptyRow = row.every(cell => !cell || String(cell).trim() === '');
    if (isEmptyRow) continue;

    const entry = {};
    validHeaders.forEach((header, index) => {
      const cellValue = row[index];
      entry[header] = cellValue !== undefined && cellValue !== null 
        ? String(cellValue)
        // ? String(cellValue).trim() // 不人为修改excel所有列的空格
        : '';
    });
    
    // 只添加至少有一个非空字段的行
    const hasData = validHeaders.some(header => entry[header] && entry[header].trim() !== '');
    if (hasData) {
      entries.push(entry);
    }
  }

  console.log(`读取完成: ${entries.length} 条词条`);
  return { headers: validHeaders, entries };
}

/**
 * 读取CSV或XLSX文件（自动检测文件类型）
 * @param {string} filePath - 文件路径
 * @returns {Object} { headers, entries }
 */
function readCsvOrXlsxFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.xlsx' || ext === '.xls') {
    return readXlsxFile(filePath);
  } else if (ext === '.csv') {
    return readCsvFile(filePath);
  } else {
    // 尝试根据文件内容自动检测
    const buffer = fs.readFileSync(filePath);
    // 检查是否是XLSX文件（XLSX文件以PK开头，是ZIP格式）
    if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
      console.log('检测到XLSX格式（通过文件头）');
      return readXlsxFile(filePath);
    } else {
      // 默认按CSV处理
      console.log('未指定扩展名，按CSV格式处理');
      return readCsvFile(filePath);
    }
  }
}

/**
 * 解析CSV行（处理引号和逗号）
 * @param {string} line - CSV行
 * @returns {Array} 字段数组
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义的引号
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // 添加最后一个字段
  result.push(current);

  return result;
}

// ==================== 步骤4: AI翻译 ====================

/**
 * 识别占位符
 * @param {string} text - 文本
 * @returns {Array} 占位符数组
 */
function extractPlaceholders(text) {
  const placeholders = [];
  const usedIndices = new Set(); // 记录已使用的索引，避免重复匹配

  // 统一识别“真正的占位符”：花括号占位符（{}、{:.3f} 等），不关心外层是 [] / 【】/空格/连字符等样式
  // 允许 :.数字 等格式
  const curlyMatches = text.matchAll(/\{([:\d\.a-zA-Z]*)\}/g);
  for (const match of curlyMatches) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    // 防止重复
    let isUsed = false;
    for (let i = startIndex; i < endIndex; i++) {
      if (usedIndices.has(i)) {
        isUsed = true;
        break;
      }
    }
    if (!isUsed) {
      placeholders.push({
        type: 'curly',
        original: match[0],
        content: match[1] || '',
        index: startIndex
      });
      for (let i = startIndex; i < endIndex; i++) {
        usedIndices.add(i);
      }
    }
  }

  // 匹配 %1, %2 等格式
  const percentMatches = text.matchAll(/%(\d+)/g);
  for (const match of percentMatches) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    // 检查是否已被使用
    let isUsed = false;
    for (let i = startIndex; i < endIndex; i++) {
      if (usedIndices.has(i)) {
        isUsed = true;
        break;
      }
    }
    if (!isUsed) {
      placeholders.push({
        type: 'percent',
        original: match[0],
        content: match[1],
        index: startIndex
      });
      // 标记为已使用
      for (let i = startIndex; i < endIndex; i++) {
        usedIndices.add(i);
      }
    }
  }

  // 按索引排序
  placeholders.sort((a, b) => a.index - b.index);

  return placeholders;
}

/** 批线协议：源文内换行哨兵（须与 prompts 中约束一致） */
const BATCH_NL_TOKEN = '⟦__NL__⟧';
const BATCH_NL_TOKEN_BARE = '__NL__';

/**
 * 将不可区分占位符与批内换行替换为临时 token。
 * - 换行：先规范 \r\n/\r → \n，再替换为固定哨兵 ⟦__NL__⟧（避免按行解析整批错位）
 * - 花括号：{} / {:.3f} 等 → ⟦__PH_CURLY_n__⟧
 * %1/%2 等可区分占位符不在此列
 *
 * @param {string} entryText
 * @returns {{ protectedText: string, tokenReplacements: Array<{token: string, original: string, wrappedToken?: string}>, tokenOrder: string[], hadNewlines: boolean }}
 */
function protectUndistinguishablePlaceholders(entryText) {
  const tokenReplacements = [];
  const tokenOrder = [];

  // 1) 换行 mask（必须先于“按行拼 ENTRY_LIST”）
  let protectedText = String(entryText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const hadNewlines = protectedText.includes('\n');
  if (hadNewlines) {
    protectedText = protectedText.split('\n').join(BATCH_NL_TOKEN);
  }

  // 2) 花括号 token（带 ⟦ ⟧ 边界，防相邻吞并）
  protectedText = protectedText.replace(/\{([:\d\.a-zA-Z]*)\}/g, (full) => {
    const innerToken = `__PH_CURLY_${tokenReplacements.length}__`;
    const wrappedToken = `⟦${innerToken}⟧`;
    tokenReplacements.push({ token: innerToken, wrappedToken, original: full });
    tokenOrder.push(innerToken);
    return wrappedToken;
  });

  return { protectedText, tokenReplacements, tokenOrder, hadNewlines };
}

/**
 * 还原 protect 生成的 token：先花括号，再换行哨兵（含模型偶发变体）
 * @param {string} translatedText
 * @param {Array<{token: string, original: string, wrappedToken?: string}>} tokenReplacements
 * @returns {string}
 */
function restoreUndistinguishablePlaceholders(translatedText, tokenReplacements) {
  let text = String(translatedText || '');
  for (const item of tokenReplacements || []) {
    const token = item && item.token;
    const wrappedToken = item && item.wrappedToken;
    const original = item && item.original;
    if (!token || !original) continue;

    if (wrappedToken) {
      text = text.split(wrappedToken).join(original);
    }
    text = text.split(token).join(original);
  }

  // 换行哨兵：标准形式 + 裸 __NL__ + 偶发空格变体
  text = text.split(BATCH_NL_TOKEN).join('\n');
  text = text.replace(/⟦\s*__NL__\s*⟧/g, '\n');
  text = text.split(BATCH_NL_TOKEN_BARE).join('\n');
  return text;
}

/**
 * 校验不可区分占位符token是否被换序/丢失/重复
 * @param {string} translatedText - 仍包含token的译文
 * @param {string[]} tokenOrder - 原文token顺序
 * @returns {{ isValid: boolean, issues: string[] }}
 */
function validateUndistinguishableTokenOrder(translatedText, tokenOrder) {
  const issues = [];
  const text = String(translatedText || '');
  const tokens = Array.isArray(tokenOrder) ? tokenOrder : [];

  // 逐个检查token是否存在且只出现一次
  const positions = [];
  for (const token of tokens) {
    // 新逻辑：优先找带边界的 token；若模型吞掉边界符，则回退找裸 token
    const wrapped = `⟦${token}⟧`;
    let first = text.indexOf(wrapped);
    let needle = wrapped;
    if (first === -1) {
      first = text.indexOf(token);
      needle = token;
    }
    if (first === -1) {
      issues.push(`不可区分占位符丢失或被改写: ${token}`);
      continue;
    }
    const second = text.indexOf(needle, first + needle.length);
    if (second !== -1) {
      issues.push(`不可区分占位符重复: ${token}`);
      continue;
    }
    positions.push({ token, pos: first });
  }

  // 顺序检查：位置必须按 tokenOrder 递增
  let lastPos = -1;
  for (const token of tokens) {
    const found = positions.find(p => p.token === token);
    if (!found) continue;
    if (found.pos < lastPos) {
      issues.push('不可区分占位符顺序发生变化（禁止）');
      break;
    }
    lastPos = found.pos;
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * 翻译后轻量后处理：修正机翻常见格式问题（不改变语义）
 * - 修正文件后缀空格：*. scd → *.scd
 *
 * @param {string} translatedText
 * @returns {{ text: string, issues: string[] }}
 */
function postprocessTranslation(translatedText) {
  let text = String(translatedText || '');
  const issues = [];

  // 规范化中文方括号/书名号到英文方括号（主要用于占位符组合，如 【{}-{}】 → [{}-{}]）
  // 仅做符号替换，不触碰 {} 本体
  if (/[【】]/.test(text)) {
    const beforeBracket = text;
    text = text.replace(/【/g, '[').replace(/】/g, ']');
    if (text !== beforeBracket) {
      issues.push('已将中文括号【】规范化为英文[]（用于占位符组合等）');
    }
  }

  // QT 兼容：翻译结果中若存在 “ & ”，需要替换为 “ && ”
  // 原因：QT 会将单个 & 转义为 '_'（助记符/快捷键机制），导致显示异常
  // 仅处理两侧带空格的场景，避免误改 HTML 实体（&amp;）或代码逻辑（&&）
  if (text.includes(' & ')) {
    const beforeAmp = text;
    text = text.split(' & ').join(' && ');
    if (text !== beforeAmp) {
      issues.push('已将 “ & ” 替换为 “ && ”（QT 单个 & 会被转义为 "_"）');
    }
  }

  // 修正 *. ext → *.ext（仅处理星号点号后的空格）
  const before = text;
  text = text.replace(/\*\.\s+([A-Za-z0-9]+)/g, '*.$1');
  if (text !== before) {
    issues.push('已修正文件后缀点号后的空格（如 "*. scd" → "*.scd"）');
  }

  return { text, issues };
}

/**
 * 讯飞/MT 模型常输出 “源文 → 译文”；en2ru 目标列只要纯俄文（取箭头右侧）
 * @param {string} translatedText
 * @param {string} [sourceText]
 * @returns {{ text: string, issues: string[] }}
 */
function postprocessEn2RuMtArrow(translatedText, sourceText = '') {
  let text = String(translatedText || '').trim();
  const issues = [];
  if (!text) return { text, issues };

  if (/\s*(?:→|->|⇒)\s*/.test(text)) {
    const parts = text.split(/\s*(?:→|->|⇒)\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const right = parts[parts.length - 1];
      issues.push('已剥离 “源文 → 译文” 箭头左侧，仅保留俄文译文');
      text = right;
    }
  }

  // 若整段仍以源文原样开头，尽量去掉前缀（保守：仅当源文非空且译文以源文开头且更长）
  const src = String(sourceText || '').trim();
  if (src && text.startsWith(src) && text.length > src.length) {
    const rest = text.slice(src.length).replace(/^[\s:：\-–—→>]+/, '').trim();
    if (rest) {
      text = rest;
      issues.push('已去掉译文前多余的源文前缀');
    }
  }

  return { text, issues };
}

/**
 * 针对“单位兆/单位兆:M”等中文不规范表述的专项处理：
 * - 备注：提示中文应为“单位：M”或“单位：兆”
 * - 英文：统一强制为 unit: M（不使用 Megabytes / (in megabytes)）
 *
 * @param {string} originalChinese
 * @param {string} translatedText
 * @returns {{ text: string, issues: string[] }}
 */
function postprocessUnitZhao(originalChinese, translatedText) {
  const issues = [];
  let text = String(translatedText || '');
  const cn = String(originalChinese || '');

  if (!/单位\s*兆/.test(cn)) {
    return { text, issues };
  }

  // 备注建议（由调用方写入备注1）；这里仅返回可用信息
  issues.push('检测到中文不规范: “单位兆”建议改为“单位：M”或“单位：兆”；英文统一为 unit: M');

  // 把 Megabytes / in megabytes 等统一为 M
  const before = text;
  text = text
    .replace(/\(\s*in\s+megabytes\s*\)/ig, '(unit: M)')
    .replace(/\bunit\s*:\s*megabytes\s*:\s*m\b/ig, 'unit: M')
    .replace(/\bunit\s*:\s*m\s*:\s*m\b/ig, 'unit: M')
    .replace(/\bunit\s*:\s*megabytes\b/ig, 'unit: M')
    .replace(/\bmegabytes\b/ig, 'M'); // 兜底：避免残留 Megabytes

  if (text !== before) {
    issues.push('已将译文中的 Megabytes/(in megabytes) 归一为 unit: M');
  }

  return { text, issues };
}

/**
 * 构建AI翻译prompt
 * @param {string} entryText - 词条文本
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @param {Object} options - 可选参数
 * @param {string} options.commentRulesMarkdown - comment规则markdown
 * @param {Map} options.pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {string} prompt
 */
function buildTranslationPrompt(entryText, abbreviationMap, fullTranslationMap, options = {}) {
  // 查找相关术语库条目
  const relatedTerms = [];

  // 在缩写映射中查找
  for (const [chinese, english] of abbreviationMap.entries()) {
    if (entryText.includes(chinese)) {
      relatedTerms.push(`- ${chinese} → ${english}`);
    }
  }

  // 在完整翻译映射中查找
  for (const [chinese, english] of fullTranslationMap.entries()) {
    if (entryText.includes(chinese) && !relatedTerms.some(t => t.includes(chinese))) {
      relatedTerms.push(`- ${chinese} → ${english}`);
    }
  }

  // 检测并注入伪代码术语说明
  const pseudoCodeRuleMap = options && options.pseudoCodeRuleMap;
  const matchedPseudoCodeRules = [];
  if (pseudoCodeRuleMap) {
    for (const [chinese, rule] of pseudoCodeRuleMap.entries()) {
      if (entryText.includes(chinese)) {
        matchedPseudoCodeRules.push(rule.rawMarkdown);
      }
    }
  }

  const template = loadPromptTemplate('single');
  const relatedTermsSection = relatedTerms.length > 0
    ? `## 相关术语库条目\n${relatedTerms.join('\n')}\n`
    : '';
  const commentRulesSection = options && options.commentRulesMarkdown
    ? String(options.commentRulesMarkdown)
    : '';
  const excelTranslationRulesSection = options && options.excelTranslationRulesMarkdown
    ? String(options.excelTranslationRulesMarkdown)
    : '';
  const pseudoCodeTermsSection = matchedPseudoCodeRules.length > 0
    ? `## 伪代码术语说明\n\n以下术语为伪代码术语，必须严格按照指定翻译：\n\n${matchedPseudoCodeRules.join('\n')}\n`
    : '';

  return renderTemplate(template, {
    RELATED_TERMS_SECTION: relatedTermsSection,
    COMMENT_RULES_SECTION: commentRulesSection,
    EXCEL_TRANSLATION_RULES_SECTION: excelTranslationRulesSection,
    PSEUDOCODE_TERMS_SECTION: pseudoCodeTermsSection,
    ENTRY_TEXT: String(entryText || '')
  });
}

// ==================== 根目录 .env 加载 ====================

const HUIYAN_SKILLS_ROOT = path.resolve(__dirname, '../..');

/**
 * 读取 KEY=VALUE 到 process.env（不覆盖已有环境变量）
 * @param {string} filePath
 */
function loadDotEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = String(rawLine || '').trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile(path.join(HUIYAN_SKILLS_ROOT, '.env'));
loadDotEnvFile(path.join(HUIYAN_SKILLS_ROOT, '.env.local'));

function envFlag(name, defaultValue = true) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(String(raw).toLowerCase());
}

function toChatCompletionsUrl(base) {
  const b = String(base || '').replace(/\/$/, '');
  return /\/chat\/completions\/?$/i.test(b) ? b : `${b}/chat/completions`;
}

function buildApiConfig() {
  const zhipuKey = process.env.ZHIPU_API_KEY || '';
  const xfyunKey = process.env.XFYUN_API_KEY || process.env.XINGCHEN_API_KEY || '';
  const siliconKey = process.env.SILICONFLOW_API_KEY || '';
  const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
  const xfyunBase =
    process.env.XFYUN_BASE_URL ||
    'https://maas-api.cn-huabei-1.xf-yun.com/v2';
  const siliconBase = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
  const deepseekBase = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const sfConcurrencyRaw = parseInt(process.env.SILICONFLOW_CONCURRENCY || '8', 10);

  return {
    xfyun: {
      apiKey: xfyunKey,
      baseURL: toChatCompletionsUrl(xfyunBase),
      model: process.env.XFYUN_MODEL || 'xophunyuan7bmt',
      service: process.env.XFYUN_SERVICE || 'translation',
      enabled: envFlag('XFYUN_API_ENABLED', true) && !!xfyunKey
    },
    siliconflow: {
      apiKey: siliconKey,
      baseURL: toChatCompletionsUrl(siliconBase),
      model: process.env.SILICONFLOW_MODEL || 'tencent/Hunyuan-MT-7B',
      concurrency: Math.min(20, Math.max(1, Number.isFinite(sfConcurrencyRaw) ? sfConcurrencyRaw : 8)),
      enabled: envFlag('SILICONFLOW_API_ENABLED', true) && !!siliconKey
    },
    zhipu: {
      apiKey: zhipuKey,
      baseURL: toChatCompletionsUrl(
        process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
      ),
      model: process.env.ZHIPU_MODEL || 'glm-4-flash',
      enabled: envFlag('ZHIPU_API_ENABLED', true) && !!zhipuKey
    },
    deepseek: {
      apiKey: deepseekKey,
      baseURL: toChatCompletionsUrl(deepseekBase),
      model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
      enabled: envFlag('DEEPSEEK_API_ENABLED', true) && !!deepseekKey
    }
  };
}

// ==================== API配置（来自 huiyanSkills 根目录 .env，禁止硬编码密钥） ====================

const API_CONFIG = buildApiConfig();

/** @type {ReturnType<typeof buildTranslateWorkerPool>|null} */
let _runtimeTranslateOptions = null;

function assertAnyTranslateApiEnabled() {
  const enabled = Object.entries(API_CONFIG)
    .filter(([, cfg]) => cfg && cfg.enabled)
    .map(([name]) => name);
  if (enabled.length === 0) {
    throw new Error(
      `未配置可用翻译 API Key。请在 ${path.join(HUIYAN_SKILLS_ROOT, '.env')} 填写 XFYUN_API_KEY / SILICONFLOW_API_KEY / ZHIPU_API_KEY（参考 .env.example）`
    );
  }
  return enabled;
}

/**
 * 构建全部候选 worker（未按 modelPolicy 过滤）
 */
function buildTranslateWorkerPool() {
  /** @type {Array<object>} */
  const workers = [];

  if (API_CONFIG.xfyun.enabled) {
    workers.push({
      id: `xfyun:${API_CONFIG.xfyun.model}`,
      provider: 'xfyun',
      name: `讯飞星辰/${API_CONFIG.xfyun.model}`,
      model: API_CONFIG.xfyun.model,
      maxInflight: getXfyunConcurrency(),
      callSingle: (prompt) => callXfyunAPI(prompt),
      callBatch: (prompt, n) => callXfyunAPIBatch(prompt, n)
    });
  }

  if (API_CONFIG.siliconflow.enabled) {
    const defaultSf = API_CONFIG.siliconflow.model;
    const catalogIds = listSiliconTranslateModels().map((m) => m.id);
    // 保证默认模型在池中（即使尚未列入 listSiliconTranslate 边界）
    const ids = [...new Set([defaultSf, ...catalogIds])];
    for (const modelId of ids) {
      workers.push({
        id: `siliconflow:${modelId}`,
        provider: 'siliconflow',
        name: `硅基流动/${modelId}`,
        model: modelId,
        maxInflight: API_CONFIG.siliconflow.concurrency,
        callSingle: (prompt) => callSiliconflowAPI(prompt, modelId),
        callBatch: (prompt, n) => callSiliconflowAPIBatch(prompt, n, modelId)
      });
    }
  }

  if (API_CONFIG.zhipu.enabled) {
    workers.push({
      id: `zhipu:${API_CONFIG.zhipu.model}`,
      provider: 'zhipu',
      name: `智谱/${API_CONFIG.zhipu.model}`,
      model: API_CONFIG.zhipu.model,
      maxInflight: 1,
      callSingle: (prompt) => callZhipuAPI(prompt),
      callBatch: (prompt, n) => callZhipuAPIBatch(prompt, n)
    });
  }

  if (API_CONFIG.deepseek.enabled) {
    const dsModel = API_CONFIG.deepseek.model;
    workers.push({
      id: `deepseek:${dsModel}`,
      provider: 'deepseek',
      name: `DeepSeek/${dsModel}`,
      model: dsModel,
      maxInflight: 8,
      callSingle: (prompt) => callDeepseekAPI(prompt, dsModel),
      callBatch: (prompt, n) => callDeepseekAPIBatch(prompt, n, dsModel)
    });
  }

  return workers;
}

/**
 * en2ru 验收/疑难重译专用可调用 worker（固定 DeepSeek-V4-Flash；缺 key 则抛错）
 * 元数据校验见 modelCatalog.resolveVerifyWorker；此处返回带 callBatch/callSingle 的运行时句柄。
 * @returns {object}
 */
function resolveVerifyWorker() {
  // 先校验目录 + API Key（禁止回落免费模型）
  const { resolveVerifyWorker: assertVerifyModel, VERIFY_WORKER_CONFIG_ID } = require('./lib/modelCatalog');
  assertVerifyModel();

  const pool = buildTranslateWorkerPool();
  const wantIds = new Set([
    VERIFY_WORKER_CONFIG_ID,
    `deepseek:${API_CONFIG.deepseek.model}`,
    'deepseek:DeepSeek-V4-Flash',
    'deepseek:deepseek-v4-flash'
  ]);
  const worker = pool.find((w) => wantIds.has(w.id) || w.provider === 'deepseek');
  if (!worker) {
    throw new Error(
      `未配置 DeepSeek 验收模型。请在 ${path.join(HUIYAN_SKILLS_ROOT, '.env')} 填写 DEEPSEEK_API_KEY（建议 DEEPSEEK_MODEL=deepseek-v4-flash）。禁止用免费模型冒充语义验收。`
    );
  }
  return worker;
}

/**
 * single | all | list → 活跃 worker 列表
 * @param {{ multiModel?: boolean, models?: string|string[], mode?: string }} options
 */
function resolveActiveTranslateWorkers(options = {}) {
  const pool = buildTranslateWorkerPool();
  if (pool.length === 0) return [];

  const modeId = String(options.mode || (options.stages && options.stages[0]) || '').trim();
  const excludeEn2RuEcho =
    modeId === 'en2ru' ||
    modeId === 'pipeline' ||
    modeId === 'dual' ||
    options.excludeEn2RuEchoOnly === true;

  const filterEcho = (workers) => {
    if (!excludeEn2RuEcho) return workers;
    const kept = [];
    const skipped = [];
    for (const w of workers) {
      const meta = findModelById(w.id);
      if (meta && isEn2RuEchoOnlyModel(meta)) skipped.push(w.id);
      else kept.push(w);
    }
    if (skipped.length > 0) {
      console.log(
        `en2ru 已绕过受限模型（${EN2RU_ECHO_ONLY_LIMIT}）: ${skipped.join(', ')}\n`
      );
    }
    return kept;
  };

  const envMulti = envFlag('TRANSLATE_MULTI_MODEL', false);
  const multiModel = options.multiModel === true || (options.multiModel !== false && envMulti);

  const modelsRaw =
    options.models != null && options.models !== ''
      ? options.models
      : (process.env.TRANSLATE_MODELS || process.env.SILICONFLOW_MODELS || '');
  const parsed = parseModelsList(modelsRaw);

  const byPrioritySingle = () => {
    // 讯飞 → 硅基默认 Hunyuan-MT → 硅基其余（目录序）→ 智谱
    const order = [];
    const xfyun = pool.find((w) => w.provider === 'xfyun');
    if (xfyun) order.push(xfyun);
    const sfDefaultId = `siliconflow:${API_CONFIG.siliconflow.model}`;
    const sfDefault = pool.find((w) => w.id === sfDefaultId);
    if (sfDefault) order.push(sfDefault);
    for (const m of listSiliconTranslateModels()) {
      const w = pool.find((x) => x.id === `siliconflow:${m.id}`);
      if (w && !order.includes(w)) order.push(w);
    }
    const zhipu = pool.find((w) => w.provider === 'zhipu');
    if (zhipu) order.push(zhipu);
    const filtered = filterEcho(order);
    return filtered.length ? [filtered[0]] : filterEcho(pool).slice(0, 1);
  };

  if (!multiModel) {
    return byPrioritySingle();
  }

  if (parsed.all || !modelsRaw || (Array.isArray(modelsRaw) && modelsRaw.length === 0)) {
    // all：全部 mt+chat 可翻译 worker（硅基 list + 讯飞/智谱若启用）
    const out = [];
    const xfyun = pool.find((w) => w.provider === 'xfyun');
    if (xfyun) out.push(xfyun);
    for (const m of listSiliconTranslateModels()) {
      const w = pool.find((x) => x.id === `siliconflow:${m.id}`);
      if (w) out.push(w);
    }
    const zhipu = pool.find((w) => w.provider === 'zhipu');
    if (zhipu) out.push(zhipu);
    const filtered = filterEcho(out);
    return filtered.length ? filtered : byPrioritySingle();
  }

  if (parsed.unknown.length > 0) {
    console.warn(`⚠️ 未识别的模型名（已忽略）: ${parsed.unknown.join(', ')}`);
  }

  const selected = [];
  for (const id of parsed.ids) {
    const w = pool.find((x) => x.id === id || x.model === id.replace(/^[^:]+:/, ''));
    if (w && !selected.includes(w)) selected.push(w);
  }
  if (selected.length === 0) {
    console.warn('⚠️ --models 未匹配到可用 worker，回退单模型优先级');
    return byPrioritySingle();
  }
  // 显式 --models 列表仍绕过 en2ru 回显受限模型（除非 TRANSLATE_ALLOW_EN2RU_ECHO_MODELS=1）
  if (envFlag('TRANSLATE_ALLOW_EN2RU_ECHO_MODELS', false)) {
    return selected;
  }
  const filtered = filterEcho(selected);
  return filtered.length ? filtered : byPrioritySingle();
}

function createWorkerRoundRobin(workers) {
  let i = 0;
  return function nextWorker() {
    if (!workers || workers.length === 0) return null;
    const w = workers[i % workers.length];
    i += 1;
    return w;
  };
}

function getTranslateApiChain(kind = 'single', options = {}) {
  const active =
    (options.activeWorkers && options.activeWorkers.length
      ? options.activeWorkers
      : null) ||
    (_runtimeTranslateOptions && _runtimeTranslateOptions.activeWorkers) ||
    resolveActiveTranslateWorkers(_runtimeTranslateOptions || options);

  const preferredId = options.preferredWorkerId;
  const ordered = [...active];
  if (preferredId) {
    ordered.sort((a, b) => {
      if (a.id === preferredId) return -1;
      if (b.id === preferredId) return 1;
      return 0;
    });
  }

  return ordered.map((w) => ({
    name: w.name,
    enabled: true,
    workerId: w.id,
    fn: kind === 'batch'
      ? (prompt, expectedCount) => w.callBatch(prompt, expectedCount)
      : (prompt) => w.callSingle(prompt)
  }));
}

// ==================== API调用函数 ====================

/**
 * 调用讯飞星辰 OpenAI 兼容接口（Hy-MT2-7B / translation）
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callXfyunAPI(prompt) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_CONFIG.xfyun.apiKey}`
    };
    if (API_CONFIG.xfyun.service) {
      headers['X-Service-Name'] = API_CONFIG.xfyun.service;
    }
    const response = await axios.post(
      API_CONFIG.xfyun.baseURL,
      {
        model: API_CONFIG.xfyun.model,
        messages: [
          { role: 'system', content: TRANSLATOR_SYSTEM },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      axiosRequestConfig({ headers, timeout: 60000 })
    );
    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('讯飞星辰 API返回格式异常');
  } catch (error) {
    const detail = error.response?.data ? JSON.stringify(error.response.data).slice(0, 200) : error.message;
    throw new Error(`讯飞星辰 API调用失败: ${detail}`);
  }
}

/**
 * 调用智谱API
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callZhipuAPI(prompt) {
  return runZhipuSerial(async () => {
    try {
      const response = await axios.post(
        API_CONFIG.zhipu.baseURL,
        {
          model: API_CONFIG.zhipu.model,
          messages: [
            { role: 'system', content: TRANSLATOR_SYSTEM },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        axiosRequestConfig({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.zhipu.apiKey}`
          },
          timeout: 60000
        })
      );
      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content.trim();
      }
      throw new Error('智谱API返回格式异常');
    } catch (error) {
      throw new Error(`智谱API调用失败: ${error.message}`);
    }
  });
}

/**
 * 硅基流动 OpenAI 兼容单条
 * @param {string} prompt
 * @param {string} [modelId]
 */
async function callSiliconflowAPI(prompt, modelId) {
  try {
    const model = modelId || API_CONFIG.siliconflow.model;
    const response = await axios.post(
      API_CONFIG.siliconflow.baseURL,
      {
        model,
        messages: [
          { role: 'system', content: TRANSLATOR_SYSTEM },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      axiosRequestConfig({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_CONFIG.siliconflow.apiKey}`
        },
        timeout: 60000
      })
    );
    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('硅基流动 API返回格式异常');
  } catch (error) {
    const detail = error.response?.data ? JSON.stringify(error.response.data).slice(0, 200) : error.message;
    throw new Error(`硅基流动 API调用失败: ${detail}`);
  }
}

/**
 * 对"已保护token"的单条词条进行强约束重试翻译
 */
async function translateProtectedEntryStrict(protectedEntryText, abbreviationMap, fullTranslationMap, options = {}) {
  const prompt = buildTranslationPrompt(protectedEntryText, abbreviationMap, fullTranslationMap, options);
  const apis = getTranslateApiChain('single', options);
  const errors = [];
  for (const api of apis) {
    if (!api.enabled) continue;
    try {
      return await api.fn(prompt);
    } catch (err) {
      errors.push(`${api.name}: ${err && err.message ? err.message : String(err)}`);
    }
  }
  throw new Error(`单条重试失败（所有API都失败）: ${errors.join('; ')}`);
}

/**
 * 批量调用讯飞星辰 OpenAI 兼容接口
 */
async function callXfyunAPIBatch(prompt, expectedCount) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_CONFIG.xfyun.apiKey}`
    };
    if (API_CONFIG.xfyun.service) {
      headers['X-Service-Name'] = API_CONFIG.xfyun.service;
    }
    const response = await axios.post(
      API_CONFIG.xfyun.baseURL,
      {
        model: API_CONFIG.xfyun.model,
        messages: [
          { role: 'system', content: TRANSLATOR_SYSTEM },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 8000
      },
      axiosRequestConfig({ headers, timeout: 180000 })
    );
    if (response.data && response.data.choices && response.data.choices[0]) {
      const text = response.data.choices[0].message.content.trim();
      return parseBatchTranslationResponse(text, expectedCount);
    }
    throw new Error('讯飞星辰 API返回格式异常');
  } catch (error) {
    const detail = error.response?.data ? JSON.stringify(error.response.data).slice(0, 200) : error.message;
    throw new Error(`讯飞星辰 API调用失败: ${detail}`);
  }
}

/**
 * 批量调用智谱API
 */
async function callZhipuAPIBatch(prompt, expectedCount) {
  return runZhipuSerial(async () => {
    try {
      const response = await axios.post(
        API_CONFIG.zhipu.baseURL,
        {
          model: API_CONFIG.zhipu.model,
          messages: [
            { role: 'system', content: TRANSLATOR_SYSTEM },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 8000
        },
        axiosRequestConfig({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.zhipu.apiKey}`
          },
          timeout: 180000
        })
      );
      if (response.data && response.data.choices && response.data.choices[0]) {
        const text = response.data.choices[0].message.content.trim();
        return parseBatchTranslationResponse(text, expectedCount);
      }
      throw new Error('智谱API返回格式异常');
    } catch (error) {
      throw new Error(`智谱API调用失败: ${error.message}`);
    }
  });
}

/**
 * 硅基流动批量
 * @param {string} prompt
 * @param {number} expectedCount
 * @param {string} [modelId]
 */
async function callSiliconflowAPIBatch(prompt, expectedCount, modelId) {
  try {
    const model = modelId || API_CONFIG.siliconflow.model;
    const response = await axios.post(
      API_CONFIG.siliconflow.baseURL,
      {
        model,
        messages: [
          { role: 'system', content: TRANSLATOR_SYSTEM },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 8000
      },
      axiosRequestConfig({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_CONFIG.siliconflow.apiKey}`
        },
        timeout: 180000
      })
    );
    if (response.data && response.data.choices && response.data.choices[0]) {
      const text = response.data.choices[0].message.content.trim();
      return parseBatchTranslationResponse(text, expectedCount);
    }
    throw new Error('硅基流动 API返回格式异常');
  } catch (error) {
    const detail = error.response?.data ? JSON.stringify(error.response.data).slice(0, 200) : error.message;
    throw new Error(`硅基流动 API调用失败: ${detail}`);
  }
}

/**
 * DeepSeek OpenAI 兼容单条（验收/疑难重译）
 * @param {string} prompt
 * @param {string} [modelId]
 */
async function callDeepseekAPI(prompt, modelId) {
  const model = modelId || API_CONFIG.deepseek.model;
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await axios.post(
        API_CONFIG.deepseek.baseURL,
        {
          model,
          messages: [
            { role: 'system', content: TRANSLATOR_SYSTEM },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 4000
        },
        axiosRequestConfig({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.deepseek.apiKey}`
          },
          timeout: 180000
        })
      );
      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content.trim();
      }
      throw new Error('DeepSeek API返回格式异常');
    } catch (error) {
      lastErr = error;
      const detail = error.response?.data
        ? JSON.stringify(error.response.data).slice(0, 200)
        : error.message;
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }
      throw new Error(`DeepSeek API调用失败: ${detail}`);
    }
  }
  throw lastErr;
}

/**
 * DeepSeek 批量（返回 parseBatchTranslationResponse 数组；语义验 prompt 亦可复用）
 * @param {string} prompt
 * @param {number} expectedCount
 * @param {string} [modelId]
 */
async function callDeepseekAPIBatch(prompt, expectedCount, modelId) {
  const model = modelId || API_CONFIG.deepseek.model;
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await axios.post(
        API_CONFIG.deepseek.baseURL,
        {
          model,
          messages: [
            { role: 'system', content: TRANSLATOR_SYSTEM },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 16000
        },
        axiosRequestConfig({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.deepseek.apiKey}`
          },
          timeout: 300000
        })
      );
      if (response.data && response.data.choices && response.data.choices[0]) {
        const text = response.data.choices[0].message.content.trim();
        return parseBatchTranslationResponse(text, expectedCount);
      }
      throw new Error('DeepSeek API返回格式异常');
    } catch (error) {
      lastErr = error;
      const detail = error.response?.data
        ? JSON.stringify(error.response.data).slice(0, 200)
        : error.message;
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }
      throw new Error(`DeepSeek API调用失败: ${detail}`);
    }
  }
  throw lastErr;
}

/**
 * 构建批量翻译prompt
 * @param {Array} entries - 词条数组，每个元素包含 {index, text, placeholders}
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @param {Map} pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {string} prompt
 */
function buildBatchTranslationPrompt(entries, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap, options = {}) {
  // 收集所有相关术语（缩写优先，去重）
  const relatedTermsSet = new Set();
  const abbreviationTerms = new Set();

  for (const entry of entries) {
    // 先收集缩写术语
    for (const [chinese, english] of abbreviationMap.entries()) {
      if (entry.text.includes(chinese)) {
        const term = `${chinese} → ${english}`;
        relatedTermsSet.add(term);
        abbreviationTerms.add(chinese);
      }
    }
    // 再收集完整翻译术语（排除已在缩写中的）
    for (const [chinese, english] of fullTranslationMap.entries()) {
      if (entry.text.includes(chinese) && !abbreviationTerms.has(chinese)) {
        relatedTermsSet.add(`${chinese} → ${english}`);
      }
    }
  }

  // 检测并注入伪代码术语说明
  const matchedPseudoCodeRules = new Set();
  if (pseudoCodeRuleMap) {
    for (const entry of entries) {
      for (const [chinese, rule] of pseudoCodeRuleMap.entries()) {
        if (entry.text.includes(chinese)) {
          matchedPseudoCodeRules.add(rule.rawMarkdown);
        }
      }
    }
  }

  const promptMode = options && options.mode;
  const template = loadPromptTemplate(
    promptMode === 'en2ru'
      ? 'batch-en2ru'
      : promptMode === 'zh2ru'
        ? 'batch-zh2ru'
        : 'batch'
  );
  const useGlossary = !(promptMode === 'en2ru' || promptMode === 'zh2ru');
  const relatedTermsSection = (useGlossary && relatedTermsSet.size > 0)
    ? `## 相关术语库条目\n${Array.from(relatedTermsSet).map(t => `- ${t}`).join('\n')}\n`
    : '';
  const pseudoCodeTermsSection = (useGlossary && matchedPseudoCodeRules.size > 0)
    ? `## 伪代码术语说明\n\n以下术语为伪代码术语，必须严格按照指定翻译：\n\n${Array.from(matchedPseudoCodeRules).join('\n')}\n`
    : '';
  const excelTranslationRulesSection = (useGlossary && options && options.excelTranslationRulesMarkdown)
    ? String(options.excelTranslationRulesMarkdown)
    : '';
  const commentRuleMap = (useGlossary && options && options.commentRuleMap) ? options.commentRuleMap : null;

  const entryList = entries.map((e, idx) => `${idx + 1}. ${e.text}`).join('\n');

  // comment 场景规则（按 comment/tag 分组，聚合所有使用相同 key 的词条序号）
  const commentGroups = new Map();
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i] || {};
    const rawComment = e.comment;
    const rawTag = e.tag;
    const commentValue = rawComment !== undefined && rawComment !== null
      ? String(rawComment)
      : '';
    const tagValue = rawTag !== undefined && rawTag !== null
      ? String(rawTag)
      : '';

    const { keys, meta } = extractCommentLikeKeys(commentValue, tagValue);
    if (!keys || keys.length === 0) continue;

    for (const key of keys) {
      let group = commentGroups.get(key);
      if (!group) {
        const rule = commentRuleMap && commentRuleMap.get(key);
        group = {
          comment: key,
          rule,
          indices: [],
          fromCommentIndices: [],
          fromTagIndices: []
        };
        commentGroups.set(key, group);
      }
      const idx = i + 1; // 使用本批次中的“序号. 词条”编号
      group.indices.push(idx);

      const info = meta && meta.get(key);
      if (info) {
        if (info.fromComment) {
          group.fromCommentIndices.push(idx);
        }
        if (info.fromTag) {
          group.fromTagIndices.push(idx);
        }
      }
    }
  }

  const commentRuleBlocks = [];
  for (const group of commentGroups.values()) {
    const rule = group.rule;
    const lines = [];
    // 复用单条规则的格式化逻辑，先输出 comment / 词条来源 / 场景 / 规则
    if (rule) {
      lines.push(formatCommentRuleToMarkdown(rule));
    } else {
      lines.push(`- **comment**: \`${group.comment}\`（未在 comment对应场景及规则.xlsx 中找到对应条目）`);
    }
    // 再追加本批次中命中的“序号”列表，便于与 ENTRY_LIST 对照
    if (group.indices && group.indices.length > 0) {
      lines.push(`  - **序号**: [${group.indices.join(', ')}]`);
    }
    if (group.fromCommentIndices && group.fromCommentIndices.length > 0) {
      lines.push(`  - **comment 字段行号**: [${group.fromCommentIndices.join(', ')}]`);
    }
    if (group.fromTagIndices && group.fromTagIndices.length > 0) {
      lines.push(`  - **tag 字段行号**: [${group.fromTagIndices.join(', ')}]`);
    }
    commentRuleBlocks.push(lines.join('\n'));
  }

  const commentRulesBatchSection = commentRuleBlocks.length > 0
    ? `## comment 场景规则（仅对带 comment/tag 的词条生效，来自 comment对应场景及规则.xlsx）\n\n${commentRuleBlocks.join('\n\n')}\n`
    : '';

  return renderTemplate(template, {
    RELATED_TERMS_SECTION: relatedTermsSection,
    PSEUDOCODE_TERMS_SECTION: pseudoCodeTermsSection,
    COMMENT_RULES_BATCH_SECTION: commentRulesBatchSection,
    EXCEL_TRANSLATION_RULES_SECTION: excelTranslationRulesSection,
    ENTRY_LIST: entryList
  });
}

/**
 * 解析批量翻译结果
 * @param {string} responseText - API返回的文本
 * @param {number} expectedCount - 期望的词条数量
 * @returns {Array<string>} 翻译结果数组
 */
function parseBatchTranslationResponse(responseText, expectedCount) {
  const lines = String(responseText || '').split('\n').filter((line) => line.trim());
  /** @type {Map<number, string>} */
  const byIndex = new Map();

  // 只收「序号. 内容」行；编号缺失/重复 → 失败（由调用方拒收整批）
  for (const raw of lines) {
    const line = raw.trim();
    const match = line.match(/^(\d+)[.、]\s*(.*)$/);
    if (!match) continue;
    const n = parseInt(match[1], 10);
    if (!Number.isFinite(n) || n < 1 || n > expectedCount) continue;
    if (byIndex.has(n)) {
      // 重复序号：整批不可信
      return [];
    }
    byIndex.set(n, match[2]); // 不 trim 内容前导空格以外：match[2] 已由 \s* 吃掉序号后空白
  }

  if (byIndex.size !== expectedCount) {
    return [];
  }

  const results = [];
  for (let i = 1; i <= expectedCount; i++) {
    if (!byIndex.has(i)) return [];
    results.push(byIndex.get(i));
  }
  return results;
}

/**
 * 批量调用Claude API
 * @param {string} prompt - 翻译prompt
 * @param {number} expectedCount - 期望的翻译数量
 * @returns {Promise<Array<string>>} 翻译结果数组
 */
/**
 * 批量AI翻译（支持多个API，按优先级fallback）
 * @param {Array} entries - 词条数组，每个元素包含 {index, text, placeholders}
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @param {Map} pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {Promise<Array<string>>} 英文翻译数组
 */
async function translateBatch(entries, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap, options = {}) {
  if (entries.length === 0) {
    return [];
  }

  // 构建批量prompt
  const prompt = buildBatchTranslationPrompt(entries, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap, options);

  // 优先 preferredWorker，再 failover 其余活跃 worker
  const apis = getTranslateApiChain('batch', options);

  const errors = [];
  const maxAttemptsPerApi = 3;

  for (const api of apis) {
    if (!api.enabled) {
      continue;
    }

    for (let attempt = 1; attempt <= maxAttemptsPerApi; attempt++) {
      try {
        const retryHint = attempt > 1 ? `（重试 ${attempt}/${maxAttemptsPerApi}）` : '';
        console.log(`  尝试使用 ${api.name} API批量翻译 ${entries.length} 条词条${retryHint}...`);
        const results = await api.fn(prompt, entries.length);

        // 条数必须严格对齐；禁止补空/截断后当作成功（否则整批串行）
        if (!Array.isArray(results) || results.length !== entries.length) {
          throw new Error(
            `批量结果数量不匹配: 期望 ${entries.length}, 实际 ${Array.isArray(results) ? results.length : 0}`
          );
        }

        console.log(`  ✅ ${api.name} API批量翻译成功`);
        return results;
      } catch (error) {
        const msg = error && error.message ? error.message : String(error);
        console.log(`  ❌ ${api.name} API失败: ${msg}`);
        if (
          attempt < maxAttemptsPerApi &&
          (isTransientNetworkError(msg) || /数量不匹配/.test(msg))
        ) {
          const waitMs = 2000 * attempt;
          console.log(`  ⏳ ${/数量不匹配/.test(msg) ? '条数不齐' : '瞬时网络错误'}，${waitMs}ms 后重试...`);
          await sleepMs(waitMs);
          continue;
        }
        errors.push(`${api.name}: ${msg}`);
        break;
      }
    }
  }

  // 所有API都失败
  throw new Error(`所有API都失败: ${errors.join('; ')}`);
}

/**
 * 单个词条翻译（保留用于兼容）
 * @param {string} entryText - 词条文本
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @returns {Promise<string>} 英文翻译
 */
async function translateEntry(entryText, abbreviationMap, fullTranslationMap) {
  const results = await translateBatch(
    [{ index: 0, text: entryText, placeholders: extractPlaceholders(entryText) }],
    abbreviationMap,
    fullTranslationMap
  );
  return results[0] || '';
}

// ==================== 步骤5: 中文规范性检查 ====================

/**
 * 单位字段的规则化识别与翻译兜底
 * - 标准：单位：xx / 单位: xx  → unit: xx
 * - 常见不规范：
 *   - 单位兆            → 备注提示应为“单位：兆”，翻译 unit: 兆
 *   - 单位兆：M / 单位兆:M → 备注提示应为“单位：M”或“单位：兆”，翻译 unit: M
 *
 * @param {string} entryText
 * @returns {{ forcedTranslation: string|null, note1Issues: string[] }}
 */
function normalizeUnitTranslation(entryText) {
  // const text = String(entryText || '').trim();
  const text = String(entryText || '');// 不trim，保留原始空格
  const note1Issues = [];

  // 标准写法：单位：xx
  const standardMatch = text.match(/^单位\s*[:：]\s*(.+)\s*$/);
  if (standardMatch) {
    const unitValue = standardMatch[1].trim();
    if (unitValue) {
      return { forcedTranslation: `unit: ${unitValue}`, note1Issues };
    }
  }

  // 不规范：单位兆：M（单位 + 中文单位名 + 冒号 + 值）
  const nonStandardWithValue = text.match(/^单位\s*([^\s:：]+)\s*[:：]\s*(.+)\s*$/);
  if (nonStandardWithValue) {
    const unitName = nonStandardWithValue[1].trim();
    const unitValue = nonStandardWithValue[2].trim();
    if (unitName) {
      note1Issues.push(`中文不规范: 中文描述有误，应为单位：${unitValue || unitName}或单位：${unitName}`);
      return { forcedTranslation: `unit: ${unitValue || unitName}`, note1Issues };
    }
  }

  // 不规范：单位兆（无冒号）
  const nonStandardNoColon = text.match(/^单位\s*([^\s:：]+)\s*$/);
  if (nonStandardNoColon) {
    const unitName = nonStandardNoColon[1].trim();
    if (unitName) {
      note1Issues.push(`中文不规范: 中文描述有误，应为单位：${unitName}`);
      return { forcedTranslation: `unit: ${unitName}`, note1Issues };
    }
  }

  return { forcedTranslation: null, note1Issues };
}

/**
 * 检查中文规范性
 * @param {string} entryText - 词条文本
 * @returns {Object} { isValid: boolean, issues: string[] }
 */
function validateChinese(entryText) {
  const issues = [];

  // 检查混用中英文标点（更严格的检查）
  const hasChinesePunctuation = /[，。：；！？、]/.test(entryText);
  const hasEnglishPunctuation = /[,.:;!?]/.test(entryText);
  if (hasChinesePunctuation && hasEnglishPunctuation) {
    // 检查是否在同一位置混用（更严格的检查）
    const chinesePunctPositions = [];
    const englishPunctPositions = [];

    entryText.split('').forEach((char, index) => {
      if (/[，。：；！？、]/.test(char)) {
        chinesePunctPositions.push(index);
      }
      if (/[,.:;!?]/.test(char)) {
        englishPunctPositions.push(index);
      }
    });

    // 如果中英文标点位置接近（相差不超过5个字符），认为是混用
    let mixed = false;
    for (const cp of chinesePunctPositions) {
      for (const ep of englishPunctPositions) {
        if (Math.abs(cp - ep) <= 5) {
          mixed = true;
          break;
        }
      }
      if (mixed) break;
    }

    if (mixed) {
      issues.push('混用中英文标点');
    }
  }

  // 检查多余空格（前后）
  if (entryText.trim() !== entryText) {
    issues.push('词条前后有多余空格');
  }

  // 检查中间多余空格（连续两个以上空格）
  if (/\s{2,}/.test(entryText)) {
    issues.push('词条中间有多余空格');
  }

  // 检查占位符格式错误（{:.3f}等格式是有效的，不需要检查）
  // 占位符格式检查已移除，因为{:.3f}、{}、%1等都是有效格式

  return {
    isValid: issues.length === 0,
    issues
  };
}

// ==================== 步骤6: 翻译结果验证 ====================

const CYRILLIC_RE = /[\u0400-\u04FF]/;
const BATCH_PH_TOKEN_RE = /⟦[^⟧]*⟧/g;

/**
 * 允许「俄文===英文」的白名单：缩写、快捷键、协议码、Q 类名等。
 * 故意不含：Caps Lock / Val / Envelope* / Didot / MenuRole / Qt 产品全名（须送翻）。
 * @param {string} source
 * @returns {boolean}
 */
function isAllowedEnRuIdentity(source) {
  const s = String(source || '').trim();
  if (!s) return true;
  if (!/[A-Za-z]/.test(s)) return true;

  // 单字母 / 纯数字短标（非英文 UI 词如 Val）
  if (/^[A-Za-z]$/.test(s) || /^\d+$/.test(s)) return true;

  // 字母+占位：F%1 / %1C（格式标记，通译无义）
  if (/^[A-Za-z]%\d+$/.test(s) || /^%\d+[A-Za-z]?$/.test(s)) return true;

  // 缩写/协议名：TCP、SSL、HTTP/2
  // 纯字母全大写：仅 ≤5 视为缩写 KEEP（SSL/HTTPS/GOOSE）；BACKUP/PASSWORD 等普通词须送翻
  const bare = s.replace(/[:.…]+$/u, '');
  if (/^[A-Z]+$/.test(bare)) {
    return bare.length <= 5;
  }
  if (
    bare.length <= 10 &&
    /^[A-Za-z0-9][A-Za-z0-9.\-_/]*$/.test(bare) &&
    !/[a-z]{2,}/.test(bare)
  ) {
    return true;
  }

  // 键盘快捷键：Ctrl+F10 / CTRL+SHIFT+S / Alt+P / Shift+F3
  if (
    /^(Ctrl|CTRL|Alt|ALT|Shift|SHIFT|Meta|Win|Cmd)(\+[A-Za-z0-9]+)+$/i.test(s) ||
    /^(Ctrl|CTRL|Alt|ALT|Shift|SHIFT)(\+(Ctrl|CTRL|Alt|ALT|Shift|SHIFT))*(\+[A-Za-z0-9]+)+$/i.test(s)
  ) {
    return true;
  }

  // 网格/尺寸：16 (4x4)、%1 x %2
  if (/^\d+\s*\(\d+\s*[x×]\s*\d+\)$/i.test(s) || /^%\d+\s*[x×]\s*%\d+$/i.test(s)) {
    return true;
  }

  // XML/标签型占位：<noname>、<slot>、<title>...</title>
  if (/^<[^>]+>$/.test(s) || /^<[^>]+>.*<\/[^>]+>$/.test(s)) {
    return true;
  }

  // 仅 Qt C++ 类名（QDial / QLabel）；产品全名（Qt Widgets Designer）须送翻
  if (/^Q[A-Z][A-Za-z0-9]*$/.test(s)) {
    return true;
  }

  // 纸张标准代号（不含 Didot / Envelope 商品名）
  if (/^JIS\s+B\d+$/i.test(s) || /^ANSI\s+[A-E]$/i.test(s)) {
    return true;
  }

  // 全大写常量/宏名：QT_LAYOUT_DIRECTION（短单词 DEFINE 也要送翻，故要求含 _ 或长度≥8）
  if (/^[A-Z][A-Z0-9_]{7,}$/.test(s) && /_/.test(s)) return true;

  // 键盘硬件键名中惯用英标的（不含 Caps Lock —— 俄语可译）
  if (/^(NumLock|Backspace|Backtab|Scroll\s*Lock|Print\s*Screen)$/i.test(s)) {
    return true;
  }

  // 编程标识符式短名（ContextN 由残留英文 REPLACE；此处仅整句恒等）
  if (/^Context\d+$/i.test(s)) return true;
  if (/^(newPrefix|iTouch|XFer|ComboBox|translatable)$/i.test(s)) return true;
  if (/^Bool(\.\.\.)?$/i.test(s)) return true;

  // 短标签：URL: / CLSID: / &Val: / Hu&e:（须以 : 结尾）
  if (/^[A-Za-z][A-Za-z0-9]{0,7}:$/.test(s)) return true;
  if (/^[A-Za-z]{1,4}&[A-Za-z]{1,3}:$/.test(s)) return true;
  if (/^&[A-Za-z]{1,5}:$/.test(s)) return true;

  return false;
}

const CJK_RE = /[\u4e00-\u9fff]/;

/**
 * 源为全大写英文词且译文含西里尔 → 输出全大写俄文（BACKUP → РЕЗЕРВ…）
 * @param {string} source
 * @param {string} translated
 * @returns {string}
 */
function preserveAllCapsCyrillic(source, translated) {
  const src = String(source || '').trim();
  const ru = String(translated || '').trim();
  if (!src || !ru || !CYRILLIC_RE.test(ru)) return ru;
  // 纯大写字母/数字/少量分隔（排除 SSL 等短缩写由 KEEP 处理）
  if (!/^[A-Z0-9][A-Z0-9_\s\-./]*$/.test(src)) return ru;
  if (!/[A-Z]{4,}/.test(src)) return ru;
  try {
    return ru.toLocaleUpperCase('ru-RU');
  } catch (_) {
    return ru.toUpperCase();
  }
}

/**
 * 词条已是英文/标识符（无 CJK、可打印 ASCII、含拉丁字母）→ 英文列可直接拷贝
 * @param {string} text
 * @returns {boolean}
 */
function isLatinIdentifierCi(text) {
  const s = String(text || '').trim();
  if (!s || CJK_RE.test(s)) return false;
  if (!/[A-Za-z]/.test(s)) return false;
  return /^[\x20-\x7E]+$/.test(s);
}

/**
 * 英文列 KEEP：无 CJK 拉丁词条可拷到英文翻译（源已是英文，不经 DeepSeek）
 * @param {string} text
 * @returns {boolean}
 */
function shouldKeepCopyEn(text) {
  return isLatinIdentifierCi(text);
}

/**
 * 俄文列 KEEP：仅认 DeepSeek 整词判定缓存（禁止长度/形态启发式）
 * @param {string} text
 * @param {Map<string, { action: string }>|null|undefined} [entryKeepCache]
 * @returns {boolean}
 */
function shouldKeepCopyRu(text, entryKeepCache) {
  return isEntryKeepByCache(text, entryKeepCache);
}

/**
 * @deprecated 请传 entryKeepCache；无缓存时恒为 false
 * @param {string} text
 * @param {Map|null|undefined} [entryKeepCache]
 * @returns {boolean}
 */
function shouldKeepCopyCi(text, entryKeepCache) {
  return shouldKeepCopyRu(text, entryKeepCache);
}

/**
 * 统计文本中的换行数（\r\n 先归一）
 * @param {string} text
 * @returns {number}
 */
function countNewlines(text) {
  return (String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').match(/\n/g) || [])
    .length;
}

/**
 * 短英文源 vs 长俄文+凭空占位符 → 疑似批线错位
 * @param {string} originalText
 * @param {string} translatedText
 * @returns {boolean}
 */
function isSuspectEn2RuMisalign(originalText, translatedText) {
  const en = String(originalText || '').trim();
  const ru = String(translatedText || '').trim();
  if (!en || !ru) return false;
  if (/^[A-Za-z][A-Za-z\- ]{0,24}$/.test(en) && en.length <= 20) {
    const enPh = (en.match(/%\d+/g) || []).length;
    const ruPh = (ru.match(/%\d+/g) || []).length;
    if (ruPh > enPh) return true;
    if (ru.length > Math.max(40, en.length * 4) && CYRILLIC_RE.test(ru)) return true;
  }
  return false;
}

/**
 * en2ru 质量硬门禁：CJK、换行对齐、括注英注、错位启发（不含 echo，由 validateEn2RuNotEcho 负责）
 * @param {string} originalText
 * @param {string} translatedText
 * @returns {{ isValid: boolean, issues: string[] }}
 */
function validateEn2RuQuality(originalText, translatedText) {
  const issues = [];
  const src = String(originalText || '');
  const tgt = String(translatedText || '');
  if (!tgt.trim()) {
    return { isValid: false, issues: ['翻译结果为空'] };
  }

  if (CJK_RE.test(tgt)) {
    issues.push('俄文含中日韩字符（禁止中文夹杂）');
  }

  // 越南语等拉丁扩展（如 ẫ）— 常见于乱码混译
  if (/[\u0100-\u024F\u1E00-\u1EFF]/.test(tgt)) {
    issues.push('俄文含非俄语拉丁扩展字符（疑似乱码）');
  }

  if (countNewlines(src) !== countNewlines(tgt)) {
    issues.push(
      `换行数不一致（源=${countNewlines(src)} 译=${countNewlines(tgt)}）`
    );
  }

  if (hasEnglishGlossParen(tgt)) {
    issues.push('残留括号英注');
  }

  if (isSuspectEn2RuMisalign(src, tgt)) {
    issues.push('疑似批线错位（短源配长译/凭空占位符）');
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * en2ru 语言门禁：拒写「英文原样回显」与「应出西里尔却无西里尔」的假译
 * @param {string} originalText
 * @param {string} translatedText
 * @param {{ entryKeepCache?: Map }} [options]
 * @returns {{ isValid: boolean, issues: string[] }}
 */
function validateEn2RuNotEcho(originalText, translatedText, options = {}) {
  const issues = [];
  const src = String(originalText || '').trim();
  const tgt = String(translatedText || '').trim();
  if (!tgt) {
    return { isValid: false, issues: ['翻译结果为空'] };
  }
  // 源文无可译拉丁字母 → 不强制西里尔
  if (!/[A-Za-z]/.test(src)) {
    return { isValid: true, issues: [] };
  }

  const allowIdentity =
    isAllowedEnRuIdentity(src) || isEntryKeepByCache(src, options.entryKeepCache);

  if (src === tgt) {
    if (!allowIdentity) {
      issues.push('疑似未翻译（俄文与英文相同）');
    }
    return { isValid: issues.length === 0, issues };
  }

  const latinCount = (src.match(/[A-Za-z]/g) || []).length;
  if (latinCount >= 4 && !CYRILLIC_RE.test(tgt)) {
    if (allowIdentity && src === tgt) {
      return { isValid: true, issues: [] };
    }
    const stripped = tgt
      .replace(BATCH_PH_TOKEN_RE, '')
      .replace(/%\d+/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[0-9\s.,;:!?\-_/\\()'"`~@#%^*=+[\]{}|<>]+/g, '');
    // 点号/空译文/纯符号 → 仍视为未翻译；白名单身份复制已在上文处理
    if (stripped.length === 0 || /[A-Za-z]/.test(stripped)) {
      issues.push('疑似未翻译（无西里尔字母）');
    }
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * 验证翻译结果
 * @param {string} originalText - 原始文本
 * @param {string} translatedText - 翻译文本
 * @param {Array} placeholders - 占位符数组
 * @param {{ stage?: string, allowIdentityKeep?: boolean }} [options] - stage=en2ru|zh2ru 时启用语言门禁
 * @returns {Object} { isValid: boolean, issues: string[] }
 */
function validateTranslation(originalText, translatedText, placeholders, options = {}) {
  const issues = [];

  // 检查占位符是否被保护
  for (const placeholder of placeholders) {
    if (!translatedText.includes(placeholder.original)) {
      issues.push(`占位符丢失: ${placeholder.original}`);
    }
  }

  // 检查翻译是否为空
  if (!translatedText || translatedText.trim() === '') {
    issues.push('翻译结果为空');
  }

  // 校验 %x 格式是否被破坏（允许换序，但禁止 % 1 / % 2 这种）
  if (/%\s+\d+/.test(translatedText)) {
    issues.push('可区分占位符格式被破坏（禁止 "% 1" 这种写法）');
  }

  // 检查 [] 内部的占位符组合格式是否被加空格破坏（例如 [ {} - {} ]）
  if (/\[\s+\{/.test(translatedText) || /\}\s+\]/.test(translatedText)) {
    issues.push('方括号占位符格式被破坏（禁止 "[{ }]" 或 "[ {} ]" 这种写法）');
  }

  const stage = options && options.stage;
  if (stage === 'en2ru' || stage === 'zh2ru') {
    // KEEP 整词拷贝：跳过 echo/西里尔门禁（词条原样落盘）
    if (options && options.allowIdentityKeep) {
      // DeepSeek 已判 KEEP：只跳过语言门禁
    } else if (!(stage === 'zh2ru' && CJK_RE.test(String(originalText || '')))) {
      const echo = validateEn2RuNotEcho(originalText, translatedText, {
        entryKeepCache: options.entryKeepCache
      });
      if (!echo.isValid) issues.push(...echo.issues);
      const quality = validateEn2RuQuality(originalText, translatedText);
      if (!quality.isValid) issues.push(...quality.issues);
    } else {
      const quality = validateEn2RuQuality(originalText, translatedText);
      if (!quality.isValid) issues.push(...quality.issues);
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// ==================== 步骤7: 写入CSV ====================

/**
 * 若目标文件被占用（Windows/WPS常见 EBUSY/EPERM），自动生成一个不冲突的备用路径
 * @param {string} originalPath
 * @returns {string}
 */
function buildAvailableOutputPath(originalPath) {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);

  // 优先使用 _new，其次 _new2, _new3...
  let candidate = path.join(dir, `${base}_new${ext}`);
  if (!fs.existsSync(candidate)) return candidate;

  for (let i = 2; i <= 50; i++) {
    candidate = path.join(dir, `${base}_new${i}${ext}`);
    if (!fs.existsSync(candidate)) return candidate;
  }

  // 最后兜底：时间戳
  return path.join(dir, `${base}_${Date.now()}${ext}`);
}

/**
 * 写文件（带重试 + 被占用时自动换名）
 * @param {string} outputPath
 * @param {string} content
 * @param {number} retries
 */
function writeTextFileWithRetryAndFallback(outputPath, content, retries = 3) {
  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      fs.writeFileSync(outputPath, content, 'utf8');
      return outputPath;
    } catch (err) {
      lastErr = err;
      const code = err && err.code;
      if (code === 'EBUSY' || code === 'EPERM') {
        // 简单等待后重试（同步 sleep）
        const waitMs = 400 * attempt;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
        continue;
      }
      throw err;
    }
  }

  // 仍失败：换名输出
  if (lastErr && (lastErr.code === 'EBUSY' || lastErr.code === 'EPERM')) {
    const fallbackPath = buildAvailableOutputPath(outputPath);
    fs.writeFileSync(fallbackPath, content, 'utf8');
    return fallbackPath;
  }

  throw lastErr;
}

/**
 * 写入CSV文件（UTF-8 BOM编码）
 * @param {string} outputPath - 输出文件路径
 * @param {Array} headers - 标题数组
 * @param {Array} rows - 数据行数组
 */
function writeCsvFile(outputPath, headers, rows) {
  console.log(`正在写入CSV文件: ${outputPath}`);

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 构建CSV内容
  let csvContent = '';

  // 写入标题行
  csvContent += headers.map(h => escapeCsvField(h)).join(',') + '\n';

  // 写入数据行
  for (const row of rows) {
    const values = headers.map(header => row[header] || '');
    csvContent += values.map(v => escapeCsvField(v)).join(',') + '\n';
  }

  // 写入UTF-8 BOM编码的文件
  const BOM = '\uFEFF';
  const actualPath = writeTextFileWithRetryAndFallback(outputPath, BOM + csvContent, 3);

  if (actualPath !== outputPath) {
    console.warn(`CSV目标文件被占用，已改为写入: ${actualPath}`);
  }
  console.log(`CSV文件写入完成: ${actualPath}`);
}

/**
 * 生成WPS/Excel友好的预览文件（XLSX），用于设置列宽等样式
 * 注意：CSV格式本身不支持列宽；因此通过额外生成xlsx实现“打开即有列宽”。
 *
 * @param {string} xlsxPath - 输出xlsx文件路径
 * @param {Array} headers - 标题数组
 * @param {Array} rows - 数据行数组
 * @param {Object} options
 * @param {Object<string, number>} options.columnWidthConfig - 列宽配置（以字符宽度 wch 计）
 * @param {number} options.defaultWidth - 未配置列的默认宽度
 */
function writeXlsxPreviewFile(xlsxPath, headers, rows, options = {}) {
  const columnWidthConfig = options.columnWidthConfig || {};
  const defaultWidth = Number.isFinite(options.defaultWidth) ? options.defaultWidth : 20;

  console.log(`正在写入XLSX预览文件: ${xlsxPath}`);

  // 确保输出目录存在
  const outputDir = path.dirname(xlsxPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 组装二维数组：第一行headers，后续为数据
  const aoa = [headers];
  for (const row of rows) {
    aoa.push(headers.map((header) => (row && row[header] !== undefined && row[header] !== null) ? String(row[header]) : ''));
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 设置全表单元格样式：顶端对齐、左对齐（便于WPS预览）
  // 注意：xlsx 的样式依赖于写入库能力；当前项目使用 xlsx，在WPS/Excel中一般可生效
  const cellAlignmentStyle = { alignment: { vertical: 'top', horizontal: 'left', wrapText: true } };
  const range = XLSX.utils.decode_range(ws['!ref'] || `A1:A1`);
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellAddress];
      if (!cell) continue;
      cell.s = cell.s || {};
      cell.s.alignment = { ...(cell.s.alignment || {}), ...cellAlignmentStyle.alignment };
    }
  }

  // 设置列宽（wch: 字符宽度），便于在WPS中打开时呈现更友好的样式
  ws['!cols'] = headers.map((h) => {
    const width = columnWidthConfig[h];
    const wch = Number.isFinite(width) ? width : defaultWidth;
    return { wch };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  let actualPath = xlsxPath;
  try {
    XLSX.writeFile(wb, xlsxPath);
  } catch (err) {
    if (err && (err.code === 'EBUSY' || err.code === 'EPERM')) {
      actualPath = buildAvailableOutputPath(xlsxPath);
      XLSX.writeFile(wb, actualPath);
      console.warn(`XLSX目标文件被占用，已改为写入: ${actualPath}`);
    } else {
      throw err;
    }
  }
  console.log(`XLSX预览文件写入完成: ${actualPath}`);
}

/**
 * 转义CSV字段
 * @param {string} field - 字段值
 * @returns {string} 转义后的字段
 */
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);

  // 如果包含逗号、引号或换行符，需要用引号包裹
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // 转义引号：将 " 替换为 ""
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

// ==================== 步骤8: 记录错误 ====================

/**
 * 记录错误日志
 * @param {string} outputDir - 输出目录
 * @param {string} filename - 文件名（不含扩展名）
 * @param {Array} errors - 错误数组
 */
function logErrors(outputDir, filename, errors) {
  if (errors.length === 0) {
    console.log('没有错误需要记录');
    return;
  }

  const logPath = path.join(outputDir, `${filename}_errors.log`);

  let logContent = `翻译错误日志\n`;
  logContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  logContent += `总错误数: ${errors.length}\n\n`;

  // 按类型分组
  const byType = {
    translation: [],
    chinese: [],
    validation: []
  };

  for (const error of errors) {
    if (error.type === 'translation') {
      byType.translation.push(error);
    } else if (error.type === 'chinese') {
      byType.chinese.push(error);
    } else if (error.type === 'validation') {
      byType.validation.push(error);
    }
  }

  // 写入错误详情
  if (byType.translation.length > 0) {
    logContent += `\n## 翻译失败 (${byType.translation.length}条)\n\n`;
    for (const error of byType.translation) {
      logContent += `ID: ${error.id}\n`;
      logContent += `词条: ${error.entry}\n`;
      logContent += `错误: ${error.message}\n\n`;
    }
  }

  if (byType.chinese.length > 0) {
    logContent += `\n## 中文不规范 (${byType.chinese.length}条)\n\n`;
    for (const error of byType.chinese) {
      logContent += `ID: ${error.id}\n`;
      logContent += `词条: ${error.entry}\n`;
      logContent += `问题: ${error.issues.join(', ')}\n\n`;
    }
  }

  if (byType.validation.length > 0) {
    logContent += `\n## 验证失败 (${byType.validation.length}条)\n\n`;
    for (const error of byType.validation) {
      logContent += `ID: ${error.id}\n`;
      logContent += `词条: ${error.entry}\n`;
      logContent += `翻译: ${error.translation}\n`;
      logContent += `问题: ${error.issues.join(', ')}\n\n`;
    }
  }

  // 统计信息
  logContent += `\n## 统计信息\n`;
  logContent += `翻译失败: ${byType.translation.length}\n`;
  logContent += `中文不规范: ${byType.chinese.length}\n`;
  logContent += `验证失败: ${byType.validation.length}\n`;

  fs.writeFileSync(logPath, logContent, 'utf8');
  console.log(`错误日志已写入: ${logPath}`);
}

// ==================== 主函数 ====================

/**
 * 主函数
 * @param {string} inputCsvPath - 输入CSV文件路径
 * @param {string} outputDirPath - 输出目录路径
 * @param {string} excelGlossaryPath - Excel术语库文件路径
 * @param {Object} options - 可选参数
 * @param {boolean} options.debugPrompt - 是否输出调试 prompt
 */
async function main(inputCsvPath, outputDirPath, excelGlossaryPath, options = {}) {
  try {
    const modeId = (options && options.mode) || 'zh2en';
    const mode = MODES[modeId] || MODES.zh2en;
    const forceOverwrite = !!(options && options.force);
    const limit = Number.isFinite(options && options.limit) ? options.limit : null;

    console.log(`=== 词条批量翻译开始（mode=${mode.id}）===\n`);
    const enabledApis = assertAnyTranslateApiEnabled();
    console.log(`已启用供应商: ${enabledApis.join(', ')}（密钥来自 ${path.join(HUIYAN_SKILLS_ROOT, '.env')}）\n`);

    const activeWorkers = resolveActiveTranslateWorkers({
      multiModel: !!(options && options.multiModel),
      models: options && options.models,
      mode: mode.id
    });
    const termCachePath = path.join(outputDirPath, 'en2ru-term-decisions.json');
    const termDecisionCache = loadTermDecisionCache(termCachePath);
    const entryKeepCachePath = path.join(outputDirPath, 'entry-keep-decisions.json');
    const entryKeepCache = loadEntryKeepCache(entryKeepCachePath);
    _runtimeTranslateOptions = {
      multiModel: !!(options && options.multiModel),
      models: options && options.models,
      mode: mode.id,
      activeWorkers
    };
    const nextWorker = createWorkerRoundRobin(activeWorkers);
    console.log(
      `活跃翻译模型 (${activeWorkers.length}): ${activeWorkers.map((w) => w.id).join(', ')}\n`
    );

    const defaultGlossaryPath = path.join(__dirname, 'glossary', '常用注意要点清单.xlsx');
    const defaultRulesPath = path.join(__dirname, 'glossary', 'translation-rules.md');
    const glossaryPath = excelGlossaryPath || defaultGlossaryPath;
    const rulesPath = defaultRulesPath;
    const shouldForceReExtract = !!excelGlossaryPath;

    let abbreviationMap = new Map();
    let fullTranslationMap = new Map();
    let pseudoCodeRuleMap = new Map();
    let excelTranslationRulesMarkdown = '';
    let commentRuleMap = new Map();

    if (mode.useGlossary) {
      await ensureGlossaryExtracted(glossaryPath, rulesPath, shouldForceReExtract);
      ({ abbreviationMap, fullTranslationMap, pseudoCodeRuleMap } = loadTranslationRules(rulesPath));
      excelTranslationRulesMarkdown = loadExcelTranslationRulesMarkdown(glossaryPath);
    } else {
      console.log(`${mode.id} 模式：跳过中文术语库加载\n`);
    }

    const { headers, entries } = readCsvOrXlsxFile(inputCsvPath);
    const hasCommentColumn = headers.includes('comment');
    const hasTagColumn = headers.includes('tag');
    if (mode.useGlossary && (hasCommentColumn || hasTagColumn)) {
      const commentRulesExcelPath = path.join(__dirname, 'glossary', 'comment对应场景及规则.xlsx');
      commentRuleMap = loadCommentScenarioRules(commentRulesExcelPath);
    }

    const hasNote1Column = headers.includes('备注1');
    const outputHeaders = hasNote1Column ? headers : [...headers, '备注1'];
    const errors = [];
    const processedEntries = new Array(entries.length);

    console.log('\n开始翻译词条...\n');

    const stages = Array.isArray(mode.stages) ? mode.stages : [mode.id];
    const doZh2en = stages.includes('zh2en');
    const doEn2ru = stages.includes('en2ru');
    const doZh2ru = stages.includes('zh2ru');
    const doRu = doEn2ru || doZh2ru;
    const zh2enBatchSize = mode.batchSizeZh2en || (doZh2en && !doRu ? mode.batchSize : 100);
    const en2ruBatchSize = mode.batchSizeEn2ru || mode.batchSize || 40;
    const zh2ruBatchSize = mode.batchSizeZh2ru || mode.batchSize || 40;

    /** @type {Array<object>} */
    const workRows = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const ci = String(entry['词条'] || '').trim();
      const en = String(entry['英文翻译'] || '').trim();
      const ru = String(entry['俄文翻译'] || '').trim();
      const commentValue = hasCommentColumn ? (entry['comment'] || '') : '';
      const tagValue = hasTagColumn ? (entry['tag'] || '') : '';
      const commentRulesMarkdown = (mode.useGlossary && (hasCommentColumn || hasTagColumn))
        ? buildCommentRulesSectionMarkdown(commentValue, commentRuleMap, tagValue)
        : '';

      let needZh2en = false;
      let needEn2ru = false;
      let needZh2ru = false;

      if (mode.id === 'zh2en') {
        needZh2en = !!ci;
      } else if (mode.id === 'en2ru') {
        const source = ci || en;
        needEn2ru = !!source && (forceOverwrite || !ru);
      } else if (mode.id === 'pipeline') {
        needZh2en = !!ci && (forceOverwrite || !en);
        const willHaveEn = !!en || needZh2en;
        needEn2ru = willHaveEn && (forceOverwrite || !ru);
      } else if (mode.id === 'dual') {
        needZh2en = !!ci && (forceOverwrite || !en);
        needZh2ru = !!ci && (forceOverwrite || !ru);
      }

      if (!needZh2en && !needEn2ru && !needZh2ru) {
        processedEntries[i] = { ...entry, '备注1': entry['备注1'] || '' };
        continue;
      }

      workRows.push({
        index: i,
        entry,
        ci,
        en,
        ru,
        needZh2en,
        needEn2ru,
        needZh2ru,
        comment: commentValue,
        tag: tagValue,
        commentRulesMarkdown
      });
    }

    let limitedWorkRows = workRows;
    if (limit !== null && limit >= 0) {
      limitedWorkRows = workRows.slice(0, limit);
      console.log(`已启用 --limit ${limit}：待处理 ${workRows.length} 行中取前 ${limitedWorkRows.length} 行\n`);
      const limitedIdx = new Set(limitedWorkRows.map((e) => e.index));
      for (const row of workRows) {
        if (!limitedIdx.has(row.index) && !processedEntries[row.index]) {
          processedEntries[row.index] = { ...row.entry, '备注1': row.entry['备注1'] || '' };
        }
      }
    }

    const zh2enRows = limitedWorkRows.filter((r) => r.needZh2en);
    const en2ruReadyRows = limitedWorkRows.filter((r) => r.needEn2ru && !r.needZh2en);
    const zh2ruRows = limitedWorkRows.filter((r) => r.needZh2ru);
    const pipelinePendingEn2ru = limitedWorkRows.filter((r) => r.needZh2en && r.needEn2ru).length;

    console.log(
      `共 ${limitedWorkRows.length} 行待处理（zh2en=${zh2enRows.length}, en2ru就绪=${en2ruReadyRows.length}, 待流水线en2ru=${pipelinePendingEn2ru}, zh2ru=${zh2ruRows.length}）\n`
    );
    if (TLS_INSECURE) {
      console.log('已启用 TRANSLATE_TLS_INSECURE（跳过 HTTPS 证书校验，适配企业网关）\n');
    }

    const inputFilenameBase = path.basename(inputCsvPath, path.extname(inputCsvPath));
    const deliverStem = inputFilenameBase.replace(/_RU机翻$/u, '') || inputFilenameBase;
    const checkpointCsvPath = (doRu || mode.id === 'pipeline' || mode.id === 'dual')
      ? path.join(outputDirPath, `${deliverStem}_RU机翻.csv`)
      : (doZh2en ? path.join(outputDirPath, `${deliverStem}_EN机翻.csv`) : null);
    if (checkpointCsvPath) {
      console.log(`断点文件: ${checkpointCsvPath}\n`);
    }

    const debugPromptEnabled = options && options.debugPrompt;
    const sortEnabled = doRu
      ? !!(options && options.sort === true)
      : !(options && options.sort === false);
    let debugPromptContent = '';
    const debugPromptSnippets = [];
    if (debugPromptEnabled) {
      debugPromptContent = `# Prompt 调试文件\n\n生成时间: ${new Date().toLocaleString('zh-CN')}\n输入文件: ${inputCsvPath}\nmode: ${mode.id}\n\n`;
      console.log('已启用 --debugPrompt，将记录每个批次的 prompt\n');
    }

    const xfyunConcurrency = getXfyunConcurrency();
    const poolSlots = activeWorkers.reduce((sum, w) => sum + (w.maxInflight || 1), 0);
    const dagConcurrency = Math.min(20, Math.max(1, poolSlots));
    console.log(
      `并发策略: DAG 池上限 ${dagConcurrency}（讯飞≤${xfyunConcurrency}；硅基每模型≤${API_CONFIG.siliconflow.concurrency}；智谱串行1）；mode=${mode.id}\n`
    );

    // 拉丁词条去重 → DeepSeek 判 KEEP/TRANSLATE（俄文列禁止启发式）
    if (doRu) {
      const decideTexts = [];
      for (const row of limitedWorkRows) {
        if (row.needZh2ru && row.ci) decideTexts.push(row.ci);
        if (row.needEn2ru) {
          const src = String(row.en || row.ci || '').trim();
          if (src) decideTexts.push(src);
        }
      }
      const uniqueEntries = collectUniqueEntryKeepCandidates(decideTexts);
      if (uniqueEntries.size > 0) {
        console.log(`整词 KEEP 判定候选（去重）: ${uniqueEntries.size} 条 → DeepSeek\n`);
        try {
          const verifyWorker = resolveVerifyWorker();
          const stats = await decideMissingEntryKeepWithLlm(uniqueEntries, entryKeepCache, {
            callBatch: (prompt, n) => verifyWorker.callBatch(prompt, n),
            promptDir: PROMPT_TEMPLATE_DIR,
            batchSize: 40,
            onBatch: ({ size }) => {
              console.log(`  🔤 整词 KEEP 判定批 ${size} 条（缓存 ${entryKeepCache.size}）`);
            }
          });
          saveEntryKeepCache(entryKeepCachePath, entryKeepCache);
          console.log(
            `整词 KEEP 判定完成: asked=${stats.asked} keep=${stats.keep} translate=${stats.translate} failBatches=${stats.failedBatches}\n`
          );
        } catch (e) {
          console.warn(`⚠ DeepSeek 整词 KEEP 判定不可用: ${e.message}`);
          console.warn('  未判定条目将送 MT（不假 KEEP）\n');
        }
      }
    }

    function buildStageItem(row, stage) {
      let text = '';
      if (stage === 'zh2en' || stage === 'zh2ru') {
        text = row.ci || String(row.entry['词条'] || '');
      } else {
        const pe = processedEntries[row.index];
        text = String((pe && pe['英文翻译']) || row.en || row.ci || '').trim();
      }
      const protectedPayload = protectUndistinguishablePlaceholders(text);
      return {
        index: row.index,
        entry: processedEntries[row.index] || row.entry,
        text,
        ...protectedPayload,
        placeholders: extractPlaceholders(text),
        comment: row.comment,
        tag: row.tag,
        commentRulesMarkdown: row.commentRulesMarkdown,
        needEn2ru: row.needEn2ru,
        needZh2ru: row.needZh2ru,
        stage
      };
    }

    function makeUnits(stage, rows, batchSize) {
      const chunks = chunkArray(rows, batchSize);
      const kind =
        stage === 'zh2en' ? 'zh2en_batch' : stage === 'zh2ru' ? 'zh2ru_batch' : 'en2ru_batch';
      return chunks.map((chunkRows, idx) => ({
        kind,
        stage,
        unitId: `${stage}-${idx + 1}`,
        items: chunkRows.map((r) => buildStageItem(r, stage))
      }));
    }

    let unitSeq = 0;
    const initialReady = [
      ...makeUnits('zh2en', zh2enRows, zh2enBatchSize),
      ...makeUnits('en2ru', en2ruReadyRows, en2ruBatchSize),
      ...makeUnits('zh2ru', zh2ruRows, zh2ruBatchSize)
    ].map((u) => ({ ...u, unitId: `${u.kind}-${++unitSeq}` }));

    console.log(
      `初始就绪单元: ${initialReady.length}（zh2en批 + en2ru已就绪批 + zh2ru批）\n`
    );

    async function processWorkUnit(unit) {
      const stage = unit.stage;
      const items = unit.items || [];
      const preferred = nextWorker();
      console.log(
        `\n[${unit.kind}] ${unit.unitId} · ${items.length} 条` +
        (preferred ? ` · 首选 ${preferred.id}` : '')
      );

      const batchEntries = [];
      for (const item of items) {
        const note1Issues = [];
        let forcedTranslation = null;
        const live = buildStageItem(
          {
            index: item.index,
            entry: processedEntries[item.index] || item.entry,
            ci: String((processedEntries[item.index] || item.entry)['词条'] || item.text || ''),
            en: String((processedEntries[item.index] || item.entry)['英文翻译'] || ''),
            needEn2ru: item.needEn2ru,
            comment: item.comment,
            tag: item.tag,
            commentRulesMarkdown: item.commentRulesMarkdown
          },
          stage
        );

        if (stage === 'zh2en') {
          const chineseValidation = validateChinese(live.text);
          const unitNormalization = normalizeUnitTranslation(live.text);
          if (!chineseValidation.isValid) {
            note1Issues.push(...chineseValidation.issues.map((issue) => `中文不规范: ${issue}`));
            errors.push({
              type: 'chinese',
              id: live.entry.id || `row_${live.index + 1}`,
              entry: live.text,
              issues: chineseValidation.issues
            });
          }
          if (unitNormalization.note1Issues.length > 0) {
            note1Issues.push(...unitNormalization.note1Issues);
          }
          forcedTranslation = unitNormalization.forcedTranslation;
          // 英文/标识符词条：直接拷贝，不调 MT
          if (!forcedTranslation && isLatinIdentifierCi(live.text)) {
            forcedTranslation = String(live.text).trim();
            note1Issues.push('预处理: 英文/标识符词条拷贝为英文翻译');
          }
          const { note1Issues: trimIssues } = detectCommentTagTrimMatchIssues(live.entry, commentRuleMap);
          if (trimIssues.length > 0) note1Issues.push(...trimIssues);
          const { note1Issues: conflictIssues } = detectCommentTagRuleConflict(live.entry, commentRuleMap);
          if (conflictIssues.length > 0) note1Issues.push(...conflictIssues);
        } else if (stage === 'zh2ru') {
          const src = String(live.text || '').trim();
          // 仅代码标识/白名单 KEEP；普通英文词（products/BACKUP）必须走 MT
          if (shouldKeepCopyRu(src, entryKeepCache)) {
            forcedTranslation = src;
            note1Issues.push('预处理: DeepSeek KEEP → 词条拷贝为俄文');
          }
        }

        batchEntries.push({ ...live, note1Issues, forcedTranslation });
      }

      let translations = [];
      let apiFailed = false;
      try {
        const toTranslate = [];
        const translateIndexMap = [];
        for (let i = 0; i < batchEntries.length; i++) {
          const item = batchEntries[i];
          if (item.forcedTranslation) continue;
          toTranslate.push({
            index: item.index,
            text: item.protectedText || item.text,
            placeholders: item.placeholders,
            comment: item.comment || '',
            tag: item.tag || '',
            commentRulesMarkdown: item.commentRulesMarkdown || ''
          });
          translateIndexMap.push(i);
        }

        translations = new Array(batchEntries.length).fill('');
        for (let i = 0; i < batchEntries.length; i++) {
          if (batchEntries[i].forcedTranslation) {
            translations[i] = batchEntries[i].forcedTranslation;
          }
        }

        const promptOpts = {
          mode: stage,
          excelTranslationRulesMarkdown,
          commentRuleMap,
          preferredWorkerId: preferred && preferred.id,
          activeWorkers
        };
        if (toTranslate.length > 0) {
          if (debugPromptEnabled) {
            const batchPrompt = buildBatchTranslationPrompt(
              toTranslate, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap, promptOpts
            );
            debugPromptSnippets.push(
              `---\n\n## ${unit.unitId} (${stage})\n\n词条数量: ${toTranslate.length} 条\n\n### Prompt 内容\n\n\`\`\`\n${batchPrompt}\n\`\`\`\n\n`
            );
          }

          const modelTranslations = await translateBatch(
            toTranslate, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap, promptOpts
          );
          for (let k = 0; k < translateIndexMap.length; k++) {
            translations[translateIndexMap[k]] = modelTranslations[k] || '';
          }
          console.log(`  ✅ ${stage} 批量翻译成功（模型调用 ${toTranslate.length} 条）\n`);
        } else {
          console.log('  ✅ 本单元无需调用模型\n');
        }
      } catch (error) {
        apiFailed = true;
        console.error(`  ❌ ${stage} 批量翻译失败: ${error.message}\n`);
        translations = new Array(batchEntries.length).fill('');
        for (let i = 0; i < batchEntries.length; i++) {
          if (batchEntries[i].forcedTranslation) {
            translations[i] = batchEntries[i].forcedTranslation;
            continue;
          }
          batchEntries[i].note1Issues.push(`翻译失败: ${error.message}`);
          errors.push({
            type: 'translation',
            id: batchEntries[i].entry.id || `row_${batchEntries[i].index + 1}`,
            entry: batchEntries[i].text,
            message: error.message
          });
        }
      }

      const followUpRows = [];
      /** @type {string[]} */
      const preparedTexts = new Array(batchEntries.length).fill('');

      for (let i = 0; i < batchEntries.length; i++) {
        const item = batchEntries[i];
        let translatedText = translations[i] || '';
        let allowWrite = true;

        if (!item.forcedTranslation) {
          if (item.tokenOrder && item.tokenOrder.length > 0) {
            let tokenValidation = validateUndistinguishableTokenOrder(translatedText, item.tokenOrder);
            if (!tokenValidation.isValid && stage === 'zh2en') {
              try {
                const retryRaw = await translateProtectedEntryStrict(
                  item.protectedText || item.text,
                  abbreviationMap,
                  fullTranslationMap,
                  {
                    commentRulesMarkdown: item.commentRulesMarkdown || '',
                    pseudoCodeRuleMap,
                    excelTranslationRulesMarkdown
                  }
                );
                const retryValidation = validateUndistinguishableTokenOrder(retryRaw, item.tokenOrder);
                if (retryValidation.isValid) {
                  translatedText = retryRaw;
                  tokenValidation = retryValidation;
                }
              } catch (e) { /* ignore */ }
            }
            if (!tokenValidation.isValid) {
              allowWrite = false;
              item.note1Issues.push(...tokenValidation.issues.map((issue) => `翻译验证失败: ${issue}`));
              errors.push({
                type: 'validation',
                id: item.entry.id || `row_${item.index + 1}`,
                entry: item.text,
                translation: translatedText,
                issues: tokenValidation.issues
              });
            }
          }
          translatedText = restoreUndistinguishablePlaceholders(
            translatedText,
            item.tokenReplacements || []
          );
        }

        if (translatedText) {
          const post = postprocessTranslation(translatedText);
          translatedText = post.text;
          if (post.issues.length > 0) {
            item.note1Issues.push(...post.issues.map((msg) => `后处理: ${msg}`));
          }
        }

        if ((stage === 'en2ru' || stage === 'zh2ru') && translatedText) {
          const mtPost = postprocessEn2RuMtArrow(translatedText, item.text);
          translatedText = mtPost.text;
          if (mtPost.issues.length > 0) {
            item.note1Issues.push(...mtPost.issues.map((msg) => `后处理: ${msg}`));
          }
          const gloss = stripEn2RuEnglishGlossParen(translatedText);
          translatedText = gloss.text;
          if (gloss.issues.length > 0) {
            item.note1Issues.push(...gloss.issues.map((msg) => `后处理: ${msg}`));
          }
          const caps = preserveAllCapsCyrillic(item.text, translatedText);
          if (caps !== translatedText) {
            translatedText = caps;
            item.note1Issues.push('后处理: 全大写源文→全大写俄文');
          }
        }

        if (stage === 'zh2en' && translatedText) {
          const unitPost = postprocessUnitZhao(item.text, translatedText);
          translatedText = unitPost.text;
          if (unitPost.issues.length > 0) {
            item.note1Issues.push(...unitPost.issues.map((msg) => `后处理: ${msg}`));
          }
          const caseResult = applyCaseRuleForEntry(translatedText, item.entry, commentRuleMap);
          translatedText = caseResult.text;
          if (caseResult.issues && caseResult.issues.length > 0) {
            item.note1Issues.push(...caseResult.issues.map((msg) => `后处理: ${msg}`));
          }
        }

        item._allowWrite = allowWrite;
        preparedTexts[i] = translatedText;
      }

      // en2ru/zh2ru：本批残留英文去重 → 分批 LLM 判定 → 写回（复用 termDecisionCache）
      if ((stage === 'en2ru' || stage === 'zh2ru') && !apiFailed) {
        const pendingRows = preparedTexts.map((ru, i) => ({
          id: batchEntries[i].entry.id || `row_${batchEntries[i].index + 1}`,
          ru,
          spans: extractResidualEnglishSpans(ru)
        }));
        const unique = collectUniqueResidualTerms(pendingRows);
        if (unique.size > 0) {
          const worker = preferred || (activeWorkers && activeWorkers[0]);
          if (worker && worker.callBatch) {
            await decideMissingTermsWithLlm(unique, termDecisionCache, {
              callBatch: (prompt, n) => worker.callBatch(prompt, n),
              promptDir: PROMPT_TEMPLATE_DIR,
              batchSize: 50,
              onBatch: ({ size }) => {
                console.log(`  🔤 术语判定批 ${size} 词（缓存累计 ${termDecisionCache.size}）`);
              }
            });
            if (termCachePath) saveTermDecisionCache(termCachePath, termDecisionCache);
          }
          for (let i = 0; i < preparedTexts.length; i++) {
            const applied = applyTermDecisionsToRussian(preparedTexts[i], termDecisionCache);
            preparedTexts[i] = applied.text;
            if (applied.replaced.length > 0) {
              batchEntries[i].note1Issues.push(
                `后处理: 残留英文已替换 ${applied.replaced.slice(0, 5).join(', ')}`
              );
            }
            if (applied.kept.length > 0) {
              batchEntries[i].note1Issues.push(
                `后处理: 残留英文术语保留 ${[...new Set(applied.kept)].slice(0, 8).join(', ')}`
              );
            }
          }
        }
      }

      for (let i = 0; i < batchEntries.length; i++) {
        const item = batchEntries[i];
        let translatedText = preparedTexts[i] || '';
        const processedEntry = { ...(processedEntries[item.index] || item.entry) };
        let allowWrite = item._allowWrite !== false;

        const targetCol = stage === 'zh2en' ? '英文翻译' : '俄文翻译';
        const ciText = String(
          processedEntry['词条'] || item.text || (item.entry && item.entry['词条']) || ''
        ).trim();
        const keepOk =
          stage === 'zh2en'
            ? shouldKeepCopyEn(ciText)
            : shouldKeepCopyRu(ciText, entryKeepCache);
        const isKeepForced =
          !!item.forcedTranslation &&
          keepOk &&
          String(item.forcedTranslation).trim() === ciText;

        // 译文为空但可 KEEP → 直接拷贝词条，禁止留空
        if (!String(translatedText || '').trim() && keepOk) {
          translatedText = ciText;
          item.note1Issues.push('兜底: KEEP 词条拷贝（译文为空）');
        }

        if (translatedText) {
          const translationValidation = validateTranslation(
            item.text,
            translatedText,
            item.placeholders,
            {
              stage,
              entryKeepCache,
              allowIdentityKeep:
                isKeepForced || (keepOk && translatedText === ciText)
            }
          );
          if (!translationValidation.isValid) {
            item.note1Issues.push(...translationValidation.issues.map((issue) => `翻译验证失败: ${issue}`));
            errors.push({
              type: 'validation',
              id: item.entry.id || `row_${item.index + 1}`,
              entry: item.text,
              translation: translatedText,
              issues: translationValidation.issues
            });
            if (isKeepForced || (keepOk && translatedText === ciText)) {
              // KEEP：校验失败也必须落盘词条，不清空
              allowWrite = true;
              item.note1Issues.push('KEEP 仍落盘: 词条已拷贝到目标列');
            } else {
              allowWrite = false;
            }
          }
          if (allowWrite) {
            processedEntry[targetCol] = translatedText;
          } else if (keepOk) {
            processedEntry[targetCol] = ciText;
            item.note1Issues.push('兜底: KEEP 词条拷贝（校验未过仍落盘）');
          } else if (forceOverwrite || !String(processedEntry[targetCol] || '').trim()) {
            processedEntry[targetCol] = '';
          }
        } else if (keepOk) {
          processedEntry[targetCol] = ciText;
          item.note1Issues.push('兜底: KEEP 词条拷贝（无译文）');
        } else if (forceOverwrite || !String(processedEntry[targetCol] || '').trim()) {
          processedEntry[targetCol] = '';
        }

        const prevNote = String(processedEntry['备注1'] || '').trim();
        const newNote = item.note1Issues.length > 0 ? item.note1Issues.join('; ') : '';
        processedEntry['备注1'] = [prevNote, newNote].filter(Boolean).join('; ');
        processedEntries[item.index] = processedEntry;

        if (stage === 'zh2en' && doEn2ru && item.needEn2ru && String(processedEntry['英文翻译'] || '').trim()) {
          followUpRows.push({
            index: item.index,
            entry: processedEntry,
            ci: String(processedEntry['词条'] || ''),
            en: String(processedEntry['英文翻译'] || ''),
            needEn2ru: true,
            comment: item.comment,
            tag: item.tag,
            commentRulesMarkdown: item.commentRulesMarkdown
          });
        }
      }

      const enqueue = [];
      if (followUpRows.length > 0) {
        const followUnits = makeUnits('en2ru', followUpRows, en2ruBatchSize).map((u) => ({
          ...u,
          unitId: `en2ru-follow-${++unitSeq}`
        }));
        enqueue.push(...followUnits);
      }

      return { ok: !apiFailed, reduceConcurrency: apiFailed, enqueue };
    }

    await runDagScheduler({
      initialReady,
      maxConcurrency: dagConcurrency,
      worker: processWorkUnit,
      onWaveDone: async () => {
        if (!checkpointCsvPath) return;
        for (let i = 0; i < entries.length; i++) {
          if (!processedEntries[i]) {
            processedEntries[i] = { ...entries[i], '备注1': entries[i]['备注1'] || '' };
          }
        }
        // 浅拷贝快照，降低与在途 worker 写同一引用的竞态
        const snap = processedEntries.map((e) => (e ? { ...e } : e));
        writeCsvFile(checkpointCsvPath, outputHeaders, snap);
        console.log(`  💾 波次断点已保存: ${checkpointCsvPath}`);
      }
    });

    // 收尾：KEEP 词条目标列禁止留空（英/俄分别判定）
    let keepFilled = 0;
    for (let i = 0; i < entries.length; i++) {
      if (!processedEntries[i]) {
        processedEntries[i] = { ...entries[i], '备注1': entries[i]['备注1'] || '' };
      }
      const e = processedEntries[i];
      const ci = String(e['词条'] || '').trim();
      const notes = [];
      if (doZh2en && shouldKeepCopyEn(ci) && !String(e['英文翻译'] || '').trim()) {
        e['英文翻译'] = ci;
        notes.push('收尾: KEEP 词条拷贝→英文');
        keepFilled += 1;
      }
      if (doRu && shouldKeepCopyRu(ci, entryKeepCache) && !String(e['俄文翻译'] || '').trim()) {
        e['俄文翻译'] = ci;
        notes.push('收尾: KEEP 词条拷贝→俄文');
        keepFilled += 1;
      }
      if (notes.length) {
        const prev = String(e['备注1'] || '').trim();
        e['备注1'] = [prev, ...notes].filter(Boolean).join('; ');
      }
    }
    if (keepFilled > 0) {
      console.log(`KEEP 收尾补齐空目标列: ${keepFilled} 处\n`);
    }

    const limitedEntries = limitedWorkRows.map((r) =>
      buildStageItem(
        r,
        doZh2ru ? 'zh2ru' : doEn2ru && !doZh2en ? 'en2ru' : 'zh2en'
      )
    );

    if (debugPromptEnabled && debugPromptSnippets.length > 0) {
      debugPromptContent += debugPromptSnippets.join('');
    }

    if (debugPromptEnabled && limitedEntries.length > 0) {
      const rawEntriesForPrompt = limitedEntries.map((item, idx) => ({
        index: idx,
        text: item.text,
        comment: item.comment || '',
        tag: item.tag || '',
        commentRulesMarkdown: item.commentRulesMarkdown || ''
      }));
      const promptMode =
        mode.id === 'pipeline' ? 'en2ru' : mode.id === 'dual' ? 'zh2ru' : mode.id;
      const rawPrompt = buildBatchTranslationPrompt(
        rawEntriesForPrompt, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap,
        { mode: promptMode, excelTranslationRulesMarkdown, commentRuleMap }
      );
      debugPromptContent += `---\n\n# 手工翻译用 Prompt（未保护占位符）\n\n\`\`\`\n${rawPrompt}\n\`\`\`\n\n`;
    }

    for (let i = 0; i < entries.length; i++) {
      if (!processedEntries[i]) {
        processedEntries[i] = { ...entries[i], '备注1': '' };
      }
    }

    let finalEntries = processedEntries;
    if (sortEnabled) {
      console.log('\n正在对词条进行排序...');
      finalEntries = [...processedEntries].sort((a, b) => {
        const note1A = String(a['备注1'] || '').trim();
        const note1B = String(b['备注1'] || '').trim();
        const hasNote1A = note1A.length > 0;
        const hasNote1B = note1B.length > 0;
        if (hasNote1A && !hasNote1B) return -1;
        if (!hasNote1A && hasNote1B) return 1;
        if (hasNote1A && hasNote1B) {
          const c = note1A.localeCompare(note1B, 'zh-CN');
          if (c !== 0) return c;
        }
        const entryCompare = String(a['词条'] || '').localeCompare(String(b['词条'] || ''), 'zh-CN');
        if (entryCompare !== 0) return entryCompare;
        return String(a['comment'] || '').localeCompare(String(b['comment'] || ''), 'zh-CN');
      });
    } else {
      console.log('\n跳过排序，保持原文件顺序\n');
    }

    const inputFilename = path.basename(inputCsvPath, path.extname(inputCsvPath));
    const en2ruOutputStem = inputFilename.replace(/_RU机翻$/u, '') || inputFilename;
    const inputExt = path.extname(inputCsvPath).toLowerCase();
    const WPS_PREVIEW_COLUMN_WIDTH_CONFIG = {
      '词条': 80,
      '英文翻译': 80,
      '俄文翻译': 80,
      '备注1': 80
    };

    if (mode.id === 'en2ru' || mode.id === 'pipeline' || mode.id === 'dual') {
      // CSV 输入：交付 *_RU机翻.csv；同时写一份 xlsx 便于抽检
      // 若输入本身已是 *_RU机翻.csv（断点续跑），不再叠加后缀
      if (inputExt === '.csv') {
        const csvOutPath = path.join(outputDirPath, `${en2ruOutputStem}_RU机翻.csv`);
        writeCsvFile(csvOutPath, outputHeaders, finalEntries);
        console.log(`${mode.id} CSV 输出: ${csvOutPath}`);
      }
      const xlsxOutPath = path.join(outputDirPath, `${en2ruOutputStem}_RU机翻.xlsx`);
      writeXlsxPreviewFile(xlsxOutPath, outputHeaders, finalEntries, {
        columnWidthConfig: WPS_PREVIEW_COLUMN_WIDTH_CONFIG,
        defaultWidth: 20
      });
      console.log(`${mode.id} XLSX 输出: ${xlsxOutPath}`);
    } else {
      const outputPath = path.join(outputDirPath, path.basename(inputCsvPath));
      if (inputExt === '.xlsx' || inputExt === '.xls') {
        writeXlsxPreviewFile(outputPath.replace(/\.(xlsx|xls)$/i, '.xlsx'), outputHeaders, finalEntries, {
          columnWidthConfig: WPS_PREVIEW_COLUMN_WIDTH_CONFIG,
          defaultWidth: 20
        });
      } else {
        writeCsvFile(outputPath, outputHeaders, finalEntries);
        writeXlsxPreviewFile(outputPath.replace(/\.csv$/i, '.xlsx'), outputHeaders, finalEntries, {
          columnWidthConfig: WPS_PREVIEW_COLUMN_WIDTH_CONFIG,
          defaultWidth: 20
        });
      }
    }

    logErrors(outputDirPath, inputFilename, errors);

    if (debugPromptEnabled && debugPromptContent) {
      const debugPromptPath = path.join(outputDirPath, `${inputFilename}_prompt_debug.md`);
      fs.writeFileSync(debugPromptPath, debugPromptContent, 'utf8');
      console.log(`\nPrompt 调试文件已写入: ${debugPromptPath}`);
    }

    console.log('\n=== 翻译完成 ===');
    console.log(`成功: ${processedEntries.length - errors.length} 条`);
    console.log(`错误: ${errors.length} 条`);
  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let inputPath, outputDir, glossaryPath;
  let debugPrompt = false;
  let sortEnabled = false;
  let mode = 'zh2en';
  let limit = null;
  let force = false;
  let multiModel = false;
  let models = null;
  const positionalArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--debugPrompt') debugPrompt = true;
    else if (arg === '--sort') sortEnabled = true;
    else if (arg === '--no-sort') sortEnabled = false;
    else if (arg === '--force') force = true;
    else if (arg === '--multi-model' || arg === '--multiModel') multiModel = true;
    else if (arg === '--models') {
      multiModel = true;
      models = String(args[++i] || '').trim();
    } else if (arg.startsWith('--models=')) {
      multiModel = true;
      models = arg.slice('--models='.length).trim();
    } else if (arg === '--mode') mode = String(args[++i] || 'zh2en').trim();
    else if (arg.startsWith('--mode=')) mode = arg.slice('--mode='.length).trim();
    else if (arg === '--limit') limit = Number(args[++i]);
    else if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length));
    else positionalArgs.push(arg);
  }

  [inputPath, outputDir, glossaryPath] = positionalArgs;

  if (!inputPath || !outputDir) {
    console.error(
      '用法: node translateCsv.js <输入路径> <输出目录> [Excel术语库路径] ' +
      '[--mode zh2en|en2ru|pipeline|dual] [--limit N] [--force] [--multi-model] [--models list|all] [--debugPrompt]'
    );
    process.exit(1);
  }
  if (!MODES[mode]) {
    console.error(`未知 mode: ${mode}，可选: ${Object.keys(MODES).join(', ')}`);
    process.exit(1);
  }

  main(inputPath, outputDir, glossaryPath, {
    debugPrompt,
    sort: sortEnabled,
    mode,
    limit: Number.isFinite(limit) ? limit : null,
    force,
    multiModel,
    models
  }).catch(console.error);
}


module.exports = {
  ensureGlossaryExtracted,
  loadTranslationRules,
  loadExcelTranslationRulesMarkdown,
  readCsvFile,
  readXlsxFile,
  readCsvOrXlsxFile,
  translateEntry,
  translateBatch,
  extractPlaceholders,
  protectUndistinguishablePlaceholders,
  restoreUndistinguishablePlaceholders,
  validateUndistinguishableTokenOrder,
  parseBatchTranslationResponse,
  BATCH_NL_TOKEN,
  postprocessTranslation,
  postprocessUnitZhao,
  normalizeUnitTranslation,
  validateChinese,
  validateTranslation,
  validateEn2RuNotEcho,
  validateEn2RuQuality,
  isAllowedEnRuIdentity,
  isLatinIdentifierCi,
  shouldKeepCopyEn,
  shouldKeepCopyRu,
  shouldKeepCopyCi,
  isEntryKeepByCache,
  isEntryKeepDecideCandidate,
  loadEntryKeepCache,
  saveEntryKeepCache,
  isSuspectEn2RuMisalign,
  countNewlines,
  resolveActiveTranslateWorkers,
  resolveVerifyWorker,
  stripEn2RuEnglishGlossParen,
  extractResidualEnglishSpans,
  applyTermDecisionsToRussian,
  hasEnglishGlossParen,
  parseTermDecideResponse,
  writeCsvFile,
  writeXlsxPreviewFile,
  logErrors,
  main
};
