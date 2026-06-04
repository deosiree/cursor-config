# 角色 Tab 校验踩坑记录

## 元素定位

| 坑 | 表现 | 修复 |
|:---|:-----|:-----|
| `click --name "确定"` 点到遮罩 | 弹窗关闭但未提交 | 用 `click_dialog_footer_button` 只点 `.dialog-footer` 内的按钮 |
| 弹窗 `append-to-body` | `state` 显示 dialog 为空壳 | eval 读 `.el-overlay:not([style*="display: none"])` 可见层 |
| Vue `fill` 不触发 input 事件 | 值填了但 Vue 没收到 | `fill` 失败后 eval `nativeInputValueSetter` 兜底 |
| 按钮文本含空白字符 | `"确 定"`→ `click --name "确定"` 不匹配 | 函数内用 `replace(/\s+/g, '')` trim 比较 |

## 登录

| 坑 | 修复 |
|:---|:-----|
| 8080 有图形验证码 | 改 `-BindOnly`，用户手动登录 |
| local-subapp（8081）无验证码 | 优先用 `--profile local-subapp` |
