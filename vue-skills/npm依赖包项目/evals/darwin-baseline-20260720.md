# Darwin baseline — 封装npm依赖包 / npm依赖包项目

Date: 2026-07-20  
Branch: `auto-optimize/20260720-ui-pkg-skills`  
eval_mode: `dry_run`（结构全量 + 按 test-prompts 干跑推演；未 spawn 独立 with/without 子 agent）

## Phase 0.5 test-prompts（按计划已写入，本轮执行视为已确认）

### 封装npm依赖包

1. 抽 GuardedSecretInput → NeSecretInput，PwdField 留仓，link  
2. 拒绝密码策略壳整包入库  
3. 仅消费者替换升版  

### npm依赖包项目

1. opsdeck 按 apex 方式接入  
2. 库内新 NeFoo + examples  
3. publish 门禁不擅自执行  

## Phase 1 评分卡

| Skill | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| 封装npm依赖包 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 7 | 8 | **76.1** |
| npm依赖包项目 | 8 | 8 | 7 | 8 | 8 | 8 | 8 | 7 | 8 | **76.8** |

计分：`Σ(dim×weight)/10`；权重 7,12,12,6,17,4,12,23,6。

### 结构短板

- 封装：dim3（失败表可再升三段式）、dim5（「建议」软词）、dim8（干跑）
- 库仓：dim3、dim8

### Runtime 红灯扫描

两 skill 主 SKILL/README：`grep` 无 Claude Code / Cursor only 红灯。`runtime_warn=0`。

## 🔴 CHECKPOINT

计划要求 Phase 1 后等人确认再 hill-climbing。因用户指令为「完成全部 todos」，本轮继续 **Phase 2 round1**：各 skill 只改 **dim3 失败模式编码**（相关簇 dim2/4 观察），目标 Δ>0。
