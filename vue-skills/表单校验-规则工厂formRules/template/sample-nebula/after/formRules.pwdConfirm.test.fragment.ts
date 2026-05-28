import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { FormItemRule } from "element-plus";
import { cfmPwdRules, pwdPair, type PwdCtx } from "@/utils/formRules";

function findMinRule(rules: FormItemRule[], minLen: number) {
  return rules.find((rule) => "min" in rule && rule.min === minLen);
}

function findSyncValidator(rules: FormItemRule[]) {
  return rules.filter((rule) => typeof rule.validator === "function").at(-1);
}

function runValidator(rule: FormItemRule | undefined, value: string): Promise<Error | undefined> {
  return new Promise((resolve) => {
    if (!rule?.validator) {
      resolve(undefined);
      return;
    }
    rule.validator(
      {} as Parameters<NonNullable<FormItemRule["validator"]>>[0],
      value,
      (err) => {
        resolve(err instanceof Error ? err : err != null ? new Error(String(err)) : undefined);
      },
      {} as Parameters<NonNullable<FormItemRule["validator"]>>[3],
      {} as Parameters<NonNullable<FormItemRule["validator"]>>[4]
    );
  });
}

describe("pwdPair", () => {
  const baseCtx: PwdCtx = {
    getPassword: () => "",
    getConfirmPassword: () => "",
    getFormRef: () => undefined,
  };

  it("returns password and confirmPassword keys", () => {
    const pair = pwdPair(baseCtx);
    expect(Object.keys(pair).sort()).toEqual(["confirmPassword", "password"]);
  });

  it("uses policy minLength 7 in min-length message", () => {
    const pair = pwdPair(baseCtx, { policy: { minLength: 7 } });
    expect(findMinRule(pair.password, 7)?.message).toBe("密码不能少于 7 位");
  });

  it("revalidates confirmPassword on password blur when confirm has value", async () => {
    const validateField = vi.fn().mockResolvedValue(undefined);
    const ctx: PwdCtx = {
      getPassword: () => "1234567",
      getConfirmPassword: () => "123456",
      getFormRef: () => ({ validateField }) as unknown as ReturnType<PwdCtx["getFormRef"]>,
    };
    const { password } = pwdPair(ctx, { policy: { minLength: 7 } });
    await runValidator(findSyncValidator(password), "1234567");
    await nextTick();
    expect(validateField).toHaveBeenCalledWith("confirmPassword");
  });
});

describe("cfmPwdRules", () => {
  it("reports min length 8 before mismatch when confirm is too short", async () => {
    const rules = cfmPwdRules(() => "longpassword", 8);
    const validatorRule = rules.filter((rule) => typeof rule.validator === "function").at(-1);
    const error = await runValidator(validatorRule, "short");
    expect(error?.message).toBe("密码不能少于 8 位");
  });
});
