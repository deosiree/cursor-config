# 工作台验数播种 · 输出清单

Agent 编排结束时逐项勾选并汇报用户。

## 写库前

- [ ] `verifyTarget` 已确认（product / task / lang / seedProfile）
- [ ] 破坏性重灌时已备份（`backupPath`）或用户明确跳过
- [ ] `dbTarget=local-docker` 才 execute；remote 只贴命令

## 四步落地

- [ ] 任务五人员非空
- [ ] 词条矩阵或种子档案已对齐（命中+miss）
- [ ] `t_user_product` 已绑定；词条 `product_id` 正确
- [ ] `t_product_relation` 行数正确；`task_id` 已回填
- [ ] 全部 `entry_state=3`；目标 `*_trans_id` 为空
- [ ] 任务下 `entry_state=0` 计数为 0

## 验证

- [ ] `验证-翻译阶段就绪` → `verifyPassed=true`
- [ ] 已输出 UI 路径：产品 → 任务 → 翻译阶段
- [ ] 已给出验数卡摘要（原文 / 预期命中）

## 用户开测提示（SYK 示例）

1. 登录 `admin`，部门「通用平台部」
2. 打开产品 **admin** → 任务 **verify-syk-admin**
3. 选 VERIFY/SYK 词条 → 翻译引擎 **术语库**
4. 命中行应见 `SYK-HIT-` 前缀；miss 行不应命中
