---
name: 分析-模式判定
description: 当用户请求批量翻译但未明确 zh2en/en2ru/pipeline，或需解析单模型/多模型并发策略，或要路由到模型探测时使用。
---

# 核心任务

判定：

1. `mode = zh2en | en2ru | pipeline`（翻译方向）
2. `modelPolicy = single | all | list` + `models[]`（模型策略）
3. 或任务类 `probe_models`（只探测、不翻译）

## 何时触发

- 主 skill 收到翻译 / 测模型请求后的第一步
- 用户只说「翻译这个 xlsx」而未标明方向或模型策略

## 输入 / 前置条件

- 用户自然语言请求
- 可选：文件表头抽样（是否含「英文翻译」「俄文翻译」）
- 模型短名目录：`[[../../references/providers-siliconflow.md]]`、`[[../../lib/modelCatalog.js]]`

## 翻译方向判定

| 信号 | 判定 |
|------|------|
| 明确「英译俄 / en2ru / 俄文翻译列」且不要求中译英 | `en2ru`（高） |
| 明确「中译英 / 英文翻译列 / 术语库」且不要俄文 | `zh2en`（高） |
| 「中英俄都要 / 全链路 / pipeline / 中→英→俄」 | `pipeline`（高） |
| 俄文列全空 + 英文列已填 + 词条为英文 | `en2ru`（中） |
| 词条为中文 + 英文空 + 俄文也要填 | `pipeline`（中） |
| 词条为中文 + 只要英文 | `zh2en`（中） |
| 同时提及中译英与英译俄但未说全链路 | `pipeline`（中）或问确认 |

## 模型策略判定（modelPolicy）

| 用户话术信号 | modelPolicy | models |
|--------------|-------------|--------|
| 未提模型 / 「默认」「省额度」「单模型」「只用最高优先」 | `single` | `[]` |
| 「全部模型并发」「所有免费模型一起跑」「满速」「all models」 | `all` | `[]` |
| 「用 Hunyuan-MT 和 Qwen3-8B」「指定 A、B 并发」 | `list` | 解析出的 modelId 列表 |
| 「测一下模型」「哪些模型可用」「probe models」「API 探测」 | **不翻译** → `task=probe_models` | — |

短名匹配示例：`Hunyuan-MT` → `tencent/Hunyuan-MT-7B`；模糊名单 🔴 问确认。

## 输出

翻译任务：

- `mode`
- `modelPolicy`：`single` | `all` | `list`
- `models`：`string[]`
- `confidence`：high / medium / low
- `needConfirm`：boolean
- `reason`

探测任务：

- `task`：`probe_models`
- `reason`

示例见 `[[template/after/模式判定输出示例.md]]`

## 下一步

- 翻译 → `[[../编排-翻译工作流/SKILL.md]]`
- 探测 → `[[../../feature-skills/探测-模型可用性/SKILL.md]]`

## 边界

- 只判定模式与模型策略，不执行翻译、不写文件。
- 并发/分摊细节由编排层与 `translateCsv.js` 负责。
