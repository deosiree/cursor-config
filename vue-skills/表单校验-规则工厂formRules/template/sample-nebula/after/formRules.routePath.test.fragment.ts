/**
 * sample-nebula — pathLike 单测矩阵参考（放到 rulesModule 同级 __tests__/）
 * 断言 message 为稳定 key 或项目翻译后文案，与 messageStrategy 一致
 */
import { describe, expect, it } from "vitest";
import { ROUTE_PATH_MAX_LENGTH, validateRoutePathSyntax } from "@/utils/formRules";

function expectRoutePathError(value: string): string | undefined {
  try {
    validateRoutePathSyntax(value);
    return undefined;
  } catch (error) {
    return (error as Error).message;
  }
}

describe("validateRoutePathSyntax", () => {
  it("accepts common paths", () => {
    expect(() => validateRoutePathSyntax("/system/menu")).not.toThrow();
    expect(() => validateRoutePathSyntax("/user?")).not.toThrow();
    expect(() => validateRoutePathSyntax("/list?from=menu")).not.toThrow();
    expect(() => validateRoutePathSyntax("/user/:id")).not.toThrow();
  });

  it("rejects invalid paths with short messages", () => {
    const cases: Array<[string, string]> = [
      ["/user:id#", "段中不要用冒号"],
      ["/?xxx", "段首不要片段符"],
      ["/:id#", "动态段不要接#?"],
      ["/user?@", "拼参格式不对"],
    ];
    for (const [input, expected] of cases) {
      expect(expectRoutePathError(input)).toBe(expected);
      expect(expected.length).toBeLessThanOrEqual(12);
    }
  });

  it("aligns max length with form maxlength", () => {
    expect(ROUTE_PATH_MAX_LENGTH).toBe(64);
  });
});
