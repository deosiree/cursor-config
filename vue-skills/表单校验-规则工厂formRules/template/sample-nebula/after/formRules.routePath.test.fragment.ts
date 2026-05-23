/**
 * sample-nebula — pathLike 单测矩阵（skill 内可对照 formRules.routePath.fragment.ts）
 *
 * 落地到目标仓库后：
 * - import 改为 project-discovery 得到的 rulesModule（如 `@/utils/formRules`）
 * - 仍经 createRoutePathRules()[0].validator，不直接 import validate*
 */
import { describe, expect, it } from "vitest";
import type { FormItemRule } from "element-plus";
import { createRoutePathRules, ROUTE_PATH_MAX_LENGTH } from "./formRules.routePath.fragment";

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
