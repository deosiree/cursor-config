# 决策矩阵（架构与交付）

1. 旧接口向新接口迁移且要证据化清单，优先 `api-swagger-ready`。
2. 同仓多版本并行与灰度回滚，优先 `version-switch-with-env`。
3. 从需求到原型到 API 再到任务拆解，优先 `prototype-driven-dev`。
4. 需要计划-测试-分析闭环，优先 `plan-test-analysis`。
5. 任务启动时需要规范分支命名，优先 `git-gen-branch`。
6. 微前端登录回跳/默认首页/历史前缀不一致（如 `/manage` 与 `/Apex` 混用）优先 `mf-route-home-alignment`。
