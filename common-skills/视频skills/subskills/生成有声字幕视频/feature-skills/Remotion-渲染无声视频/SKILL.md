---
name: Remotion-渲染无声视频
description: 渲染 Remotion 视频（不使用 Audio 组件）。被 编排-为Remotion视频配音 和 编排-图文幻灯片配音 调用。
---

# Remotion-渲染无声视频

## RED（失败基线）
- 代码中引入了 `<Audio>` 或 `staticFile()` → webpack 404
- durationInFrames 硬编码 → 与音频时长不匹配

## GREEN

```
1. 移除所有 Audio/staticFile 引用
2. 根据音频时长设置 durationInFrames = 音频秒数 × fps
3. 渲染：
   npx remotion render src/index.js {composition名} out/silent.mp4 --codec=h264
4. 验证文件存在且 > 0
```

## 入参

| 参数 | 说明 |
|------|------|
| `项目路径` | Remotion 项目根目录 |
| `Composition 名` | 要渲染的 Composition ID |
| `音频时长(秒)` | 用于计算 durationInFrames |
| `fps` | 默认 30 |

## 输出

- `out/silent.mp4` — 无声视频文件
