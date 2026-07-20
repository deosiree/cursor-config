# NeSecretInput 入库 few-shot

真实会话样本：从业务仓 `GuardedSecretInput` 抽核进 `@nebula/ui` 的 `NeSecretInput`。

## before（业务仓 · 摘要）

- apex_dev / microfb 各有本地 `GuardedSecretInput`（防密码管理器误填）。
- microfb 另有 `PwdField`：绑定密码策略 / 表单规则 → **业务壳，不入库**。
- 痛点：双仓复制、API 漂移、无统一文档站。

## after（库仓结构）

```text
nebula-ui/src/components/NeSecretInput/
  index.vue          # 薄壳：默认掩码分支 + nativePwd 分支
  useSecretMask.ts   # 掩码逻辑 + 中文 JSDoc
  constants.ts       # ASCII_FILTER / MASK_STYLE
  README.md          # 意图文案：「开启浏览器密码提示」
```

导出：`src/index.ts` 注册 + named export；version `1.0.4`。

examples：`examples/pages/NeSecretInputDoc.vue` + `examples/demos/secret-input/*`（含 `native-pwd.vue`）。

## 决策对照

| 项 | 结论 |
|---|---|
| 核 | NeSecretInput |
| 壳 | PwdField 留仓 |
| 默认 | CSS `-webkit-text-security`，自管眼睛 |
| `nativePwd` | 开启浏览器密码提示（原生 password） |
| 本会话是否已替换消费者 | **否**（另开任务） |

## 踩坑（必须记住）

见 `references/NeSecretInput踩坑.md`：suffix 的 `v-if`、勿默认用 EP `show-password`。
