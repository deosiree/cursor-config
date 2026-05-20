# api-gateway-add 输出检查清单

## 基础结构
- [ ] 存在 `README.md`
- [ ] 存在 `SKILL.md`
- [ ] 存在 `template/`
- [ ] 存在 `assets/`
- [ ] 存在 `references/`
- [ ] 存在 `evals/`
- [ ] 存在 `feature-skills/`（编排类子能力）
- [ ] 存在 `test-prompts.json`（可选：Darwin 试跑）

## 分层边界
- [ ] `src/api/**` 只承载原始接口与原始类型
- [ ] 原始类型名与契约定义名一致
- [ ] `src/types/**` 只承载稳定类型
- [ ] 业务层只消费 gateway 方法与稳定类型
- [ ] 映射函数命名为 `mapWire2StableXXX` / `mapStable2WireXXX`

## 常量边界
- [ ] 共用常量上提到 `src/enums/**`
- [ ] 页面专用常量保留在业务层本地

## 输出内容
- [ ] 有现状链路
- [ ] 有四层改动清单
- [ ] 有字段来源说明
- [ ] 有风险点与不做项
