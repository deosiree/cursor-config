# add-api-included_api_types_gateways_views

这是一个“只做设计、不先落代码”的技能包，用来处理这类需求：

- 新增了 1 组或多组接口
- 需要评估如何在 `api / types / gateway / business(view)` 四层接入
- API 契约以 `docs/api/seccenter.swagger.json` 为主
- 目标是输出最小化改动方案，而不是直接实现

默认 Swagger 路径：

`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`

## 输入约定

1. `①xxx接口`
2. `②业务层：xxx 具体用户如何使用`
3. `③api契约参考`

其中 `③` 可省略；省略时使用默认 Swagger 路径。

## 输出约定

输出内容仅为设计方案，通常包括：

- 当前链路与真实替换点
- `api/types/gateway/business` 四层改动清单
- 建议命名
- 风险边界
- 不做项
- 设计 todolist

## 如何使用

直接触发 skill，并提供三段输入即可。若用户没有明确边界，先收敛“只替换哪段业务链路、读链路是否保持不动”。

## 案例模板

本次会话的沉淀案例已保存到：

- [`__template__/menu-function-api-single-write-path.md`](./__template__/menu-function-api-single-write-path.md)

可以把它当作一个具体参照，尤其适合：

- 现有业务通过整资源更新来间接改子资源
- 新增接口是对子资源的单条增删改
- 希望只切写链路，不改读链路
