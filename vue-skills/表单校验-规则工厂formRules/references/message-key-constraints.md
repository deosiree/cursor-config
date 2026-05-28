# 校验 messageKey 约束

在 `formRules.ts` 内新增或修改 `fail("…")` / `requiredRule(t("…"))` 前必读。本 skill **默认不改** `zh_CN.json` / `en_US.json`；key 须与项目 `messageStrategy` 一致（见 [`project-discovery.md`](project-discovery.md)）。

## 三条约束

| # | 约束 | 实施要点 |
|---|------|----------|
| 1 | **尽量 ≤12 个汉字**（表单项旁展示上限） | 新建 key 先数**展示**字数（插值后的中文，非 key 字符串长度）；pathLike 单测用 `expectMessageWithinDisplayLimit` |
| 2 | **字数够用则写完整、可读** | 优先「不要…」「不能…」「须…」；**避免**为压字数用「勿…」「禁…」等生硬缩写（与现网 `不要使用协议头`、`不要连续斜杠` 一致） |
| 3 | **语义相近则复用同一 key** | 用 `createRuleFail(bind?)` 传插值；禁止为同一语义再写一条等价裸 key |

## 复用（优先模板 key）

| 场景 | 应使用 | 不要新建 |
|------|--------|----------|
| 任意字段超长 | `fail("{label}超过{maxLength}字")` + `createRuleFail({ label, maxLength })` | `路径超过64个字符`、`路径超过512字`、`{label}不能超过 {maxLength} 个字符` |
| 带 label 的必填 | `fail("{label}不能为空")` + bind `{ label }` | 各写一条「路径不能为空」若已有 bind |
| 路径/段内非法字符 | `fail("包含非法字符")` | 按字段再拆同义 key |
| 名称白名单失败 | `fail("仅允许中文、西文、数字、下划线")` | 无 label 的通用句，全仓共用 |

展示示例（bind 后）：

- 路径超长 64 → `路径超过64字`（7 字）
- 字段超长 64 → `字段超过64字`

## createRuleFail 与插值

```ts
// 名称、路径聚合内
const fail = createRuleFail({ label: "路径", maxLength: PATH_MAX_LENGTH.routePath });
fail("{label}超过{maxLength}字");

// 无占位符的 key：可不传 bind，或 bind 存在但 key 无 `{…}`（t 忽略多余插值）
fail("不要连续斜杠");
```

- **不要**在每次 `fail` 里写死 `{ label, maxLength, ...extra }`；由 `createRuleFail` 合并 `bind` 与可选 `extra`。
- 仅当 key 含 `{label}`、`{maxLength}`、`{detail}` 等时才需要对应插值。

## 审查清单（交付前）

- [ ] 新 key 展示字数 ≤12（pathLike 矩阵已断言）
- [ ] 无「勿…」类生硬压缩（除非用户明确要求极简文案）
- [ ] 超长未另起「…超过…个字符」类 key
- [ ] 未把 locale 文件列入默认 diff

## 相关文档

- 模块结构与原子表：[`formRules-module-map.md`](formRules-module-map.md)
- pathLike 分段 message 全集：[`route-path-segment-model.md`](route-path-segment-model.md)（下表为场景索引）
