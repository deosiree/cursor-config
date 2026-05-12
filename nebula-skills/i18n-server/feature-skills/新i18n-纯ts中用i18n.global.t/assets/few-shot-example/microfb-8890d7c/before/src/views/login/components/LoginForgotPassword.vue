/**
 * 创建表单验证规则
 */
const verifyRules = computed<FormRules>(() => {
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
  return {
    password: createPasswordRules(),
    confirmPassword: createConfirmPasswordRules(() => form.password),
  };
});
