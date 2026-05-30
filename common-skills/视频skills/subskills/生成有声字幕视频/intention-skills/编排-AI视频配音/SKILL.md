---
name: 编排-AI视频配音
description: AI 生成视频素材 + 写旁白 + edge-tts 生成 MP3+SRT + moviepy 合成。被 生成有声字幕视频 调用。
---

# 编排：AI 视频 + 配音

## 输入

| 参数 | 来源 |
|------|------|
| `AI 视频 prompt` | 用户入参 |
| `旁白稿` | 用户入参或根据 prompt 自动生成 |
| `语音风格` | 默认 zh-CN-YunxiNeural |

## 执行流程

### 步骤 1：AI 生成无声视频

```
1. 检查 muapi 是否已配置：
   muapi account balance
   → 若提示 "not authenticated" → 进入降级模式

2. 降级模式：
   ⚠️ "AI 视频生成需要 muapi API key。当前已为你展示命令预览："
   展示会执行的命令（不实际运行）：
     muapi video generate "{prompt}" --model kling-master
   建议：
     - 配置 API key → [[common-skills/references/muapi-api-key配置指南.md]]
     - 或改用 Remotion 配音路径（免费，无需 API key）
   → 暂停，等待用户选择：配置 key / 切换 Remotion 路径 / 取消

3. 正常模式（key 已配置）：
   调 [[../../feature-skills/AI视频-生成无声画面/SKILL.md]]
   → 路由到 muapi / Kling / Seedance
   → 下载无声视频素材
```

### 步骤 2：生成旁白 + 音频

```
1. 根据 AI prompt 和视频内容写旁白稿
2. edge-tts 生成 narration.mp3 + narration.srt
```

### 步骤 3：合成

```
python merge_audio_video.py ai-video.mp4 narration.mp3 --srt narration.srt -o final.mp4
```

## 异常处理

| 异常 | 处理 |
|------|------|
| muapi 未安装或未配置 API key | `npm install -g muapi-cli && muapi auth configure`；若用户无 key → 提示 https://muapi.ai/dashboard |
| AI 视频生成超时 | `muapi predict wait {request_id} --timeout 300`；超时 → 用已生成的帧做短视频 |
| AI 视频无音频（预期行为） | 正常——这正是本 skill 要解决的问题 |
| edge-tts / moviepy 不可用 | 同 Remotion 配音的异常处理 |

## 检查点

- **步骤 1 后**：确认 AI 视频已生成，展示视频时长 → 反推旁白稿字数（视频秒数 × 4 字/秒）
- **步骤 3 前**：展示旁白稿预览，确认与 AI 视频内容匹配

## 约束

- AI 视频可能无声 → 本 skill 专门解决配音问题
- AI 视频时长不可控 → **先拿视频时长，再写对应长度的旁白**（而非先写旁白再定视频时长）
