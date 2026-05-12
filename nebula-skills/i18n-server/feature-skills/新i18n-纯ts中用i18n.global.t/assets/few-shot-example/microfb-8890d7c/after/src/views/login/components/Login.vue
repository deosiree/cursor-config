/**
 * 登录表单校验规则
 */
const loginRules = computed<FormRules>(() => {
  // 显式订阅当前语言；这里只是建立依赖，切语言后才能重建 rules 文案。
  void i18n.global.locale.value;
  const rules: FormRules = {
    account: createAccountRules(), // 账号规则
  };

  if (activeTab.value === "password") {
    // 密码规则
    rules.password = createPasswordRules();
  } else {
    // OTP 规则（验证码登录规则）
    rules.otpCode = [requiredRule(MSG.verificationCodeRequired)];
  }
