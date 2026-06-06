---
name: 生图路由
description: 图像生成路由。muapi（Midjourney/Flux/Kling 100+模型）、image-gen、Mermaid→PNG、GPT Image 2（80+结构化模板）。触发词：生图、生成图片、画图、示意图、概念图、产品图、海报、GPT Image 2。
---

# 生图路由中心

## 🚫 反例黑名单（不要这样做）

| 反模式 | 为什么不行 | 应该怎么做 |
|--------|-----------|-----------|
| 精确拓扑图用 AI 生图（如 flux-dev 画架构图） | AI 生图无法精确控制节点位置/连线；输出不可复用 | 走 Mermaid → PNG 路线（由 渲染图skills 处理） |
| muapi API key 不可用时静默失败 | 用户不知道生图未执行，以为成功了 | 展示降级提示+免费替代方案，说明为什么没出图 |
| 用户说"画个图"直接选后端 | 歧义导致输出不符合真实需求 | 暂停追问"精确架构图(Mermaid)还是创意概念图(AI生图)？" |
| 一次生成多张图不展示 prompt | 生成后用户想改 prompt 只能重来，浪费额度 | 每张图生成前展示 prompt + 用户确认 |
| 用 AI 生图替代 HTML 截图/卡片布局 | AI 生图无法精确控制文字位置和排版对齐 | 复杂布局走 HTML 截图，需要文字精确对齐不用 AI 生图 |
| 忽略 Obsidian 渲染直接 Mermaid→PNG | Mermaid 渲染可能有错，导出的 PNG 也是错的 | 先请用户确认 Obsidian 渲染正常，再截图 |
| 自动用 midjourney-v7 生成所有图 | MJ 成本高、出图慢，适合高端产品图但不适合日常概念图 | 概念图用 flux-dev 快速迭代，定稿后再用 MJ 精出 |

## 降级策略（无 API key 时）

| 路由 | 降级行为 |
|------|---------|
| muapi image generate | 展示命令预览，提示配置 key → [[../references/muapi-api-key配置指南.md]] |
| Midjourney/Flux/Kling | 同上 |
| Mermaid → PNG | ✅ 正常（不依赖 muapi） |
| image-gen 子技能 | ✅ 正常（不依赖 muapi） |

**降级提示模板：**
```
⚠️ AI 生图需要 muapi API key。免费替代方案：
  - Replicate 试用额度：https://replicate.com
  - Hugging Face Inference：https://huggingface.co/inference-api
  - Mermaid → PNG（已有，适合精确拓扑图）
配置 muapi → [[../references/muapi-api-key配置指南.md]]
```

## GREEN（执行主线）

| 需求 | 路由目标 | 命令/工具 |
|------|---------|----------|
| **AI 生图（推荐）** | muapi CLI | `muapi image generate "..." --model flux-dev --download ./outputs` |
| **高端产品图/海报** | muapi + Midjourney v7 | `muapi image generate "..." --model midjourney-v7` |
| **推理生图** | Nano-Banana | `bash library/visual/nano-banana/scripts/generate-nano-art.sh` |
| **品牌/Logo** | Logo Creator / Brand Kit | 见 Generative-Media-Skills library |
| **AI 概念图** | image-gen 子技能 | [[../../html-skills/output-html/subskills/image-gen/SKILL.md]] → 完整链路见 [[template/few-shot-ai-concept-gen.md]] |
| Mermaid 转 PNG | output-html → Playwright | `npx playwright screenshot mermaid.html` → 完整链路见 [[template/few-shot-mermaid-to-png.md]] |

## 安装

```bash
# 安装 muapi CLI（100+ AI 模型）
npm install -g muapi-cli
# 配置 API key（https://muapi.ai/dashboard）
muapi auth configure
# 安装生图 skills（41 个工作流）
npx skills add SamurAIGPT/Generative-Media-Skills --all
```

## 检查点

🔴 **CHECKPOINT · AI 生图前**
展示 prompt 预览 + 模型选择 → **🛑 停，请用户确认**：`是否按此 prompt 生成？[继续/修改prompt/切换模型]`
用户说"继续"才执行；否则回到 prompt 编辑。

🔴 **CHECKPOINT · muapi 不可用时**
展示降级提示（免费替代方案）→ **🛑 停，请用户确认**是否接受免费方案或配置 key。
不静默失败，不自主降级。

🔴 **CHECKPOINT · Mermaid→PNG 前**
确认 Mermaid 代码在 Obsidian 中渲染正常 → **🛑 停，请用户确认**渲染通过 → 再截图导出。

## 边界条件

| 异常 | 处理 |
|------|------|
| 用户说"画个图"但未说明是拓扑图还是概念图 | 暂停追问："你需要精确的架构图（用 Mermaid）还是创意概念图（用 AI 生图）？" → 追问示范见 [[template/few-shot-ambiguous-ask.md]]，用户选择后走对应路由 |
| muapi API key 不可用 | 降级为命令预览 + 引导免费替代（Replicate/HuggingFace/Mermaid→PNG） |
| image-gen 子技能不可达 | 回退：提示"image-gen 不可用，请改用 muapi 或 Mermaid→PNG" |

## 生成前必读（Few-shot）

| 图类型 | 必读示例 | 说明 |
|--------|---------|------|
| AI 生图（通用） | `[[template/few-shot-image-gen-命令.md]]` | 快速命令参考，适合已熟悉流程时查阅 |
| AI 概念图（完整链路） | `[[template/few-shot-ai-concept-gen.md]]` | 从 prompt 构思→用户确认→命令→检查点的完整输出示例 |
| Mermaid→PNG（完整链路） | `[[template/few-shot-mermaid-to-png.md]]` | Obsidian 确认 → HTML 嵌入 → Playwright 截图的完整流程 |
| 歧义追问 | `[[template/few-shot-ambiguous-ask.md]]` | 用户需求模糊时的追问-确认-路由示范 |
| Mermaid→PNG（快速参考） | `[[../渲染图skills/template/few-shot-mermaid-flowchart.md]]` | 外部技能参考 |

## REFACTOR
- 新增生图后端 → 更新路由表 + 检查点
- 生图 prompt 工程规范 → 独立为 `references/image-prompt-rules.md`

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "生成一张赛博朋克城市图" | muapi image generate --model flux-dev |
| "做一张高端产品海报" | muapi --model midjourney-v7 |
| "设计一个 Logo" | Logo Creator skill（Generative-Media-Skills） |

## 外部参考

| 来源 | 说明 | Stars |
|------|------|:---:|
| [SamurAIGPT/Generative-Media-Skills](https://github.com/SamurAIGPT/Generative-Media-Skills) | 41 个生图/视频工作流 + 100+ 模型 | 3.4k |
| [muapi-cli](https://www.npmjs.com/package/muapi-cli) | midjourney/flux/kling/veo3 统一 CLI | — |
| Output-html image-gen | `html-skills/output-html/subskills/image-gen/SKILL.md` | — |
| GPT Image 2 | `common-skills/生图skills/gpt-image-2/` — GPT Image 2 结构化模板（80+模板，18大类，3种运行模式） | — |
