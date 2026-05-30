# AI 概念图 — 完整链路示例

> 本示例展示用户要求"概念图"时 Agent 的完整输出链路，包括 prompt 构建、命令执行、检查点确认。

---

## 触发

**用户：** "生成一张 Agent Loop 的运作概念图，用来放进我的博客文章"

---

## Agent 完整输出

我帮你生成一张 Agent Loop 概念图。先看一下 prompt 方向：

**Prompt 构思：**
> A conceptual diagram of an AI Agent Loop, showing a circular flow: User Input → Perception → Reasoning → Tool Execution → Memory Update → Output. Central node is a glowing brain icon with 'Agent Core'. Connected nodes in cyberpunk gradient (cyan to purple), with dashed feedback arrows. Dark background, blueprint grid style, clean labels. Wide format 16:9, suitable for blog header.

需要调整细节吗？比如色调、是否加中文字幕、风格偏科技感还是手绘风？

<details>
<summary>✅ 用户确认 prompt</summary>

> 用户：色调不用改，风格科技感就行，加中文标注
</details>

好，确认后执行生成：

```bash
muapi image generate \
  "A conceptual diagram of an AI Agent Loop, circular flow: User Input → Perception → Reasoning → Tool Execution → Memory Update → Output. Central glowing brain icon labeled 'Agent Core'. Connected nodes in cyan-to-purple gradient, dashed feedback arrows, dark background blueprint grid. Chinese annotations: 用户输入, 感知, 推理, 工具执行, 记忆更新, 输出. Wide 16:9, blog header style." \
  --model flux-dev \
  --download ./outputs/agent-loop-concept.png
```

**输出：** `./outputs/agent-loop-concept.png`

---

## 检查点确认

| 检查项 | 结果 |
|--------|------|
| prompt 展示 + 用户确认 | ✅ 用户确认了 prompt 和中文标注 |
| muapi 可用性 | ✅ 有 key，直接执行 |
| 输出文件生成 | ✅ `agent-loop-concept.png` 已下载 |
| 最终效果确认 | 询问用户：图符合预期吗？需要调整 prompt 重新生成吗？ |

---

## 其他路线（备选）

如果当时 muapi key 不可用：

```bash
# 降级为命令预览模式
⚠️ AI 生图需要 muapi API key。
免费替代方案：
  - Replicate 试用额度：https://replicate.com
  - Hugging Face Inference：https://huggingface.co/inference-api
  - Mermaid → PNG（适合精确流程图）

命令预览（配置 key 后可执行）：
muapi image generate "Agent Loop 概念图 prompt..." --model flux-dev --download ./outputs/
配置指南 → [[../references/muapi-api-key配置指南.md]]
```

如果用户要求精确架构图而非概念图：

```bash
# 走 Mermaid → PNG 路线（由 渲染图skills 处理）
# 不在这里执行
```
