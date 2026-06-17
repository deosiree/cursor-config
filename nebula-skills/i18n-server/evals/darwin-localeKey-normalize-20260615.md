# Darwin 评估报告：更新-i18nInput-localeKey归一

**日期**：2026-06-15  
**评估对象**：新建 feature skill `更新-i18nInput-localeKey归一`  
**评估模式**：`dry_run`（结构评分 + 3 条 test-prompt 干跑路由；未 spawn 独立 judge agent）  
**runtime 扫描**：`runtime_warn=0`（无 Claude Code / Cursor only 等红灯）

## 总分

| 指标 | 值 |
|------|-----|
| **总分** | **85 / 100** |
| 对比 sibling（R1 后） | 新增-i18nInput-表单字段 90、更新-i18nInput-缓存投影 91 |
| 结论 | **keep** — 达到可用门槛（≥85），与 I18nInput 三 skill 套件同型 |

## 9 维评分明细

| # | 维度 | 权重 | 得分(1-10) | 加权 | 说明 |
|---|------|------|-----------|------|------|
| 1 | Frontmatter 质量 | 7 | 8 | 5.6 | name/description/触发词完整 |
| 2 | 工作流清晰度 | 12 | 9 | 10.8 | RED→CHECKPOINT→GREEN 清单 7 步 |
| 3 | 失败模式编码 | 12 | 9 | 10.8 | 5 行 if-then 兜底表 |
| 4 | 检查点设计 | 6 | 8 | 4.8 | 🔴 CHECKPOINT 路由门禁 |
| 5 | 可执行具体性 | 17 | 9 | 15.3 | 具名函数、禁止 reintroduce toInput |
| 6 | 资源整合度 | 4 | 7 | 2.8 | references + before/after + 2 few-shot；utils 片段未整文件复制 |
| 7 | 整体架构 | 12 | 9 | 10.8 | 与「更新-缓存投影」「新增-表单字段」分层一致 |
| 8 | 实测表现 | 23 | 8 | 18.4 | dry_run：3/3 prompt 正确路由本 skill |
| 9 | 反例与黑名单 | 6 | 9 | 5.4 | 独立「不要做什么」5 条 |

## test-prompt 干跑（dim8）

| id | prompt | 预期 skill | 干跑结果 |
|----|--------|-----------|----------|
| locale-1 | MenuFormDialog i18nInput key 对不上，参考 AlarmFormDialog 改 parse | 更新-i18nInput-localeKey归一 | 命中 |
| locale-2 | 编辑旧菜单主输入空，wire 是 zh_CN | 更新-i18nInput-localeKey归一 | 命中 |
| locale-3 | 告警已 normalize，菜单 FormDialog 也要调 | 更新-i18nInput-localeKey归一 | 命中 |

竞争 prompt（不应触发）：

- 「第一次给字段接 I18nInput」→ 正确排除，路由 `新增-i18nInput-表单字段`
- 「切换语言导航不更新」→ 正确排除，路由 `更新-i18nInput-缓存投影`

## 改进建议（下一轮可选，非阻塞）

1. **dim6**：在 `template/after` 补一份 `utils/i18n.ts` 中 normalize 函数摘录（或链到读侧 template 已有 utils）
2. **dim8**：补 1 次 full_test（真实 agent 带 skill 改 FormDialog diff），提升 dim8 置信度
3. **父级路由**：`编排-i18n迁移` 正文可补「多意图并列时 locale 错位 vs 缓存不更新」分流一句（与 2026-06-10 报告遗留项一致）

## 同步变更（本次沉淀范围）

- 新建 `feature-skills/更新-i18nInput-localeKey归一/`（SKILL、README、evals、test-prompts、before/after template、2 few-shot）
- 更新 `references/I18nInput-wire字段契约.md`（内存 key 改为连字符 + normalize）
- 更新 `references/skill历史版本对应`（2b106736、7fd591de、MenuFormDialog）
- 更新 `intention-skills/路由-选择功能子skill`（gap 18 + 路由规则）
- 更新 `新增-i18nInput-表单字段` 主 SKILL + snapshot/mvp 模板与 few-shot 模板

## 日志

详见 `evals/darwin-results.tsv` 行 `2026-06-15Tbaseline` / `2026-06-15Tr0`。
