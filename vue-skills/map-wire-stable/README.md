# map-wire-stable

这是一个可直接被 Codex/Claude 加载的通用 skill，用于在 Vue/TypeScript 项目中建立统一的数据分层约束：

- `types` 层存放稳定模型
- `api` 层存放 API 方法和 API 需要消费的脏模型
- `gateway` 层存放映射方法与网关方法
- 业务层和其他调用方只消费稳定模型

## 解决什么问题

当后端返回的数据包含以下特征时，前端很容易失控：

- 原始状态码，例如 `0/1/2/3/4`
- 后端专用枚举串
- 为传输协议服务的字段名，例如 `enable`、`statusCode`
- 同一业务存在 v1/v2 多套接口结构

如果页面、store、composable 直接消费这些 raw 字段，后续迁移接口、切版本、修状态显示时就会很痛苦。

这个 skill 的目标就是把这些问题稳定收口到 gateway。

## 使用原则

1. 稳定模型只放 `src/types`
2. API 文件只描述原始契约
3. Gateway 负责双向映射
4. 业务层只拿稳定模型

## 推荐落地顺序

1. 在 `src/types/<domain>.d.ts` 定义稳定模型
2. 在 `src/api/...` 中保留 raw request/response 模型
3. 在 `src/gateway/...` 中定义：
   - `mapWire2Stable*`
   - `mapStable2Wire*`
4. 修改 gateway 方法，让请求和响应都通过映射
5. 清理页面和 store 中的 raw 字段使用
6. 补双向映射测试

## 模板目录

`templates/` 下提供了四个模板：

- `types.domain.d.ts.template`
- `api.v2.template.ts`
- `gateway.template.ts`
- `gateway.test.template.ts`

建议从模板复制后，再按具体领域重命名。

## 适用场景

- 接口版本迁移
- 状态码或枚举清理
- raw 字段泄漏到页面
- gateway 层职责不清
- 想把前端模型从后端契约中解耦

## 不适用场景

- 项目没有 gateway 层
- 后端返回结构本身就是稳定业务模型

## 示例

可以把本仓库里的用户域迁移当作参考：

- 稳定模型在 `src/types/user.d.ts`
- 原始 v2 API 在 `src/api/seccenter/user.v2.api.ts`
- 映射和网关方法在 `src/gateway/system/user.gateway.ts`

如果需要新增更多案例，建议在 `templates/examples/` 下继续扩展。
