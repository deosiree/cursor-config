/**
 * 登录表单校验规则
 */
const loginRules = computed<FormRules>(() => {
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
