/**
 * 创建表单验证规则
 */
const verifyRules = computed<FormRules>(() => {
  // 显式订阅当前语言；这里只是建立依赖，切语言后才能重建 rules 文案。
  void i18n.global.locale.value;
  return {
    account: createAccountRules(),
    captchaAnswer: [requiredRule(MSG.captchaAnswerRequired, ["blur", "change"])],
    code: [requiredRule(MSG.verificationCodeRequired, ["blur", "change"])],
  };
});

/**
 * 重置密码表单验证规则
 */
const resetRules = computed<FormRules>(() => {
  // 显式订阅当前语言；这里只是建立依赖，切语言后才能重建 rules 文案。
  void i18n.global.locale.value;
  return {
    password: createPasswordRules(),
    confirmPassword: createConfirmPasswordRules(() => form.password),
  };
});
