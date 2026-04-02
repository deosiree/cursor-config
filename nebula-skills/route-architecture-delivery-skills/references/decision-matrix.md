# 决策矩阵（架构与交付）

1. 旧接口向新接口迁移且要证据化清单，优先 `api-swagger-ready`。
2. 同仓多版本并行与灰度回滚，优先 `version-switch-with-env`。
3. 从需求到原型到 API 再到任务拆解，优先 `prototype-driven-dev`。
4. 需要计划-测试-分析闭环，优先 `plan-test-analysis`。
5. 任务启动时需要规范分支命名，优先 `git-gen-branch`。
6. 多天未推送且改动混杂，需按功能分批提交并产出规范 commit 名称，优先 `git-commit-batching`。
7. 微前端登录回跳/默认首页/历史前缀不一致（如 `/manage` 与 `/Apex` 混用）优先 `mf-route-home-alignment`。
8. Vite 本地代理出现 `/dev-api/...` 404、v1/v2 分流错配、配置文件双轨（`vite.config.ts/js`）导致改动不生效，优先 `vite-proxy-v2-debug`。
9. 修改路由相关代码后需要检查 hardcoded 路径散点（router/guard/menu/activeRule/base/redirect），优先 `route-scatter-check`。
10. 需要梳理或落地“功能项 -> API -> API 契约 -> 前端网关方法 -> 注册中心上送/下发”链路，并要求明确真相源、单写点、节点来源文件/变量/属性，优先 `route-api-gateway-register`。

## 跨技能顺序建议（新增）

1. 若同时涉及 API 契约与链路落地，固定顺序为：
   - `seccenter-api-contract` -> `route-api-gateway-register`
2. 先产出契约锚点（`operationId/path/$ref`），再落地动作绑定与注册中心链路，避免“链路先改、契约后补”导致字段漂移。
