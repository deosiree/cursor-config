import { createAccountRules } from "@/utils/formRules";

type PasswordGetter = () => string;
type LoginTab = "password" | "otp";

type LoginRulesOptions = {
  activeTab: LoginTab;
  isCaptchaVisible: boolean;
};

/**
 * 创建共享的表单验证规则
 * @returns 返回一个包含表单验证规则的对象
 */
function createSharedRules() {
  return {
    // 账号验证规则（仅支持手机号或邮箱）
    account: createAccountRules(),
    // 密码验证规则
    password: [
      {
        required: true, // 必填字段
        trigger: "blur", // 在失去焦点时触发验证
        message: "请输入密码", // 必填提示信息
      },
      {
        min: 6, // 最小长度为6
        message: "密码不能少于6位", // 最小长度提示信息
        trigger: "blur", // 在失去焦点时触发验证
      },
    ],
    // 验证码验证规则
    captchaCode: [
      {
        required: true, // 必填字段
        trigger: "blur", // 在失去焦点时触发验证
        message: "请输入验证码", // 必填提示信息
      },
    ],
  };
}

/**
 * 创建登录规则
 * @param activeTab - 当前登录方式
 * @param isCaptchaVisible - 是否显示验证码
 * @returns 返回一个包含表单验证规则的对象
 */
export function createLoginRules({ activeTab, isCaptchaVisible }: LoginRulesOptions) {
  const sharedRules = createSharedRules();
  const rules: Record<string, any[]> = {};

  // 按需开启图形验证码校验
  if (isCaptchaVisible) {
    rules.captchaCode = sharedRules.captchaCode;
  }

  if (activeTab === "password") {
    rules.account = sharedRules.account;
    rules.password = sharedRules.password;
    return rules;
  }

  rules.otpCode = [
    {
      required: true,
      trigger: "blur",
      message: "请输入验证码",
    },
  ];
  rules.account = sharedRules.account;
  return rules;
}

export function createRegisterRules(getPassword: PasswordGetter) {
  return {
    ...createSharedRules(),
    confirmPassword: [
      {
        required: true,
        trigger: "blur",
        message: "请输入密码",
      },
      {
        min: 6,
        message: "密码不能少于6位",
        trigger: "blur",
      },
      {
        validator: (_: unknown, value: string) => value === getPassword(),
        trigger: "blur",
        message: "两次密码输入不一致",
      },
    ],
  };
}
