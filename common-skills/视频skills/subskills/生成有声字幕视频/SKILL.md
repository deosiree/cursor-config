---
name: 生成有声字幕视频
description: 为视频添加中文配音和字幕。支持 React 渲染视频、AI 生成视频、图文幻灯片视频。触发词：有声视频、带字幕视频、配音视频、视频旁白、解说视频、图文视频。
---

# 生成有声字幕视频

> **定位：** Agent 路由层——判断用户需求类型，分发到对应编排 skill。不执行具体步骤。

## RED（失败基线）

常漏：
- 没确认视频素材来源（React/AI/图文？）就进入渲染 → 走错路线
- 旁白稿未先写就生成音频 → 音频节奏与画面不匹配
- Remotion 里用了 `<Audio>` 组件 → webpack 404（应走无声渲染 + moviepy 后合成）

## GREEN（执行主线）

| 场景 | 路由 |
|------|------|
| 已有 Remotion 项目，要加配音字幕 | `[[intention-skills/编排-为Remotion视频配音/SKILL.md]]` |
| 用 AI 生成视频 + 配音 | `[[intention-skills/编排-AI视频配音/SKILL.md]]` |
| 图片+文字做成视频 + 配音 | `[[intention-skills/编排-图文幻灯片配音/SKILL.md]]` |

## 入参

| 参数 | 必填 | 说明 |
|------|:---:|------|
| `视频素材` | 是 | Remotion 项目路径 / AI 视频 prompt / 图片列表 + 文字 |
| `旁白稿` | 否 | 未提供则根据素材内容自动生成 |
| `语音风格` | 否 | 男声(云希)/女声(晓晓)，默认男声 |
| `输出路径` | 否 | 默认 `out/final.mp4` |
| `烧录字幕` | 否 | 是否将 SRT 字幕嵌入视频画面，默认 false |

## 关键约束

1. **视频素材先确定再配音**——先渲染无声视频，再用 moviepy 合成音频
2. **旁白稿决定时长**——先生成旁白 → edge-tts → 用音频时长反推 Remotion durationInFrames
3. **不走 Remotion Audio 组件**——webpack 兼容性差，统一用 moviepy 后合成
4. **SRT 字幕由 edge-tts 生成**——不依赖 Remotion 字幕渲染

## 何时不用

| 需求 | 用 |
|------|-----|
| 只要无声视频 | 直接用 Remotion / muapi |
| 只要音频不要视频 | [[../../语音tts-skills/SKILL.md\|语音tts-skills]] |
| 已有完整有声视频，只要字幕 | [[../../语音tts-skills/SKILL.md\|语音tts-skills]] 的 SRT 生成 |

## REFACTOR

- 新增配音后端（OpenAI TTS、ElevenLabs）→ 更新 feature-skills
- 新增字幕样式（双行、描边、位置）→ 更新 `scripts/merge_audio_video.py`

## 资源索引

| 路径 | 用途 |
|------|------|
| `[[scripts/merge_audio_video.py]]` | Python 音视频合并脚本（含字幕烧录） |
| `[[../../语音tts-skills/SKILL.md]]` | edge-tts 语音合成路由 |
| `[[../SKILL.md]]` | 视频skills 主路由（Remotion/muapi/OpenMontage） |
| `[[../template/few-shot-detailed-intro.mp4]]` | 真实输出示例 |
| `[[../template/few-shot-detailed-intro.srt]]` | 真实 SRT 字幕示例 |
| `[[evals/evals.json]]` | 4 条测试 prompt（含 1 条已实测） |
| `[[assets/few-shot-remotion-配音实测.md]]` | Remotion 路径完整实测记录（含踩坑） |

## 使用示例

```text
给 agent-loop-video 项目的 DetailedIntro 加配音 → 走 编排-为Remotion视频配音
用 AI 生成一个产品演示视频 + 配音 → 走 编排-AI视频配音
把这 10 张截图做成图文视频 + 解说 → 走 编排-图文幻灯片配音
```
