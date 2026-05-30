# 生图路由中心 — 说明文档

## 我该什么时候用？

当你需要生成图片——概念插图、场景图、Mermaid 导出 PNG、HTML 页面截图。

## 快速使用

1. 告诉 Agent：`生成一张 XX 的概念插图`
2. Agent 读 `SKILL.md` → 判断需求 → 选生图后端
3. AI 概念图走 image-gen，精确图走 Mermaid+截图

## 可用后端

| 后端 | 模型/工具 | 适合 | 不适合 |
|------|-----------|------|--------|
| **AI 生图** | flux-dev（muapi） | 创意插画、概念场景、快速原型 | 精确拓扑图（走 Mermaid） |
| **高端产品图/海报** | midjourney-v7（muapi） | 产品渲染、营销海报、品牌视觉 | 需要精确标注的示意图 |
| **推理生图** | Nano-Banana | 抽象概念可视化、推理过程配图 | 写实照片级出图 |
| **品牌/Logo** | Logo Creator（Generative-Media） | Logo 设计、品牌物料、图标 | 复杂场景插画 |
| **AI 概念图** | image-gen 子技能 | 概念插图、场景图、技术博客配图 | 精确拓扑（用 Mermaid） |
| **Mermaid→PNG** | Playwright 截图 | 流程图/架构图导出 PNG | 照片级写实/无代码纯创意图 |

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "生成 Agent Loop 概念插图" | AI 生图 → image-gen |
| "这张 Mermaid 图导出 PNG" | Mermaid → HTML → Playwright 截图 |
