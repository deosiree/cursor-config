# NeSecretInput 踩坑

来自真实入库会话，编码为失败模式：

| 触发条件 | 一线修复 | 仍失败兜底 |
|---|---|---|
| `#suffix` 模板根写 `v-if="clearable \|\| showPassword"` | 始终声明 `#suffix`；`v-if` 只放在眼睛图标 | 对照 EP：无 suffix 插槽则不创建后缀区 |
| 默认用 `show-password` 要小眼睛 | 自管眼睛 + `type=text` + CSS 掩码 | 文档写明：要浏览器提示才 `nativePwd` |
| 文档写「原生密码输入」用户困惑 | 标题改为「开启浏览器密码提示」 | prop 可保留 `nativePwd` |
| 眼睛在空值时仍显示 | `hasVal` 控制图标显示 | 对齐原生 el-input 行为 |
| 浏览器自动填充蓝底 | native 分支 CSS 覆盖 autofill | — |
| clearable 与眼睛挤在一起 | `el-input__icon` + `margin-left: 8px` | — |

反例：把 PwdField（密码策略）一并塞进 `@nebula/ui`。
