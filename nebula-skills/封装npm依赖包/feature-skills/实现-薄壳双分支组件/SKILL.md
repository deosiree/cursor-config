---
name: 实现-薄壳双分支组件
description: 在 nebula-ui 实现无业务依赖的薄壳组件；支持双分支交互（如掩码 vs 原生密码）。Use when 实现 Ne 组件、薄壳、nativePwd、双分支。
---

# 实现-薄壳双分支组件

## 何时使用

- 编排步 2：按 `fileManifest` 写组件实现
- 需要默认行为与可选「原生/浏览器」分支解耦

## 约束

- **禁止** import 业务仓 `@/api`、`@/store`、gateway
- prop 名可技术化（如 `nativePwd`）；**文档标题写用户意图**（如「开启浏览器密码提示」）
- 默认分支不得为了「小眼睛」去开 Element Plus `show-password`（会变成 `type=password`）

## GREEN

1. `index.vue`：props + 双分支模板薄壳；逻辑进 composable。
2. `constants.ts`：正则/样式常量。
3. composable：状态与事件；导出函数写中文 JSDoc。
4. `expose`：如 `reset`、`inputRef`；在 README 说明各分支是否有意义。
5. 自测：有值才显示眼睛；`#suffix` **始终声明**（`v-if` 只挂在图标上，勿挂在 slot 模板根导致 EP 不创建 suffix）。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| clearable=false 时眼睛消失 | 去掉 suffix 模板根上的 v-if | 读 [[references/NeSecretInput踩坑]] |
| 浏览器仍弹密码提示 | 确认默认非 password；检查 name/autocomplete | 文档标明需 `nativePwd` 才开启提示 |
| 类型报错 peer 缺失 | 不把 element-plus 写入 dependencies | 查 peer + vite external |

## 输出

- 已写入的源码路径列表
- `publicApi`：props / emits / expose 表

## 使用示例

```text
实现 NeSecretInput：默认 CSS 掩码 + 自管眼睛；nativePwd 开启浏览器密码提示。
```
