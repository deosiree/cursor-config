---
name: AI视频-生成无声画面
description: 调 视频skills 主路由，用 AI 生成无声视频素材。被 编排-AI视频配音 调用。
---

# AI视频-生成无声画面

## RED（失败基线）
- 未确认用户有 muapi API key → 静默失败
- 用 Remotion 而不用 AI（或反过来）→ 路由错误

## GREEN

```
1. 读 [[../../../SKILL.md|视频skills 主路由]]
2. 根据需求选路由：
   - AI 视频 → muapi video generate
   - 图转视频 → muapi video generate --image
   - 产品视频 → Product Video Ad Maker
3. 生成的视频通常无声 → 这正是本 skill 要解决的问题
4. 输出：ai-video.mp4
```

## 入参

| 参数 | 说明 |
|------|------|
| `prompt` | AI 视频描述 |
| `模型` | kling-master / seedance-2 / veo3（默认 kling-master） |
| `输出路径` | 默认 `out/ai-video.mp4` |
