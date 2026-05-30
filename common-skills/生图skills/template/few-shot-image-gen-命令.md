# image-gen 生图 — 可执行命令

> ⚠️ 本模板为**可执行命令示例**（非描述性说明）。生图依赖 LLM 原生图像生成能力或外部 API。

**触发：** "生成一张 Agent Loop 的概念插图"

**方式 1：LLM 原生生图（推荐）**

如果 Agent 运行在支持图像生成的模型上（如 GPT-4o），直接调用图像生成 API。

**方式 2：Mermaid → PNG（精确拓扑图）**

```bash
# 1. 将 Mermaid 代码嵌入 HTML
# 2. 用 Playwright 截图导出 PNG
npx playwright screenshot mermaid.html --output agent-loop.png
```

**方式 3：外部生图 API**

- DALL-E API：`openai.images.generate({ prompt: "...", n: 1, size: "1024x1024" })`
- 参考：[SamurAIGPT/Generative-Media-Skills](https://github.com/SamurAIGPT/Generative-Media-Skills)（3.4k⭐）

**外部参考：**
- Output-html image-gen 子技能：`html-skills/output-html/subskills/image-gen/SKILL.md`
