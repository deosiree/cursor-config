# 视频路由中心 — 说明文档

## 我该什么时候用？

当你需要生成视频——架构讲解动画、产品演示、短视频、播客视频化。

## 快速使用

1. 告诉 Agent：`把这个架构讲解做成动画视频`
2. Agent 读 `SKILL.md` → 判断需求 → 选视频后端
3. 默认用 Remotion（React 渲染，灵活度高）

## 可用后端

| 后端 | 适合 | 门槛 |
|------|------|:---:|
| **Remotion** | React 组件渲染视频，灵活 | 中 |
| **OpenMontage** | 复杂视频项目，12 条 pipeline | 高 |
| **claude-code-video-toolkit** | Claude Code 驱动的视频制作 | 中 |
| **template-tiktok** | 竖屏短视频（TikTok/Reels） | 低 |
| **podcast-maker** | 自动播客视频化 | 低 |

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "把这个做成动画视频" | Remotion → React 组件渲染 |
| "生成 30 秒产品演示" | template-tiktok → 竖屏格式 |
| "用 Claude Code 做视频" | claude-code-video-toolkit |
