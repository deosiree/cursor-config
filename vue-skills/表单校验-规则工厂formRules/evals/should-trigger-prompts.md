# Should trigger

- 给 MenuFormDialog 的 routePath 加表单校验，允许 /user? 拼参
- 租户名按 formRules 标识符规则校验，失焦 trim
- 在 formRules.ts 里新增邮箱必填工厂并接到用户表单
- componentPath 是 src/views/system/user/components/UserFormFields.vue，userName 要 nameIdentifier
- repoRoot 是 apex_dev，moduleHint 菜单表单，加名称和路径校验
- 检查 apex_dev 仓库，推荐最值得完善表单规则的一个字段（只盘点）
- 扫一遍表单校验覆盖度，告诉我下一项该改什么
- routePath 分段校验要加 chkSegIllegalChars，按 formRules-module-map 编排 for 循环
- ApiConfigDialog 的 apiUrl 用 createApiPathRules，失焦用 trimFieldOnBlur
- 路径超长报错用 `{label}超过{maxLength}字`，不要另写「路径超过64个字符」
