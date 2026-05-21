---
name: map-wire-stable
description: Use when Vue 或 TypeScript 项目需要把后端原始 wire 脏模型与前端稳定模型分层治理，尤其适用于接口版本迁移、gateway 重构、状态码或枚举清理，以及页面正在直接消费 enable、status code、后端枚举值等传输字段的场景。
---

# Wire 脏模型与 Stable 稳定模型映射

## 概述
这个 skill 用来约束前端分层职责：

- `src/types/*`：只放稳定模型，供业务层、视图层、store、composable 使用
- `src/api/*`：只放 API 方法和 API 需要消费的脏模型
- `src/gateway/*`：只放映射方法和网关方法

业务层不能直接依赖后端脏字段。API 层不能定义业务稳定模型。Gateway 是唯一允许做双向转换的层。

## 何时使用

在以下场景使用：

- 后端返回原始码值，例如 `0/1/2/3/4`
- 页面正在直接使用 `enable`、`statusCode`、后端枚举串、传输专用字段
- 同一业务需要兼容 v1/v2 多个接口版本，但前端希望只维护一种稳定模型
- gateway 中混杂了 UI 友好值和 API 请求值
- API 文件里开始出现业务语义，应该迁到 `types`

在以下场景不要使用：

- 项目没有 gateway 层
- API 契约本身就等于业务模型，且明确允许业务层直接消费

## 强制规则

1. 稳定模型必须放在 `src/types/*.d.ts` 或 `src/types/*.ts`
2. API 文件只定义脏模型和原始 API 方法
3. Gateway 文件必须持有 `mapWire2Stable*` 和 `mapStable2Wire*`
4. Gateway 请求方法调用 API 前，必须把稳定模型转换为脏模型
5. Gateway 响应方法返回业务层前，必须把脏模型转换为稳定模型
6. 视图层、store、composable、业务逻辑只能消费稳定模型
7. 不要从 gateway 向业务层重新暴露脏模型，除非任务明确要求排查 raw 响应

## 标准目录

```text
src/
  types/
    user.d.ts
  api/
    seccenter/
      user.v2.api.ts
  gateway/
    system/
      user.gateway.ts
```

## 标准流程

### 1. 先定义稳定模型

稳定模型放在 `src/types/<domain>.d.ts`。

示例：

```ts
export type UserStableStatus = "unspecified" | "active" | "locked" | "disabled" | "activation";

export interface UserPageVO {
  id: string;
  userName?: string;
  roleName?: string;
  status?: UserStableStatus;
}
```

### 2. API 层只保留脏模型

API 文件必须贴近传输契约，不要掺入业务语义。

示例：

```ts
export interface UserV2 {
  id: string;
  username?: string;
  status?: number;
}

export interface ListUsersV2Request {
  keyword?: string;
  status?: number;
}
```

### 3. Gateway 层补双向映射

必须成对出现：

```ts
export function mapWire2StableUserStatus(status?: number | null): UserStableStatus {
  switch (status) {
    case 1:
      return "active";
    case 2:
      return "locked";
    case 3:
      return "disabled";
    case 4:
      return "activation";
    default:
      return "unspecified";
  }
}

export function mapStable2WireUserStatus(status?: UserStableStatus): number | undefined {
  switch (status) {
    case "active":
      return 1;
    case "locked":
      return 2;
    case "disabled":
      return 3;
    case "activation":
      return 4;
    case "unspecified":
      return 0;
    default:
      return undefined;
  }
}
```

### 4. Gateway 方法必须消费映射

请求方向：

- 业务层传稳定模型
- gateway 把稳定模型转成脏模型
- api 发送脏请求

响应方向：

- api 返回脏响应
- gateway 把脏响应转成稳定模型
- 业务层拿到稳定数据

### 5. 清理业务层 raw 字段泄漏

视图和 store 不应继续出现：

- `enable`
- `USER_STATUS_ACTIVE` 一类后端枚举串
- `status === 3` 一类原始码值比较

统一改为稳定字段和稳定字面量联合类型。

## 迁移检查清单

- [ ] 稳定模型已经落到 `src/types`
- [ ] API 文件只剩脏请求/脏响应模型
- [ ] Gateway 已新增 `mapWire2Stable*`
- [ ] Gateway 已新增 `mapStable2Wire*`
- [ ] Gateway 请求方法已做 stable -> wire 转换
- [ ] Gateway 响应方法已做 wire -> stable 转换
- [ ] 视图层和 store 已从 `src/types` 引稳定模型
- [ ] 业务层旧 raw 字段用法已删除
- [ ] 测试覆盖双向映射

## 回归检查清单

- [ ] 每个原始状态码都有映射测试
- [ ] 查询接口发送的是脏值
- [ ] 列表/详情接口返回的是稳定值
- [ ] 没有视图或 store 继续引原始传输类型
- [ ] `rg -n "\benable\b|\bstatusCode\b|\bUSER_STATUS_" src` 没有落在不该出现的业务层

## 模板

使用 `templates/` 下模板：

- `templates/types.domain.d.ts.template`
- `templates/api.v2.template.ts`
- `templates/gateway.template.ts`
- `templates/gateway.test.template.ts`

## 常见错误

- 把稳定模型写进 API 文件
- Gateway 直接把 raw 响应透传给页面
- 页面直接比较原始码值，例如 `status === 3`
- 稳定字段已经存在，但还保留 `enable` 之类兼容字段在业务层继续流转
- Gateway 方法直接接受业务层传入的 raw payload

## 产出标准

最终分层必须满足：

- `types`：表达业务含义
- `api`：表达后端原始契约
- `gateway`：负责两者翻译
