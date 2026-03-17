# nebula-skills 导航

## 定位
1. 仅存放 `nebula` 项目专有 skills（与业务路由、菜单、微前端挂载规则强相关）。
2. 这些 skill 不建议在其他项目复用。

## 当前 skills
1. `route-architecture-delivery-skills`
   - 面向：`nebula` 架构设计与交付推进路由
   - 包含：微前端登录落点/路由前缀一致性、Vite 代理 v1/v2 分流与 404 排障场景
2. `mf-route-home-alignment`
   - 面向：登录回跳、默认首页、历史 `/manage` 到 `/Apex` 兼容治理
3. `vite-proxy-v2-debug`
   - 面向：`/dev-api` 404、v1/v2 代理错配、`vite.config.ts/js` 双轨导致配置不生效
4. `route-scatter-check`
   - 面向：路由相关改动后的 hardcoded 路径散点巡检与收束（router/guard/menu/activeRule/base）

## 使用示例
1. `使用 $route-architecture-delivery-skills 根据当前 nebula 架构目标推荐最合适 skill。`
2. `使用 $mf-route-home-alignment 统一主子应用路由前缀、默认首页和登录回跳。`
3. `使用 $vite-proxy-v2-debug 排查并修复 microfb 的 Vite 代理 404 与 v1/v2 分流问题。`
4. `使用 $route-scatter-check 检查本次路由改动是否仍有散点并输出收束清单。`

## 维护规则
1. 业务规则变更时优先更新这里，再决定是否回流到通用 skills。
2. 新增专有 skill 时，同步更新本 README 与对应 route skill 的决策矩阵。
