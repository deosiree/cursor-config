# 05-registry-module-template

## 目标
为“新增一个 nebula 领域模块”提供最小 registry 模板，重点保证：
1. 路由真相源只在 `src/registry/sources/*/*.pages.ts`
2. 统一消费只走 `src/registry/index.ts`
3. 新模块接入时不再手改 `src/router/routes.ts`
4. `actions/pages/gateway-bindings/api-meta/index` 五类文件一次性备齐，满足注册上报链路
5. `routes.ts` 与 `page-route-registry.ts` 都只消费 `@/registry`，不再单独维护页面清单

## 推荐使用顺序
1. 先复制 `apex_dev/src/registry/sources/__template__/`
2. 再用本 skill 校对模块骨架与单写点
3. 按需用 `01-function-api-contract-chain` 对齐动作/API 契约
4. 如需对接上送/回填，再用 `03-registry-reporting-flow`

## 当前模板位置
`apex_dev/src/registry/sources/__template__/README.md`

## 输出要求
1. 模块文件清单
2. 单写点清单
3. 可后补字段清单
4. 验收命令
5. 模板占位符替换说明
