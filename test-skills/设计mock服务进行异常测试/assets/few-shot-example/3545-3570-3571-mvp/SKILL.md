# Few-shot：3545/3570/3571 MVP

本目录沉淀 apex_dev CSV 异常 UI mock 会话的黄金样本。

## before（RED 基线）

- 无 `csv-error*.mock.ts`，8080 访问得到真实 `code:0`
- 8081 直连显示「暂无页面访问权限」
- 自测说明堆在单一 `mock/README.csv-error-mvp.md`（197 行，易膨胀）
- committed mock 使用 `seccenter/v2/...` 无 `forward/` 前缀

## after（GREEN 产物）

见 `after/` 目录：

- `mock-snippet-3545.ts` — user/list 失败分支
- `cases_registry-snippet.yaml` — 三用例 registry
- `automation-3545.md` — 单用例 README 样例
- `workflow-excerpt.md` — workflow 结构摘要
- `mock-README-slim.md` — 瘦索引样例

## 关键决策

1. 方案 A：8081 + Console 注入 `isOwner: true`
2. `.env.development.local` 开 mock（非 `.env.local`）
3. `error-scenario.json` 切换 active，刷新即可
4. 文档分层：workflow 完整流程 / automation 每用例 / mock README 索引
