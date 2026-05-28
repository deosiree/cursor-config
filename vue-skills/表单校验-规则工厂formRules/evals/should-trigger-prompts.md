# Should trigger

- 给 MenuFormDialog 的 routePath 加表单校验，允许 /user? 拼参
- 租户名按 formRules 标识符规则校验，失焦 trim
- 在 formRules.ts 里新增邮箱必填工厂并接到用户表单
- componentPath 是 src/views/system/user/components/UserFormFields.vue，userName 要 nameIdentifier
- repoRoot 是 ./my-app，moduleHint 菜单表单，加名称和路径校验
- 检查当前仓库，推荐最值得完善表单规则的一个字段（只盘点）
- 扫一遍表单校验覆盖度，告诉我下一项该改什么
- routePath 分段校验要加 chkSegIllegalChars，按 formRules-module-map 编排 for 循环
- ApiConfigDialog 的 apiUrl 用 createApiPathRules，失焦用 trimFieldOnBlur
- 路径超长报错用 `{label}超过{maxLength}字`，不要另写「路径超过64个字符」
- UserFormFields 改密用 pwdPair + ConfigGateway.getPwdPolicy，父级 rules 去掉 password
- 个人中心改密弹窗一打开全红，按 known-issues 加 validate-on-rule-change false
- apex 用户重置密码对话框也要 validate-on-rule-change false
- apex 改了 formRules.ts，把 skill 样本同步一下（先 dry-run）
- formRules 样本对齐 microfb 和 apex，更新 template 里的 formRules.ts
- 给密码对配 tips，PwdPolicyTip 和 pwdPair 用同一套 policy
- 忘记密码页标题下要显示密码复杂度说明（microfb ForgotStepPanel）
