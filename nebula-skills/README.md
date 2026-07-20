# nebula-skills 导航

## 定位
1. 仅存放 `nebula` 项目专有 skills（与业务路由、菜单、微前端挂载规则强相关）。
2. 这些 skill 不建议在其他项目复用。

## 当前 skills
1. `route-api-gateway`
   - 面向：API 分层链路的总路由入口
   - 包含：新增接口接入 vs 旧兼容层退化的场景判定
2. `mf-route-home-alignment`
   - 面向：登录回跳、默认首页、历史 `/manage` 到 `/Apex` 兼容治理
3. `vite-proxy-v2-debug`
   - 面向：`/dev-api` 404、v1/v2 代理错配、`vite.config.ts/js` 双轨导致配置不生效
4. `route-scatter-check`
   - 面向：路由相关改动后的 hardcoded 路径散点巡检与收束（router/guard/menu/activeRule/base）
5. `create-mock-module`
   - 面向：`vite-plugin-mock-dev-server` 按模块开关（`VITE_MOCK_*`）、`8080` 宿主与 `8081` 子应用 mock 双轨对齐
6. `api-gateway-add`
   - 面向：新增接口接入、稳定类型补齐、gateway 映射与业务替换点设计
7. `api-gateway-deprecate`
   - 面向：旧版本接口下线后的旧兼容层、旧 API、旧测试与旧 mock 退化清理
8. `菜单节点的唯一性和有效性校验`
   - 面向：按文档规则做菜单唯一性/有效性只读扫描（YAML→JSON→本 skill `scripts/`）、`page.combo` 解读；脚本不进 `apex_dev`
9. `封装npm依赖包`
   - 面向：跨仓把可复用 UI 抽进 `@nebula/ui`（边界判定、入库、examples、link/发版、消费者升版）；库仓工程细节见 `vue-skills/npm依赖包项目`

## 使用示例
1. `使用 $route-api-gateway 根据当前 API 分层链路场景推荐应该执行新增还是退化 skill。`
2. `使用 $mf-route-home-alignment 统一主子应用路由前缀、默认首页和登录回跳。`
3. `使用 $vite-proxy-v2-debug 排查并修复 microfb 的 Vite 代理 404 与 v1/v2 分流问题。`
4. `使用 $route-scatter-check 检查本次路由改动是否仍有散点并输出收束清单。`
5. `使用 $create-mock-module 为未入 Swagger 的接口增加模块级 mock 开关，并避免误 mock 已有真实接口。`
6. `使用 $api-gateway-add 为新接口输出 api/types/gateway/business 四层最小改动设计。`
7. `使用 $api-gateway-deprecate 结合契约判定旧兼容层、旧 API 和旧测试的退化边界。`
8. `使用 $菜单节点的唯一性和有效性校验 按文档扫导出菜单 YAML，并区分单项目合规与跨项目 page.combo。`
9. `使用 $封装npm依赖包 将业务仓 GuardedSecretInput 核抽进 NeSecretInput，PwdField 留仓，本地 link 联调。`

## 维护规则
1. 业务规则变更时优先更新这里，再决定是否回流到通用 skills。
2. 新增专有 skill 时，同步更新本 README 与对应 route skill 的决策矩阵。
