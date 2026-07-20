# NeSecretInput 库内结构 few-shot

## 样本路径

`nebula-ui/src/components/NeSecretInput/`

## 结构

| 文件 | 职责 |
|---|---|
| `index.vue` | 薄壳；`nativePwd` 双分支 |
| `useSecretMask.ts` | 掩码模式状态与事件 |
| `constants.ts` | ASCII 过滤与掩码样式 |
| `README.md` | 用法与 Props |

## 导出

`src/index.ts`：plugins 数组 + `export { NeSecretInput }`。

## examples

- `examples/pages/NeSecretInputDoc.vue`
- `examples/demos/secret-input/native-pwd.vue` 等
- 启动：`pnpm run dev:examples`

## 消费（尚未强制）

宿主可：

```ts
import { NeSecretInput } from '@nebula/ui'
```

或全局 `app.use(NebulaUI)` 后直接用标签。
