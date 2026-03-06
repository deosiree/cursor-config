# 决策矩阵（架构与交付）

1. 旧接口向新接口迁移且要证据化清单，优先 `api-swagger-ready`。
2. 同仓多版本并行与灰度回滚，优先 `version-switch-with-env`。
3. 从需求到原型到 API 再到任务拆解，优先 `prototype-driven-dev`。
4. 需要计划-测试-分析闭环，优先 `plan-test-analysis`。
5. 任务启动时需要规范分支命名，优先 `git-gen-branch`。
6. 多天未推送且改动混杂，需按功能分批提交并产出规范 commit 名称，优先 `git-commit-batching`。
7. 微前端登录回跳/默认首页/历史前缀不一致（如 `/manage` 与 `/Apex` 混用）优先 `mf-route-home-alignment`。
8. Vite 本地代理出现 `/dev-api/...` 404、v1/v2 分流错配、配置文件双轨（`vite.config.ts/js`）导致改动不生效，优先 `vite-proxy-v2-debug`。
