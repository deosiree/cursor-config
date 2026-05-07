# route-api-gateway 输出检查清单

## 基础结构
- [ ] 存在 `README.md`
- [ ] 存在 `SKILL.md`
- [ ] 存在 `template/`
- [ ] 存在 `assets/`
- [ ] 存在 `references/`
- [ ] 存在 `evals/`

## 路由边界
- [ ] 只输出路由判定，不展开执行步骤
- [ ] 明确区分 `api-gateway-add` 与 `api-gateway-deprecate`
- [ ] 同时命中两者时有顺序建议
- [ ] 至少有一条 `不推荐`

## 契约输入
- [ ] 明确默认 `spec_path`
- [ ] 明确允许显式传入 `spec_path`
- [ ] 明确路由判定前也要先读契约
