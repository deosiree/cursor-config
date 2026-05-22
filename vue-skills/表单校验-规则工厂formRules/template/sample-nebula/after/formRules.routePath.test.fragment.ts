/**
 * sample-nebula — pathLike 单测 runner（放到 rulesModule 同级 __tests__/）
 * 经 createRoutePathRules()[0].validator，不 import validate*
 */
import { describe, expect, it } from "vitest";
import type { FormItemRule } from "element-plus";
import { createRoutePathRules, ROUTE_PATH_MAX_LENGTH } from "@/utils/formRules";

async function runRoutePathValidator(value: string): Promise<string | undefined> {
  const rule = createRoutePathRules()[0];
  const validator = rule.validator as NonNullable<FormItemRule["validator"]>;
  return new Promise((resolve) => {
    validator(rule, value, (error?: Error) => {
      resolve(error?.message);
    });
  });
}

describe("createRoutePathRules", () => {
  it("accepts common paths", async () => {
    for (const value of ["/system/menu", "/user?", "/list?from=menu", "/user/:id"]) {
      expect(await runRoutePathValidator(value)).toBeUndefined();
    }
  });

  it("rejects invalid paths with short messages", async () => {
    const cases: Array<[string, string]> = [
      ["/user:id#", "段中不要用冒号"],
      ["/?xxx", "段首不要片段符"],
      ["/:id#", "动态段不要接#?"],
      ["/user?@", "拼参格式不对"],
    ];
    for (const [input, expected] of cases) {
      const message = await runRoutePathValidator(input);
      expect(message).toBe(expected);
      expect(expected.length).toBeLessThanOrEqual(12);
    }
  });

  it("aligns max length with form maxlength", () => {
    expect(ROUTE_PATH_MAX_LENGTH).toBe(64);
  });
});
