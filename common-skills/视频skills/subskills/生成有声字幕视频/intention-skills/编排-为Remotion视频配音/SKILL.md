---
name: 编排-为Remotion视频配音
description: 已有 Remotion 项目 → 写旁白 → edge-tts 生成 MP3+SRT → Remotion 无声渲染 → moviepy 合成。被 生成有声字幕视频 调用。
---

# 编排：为 Remotion 视频配音

## 输入

| 参数 | 来源 |
|------|------|
| `Remotion 项目路径` | 用户入参 |
| `Composition 名称` | 用户入参 |
| `旁白稿` | 用户入参或自动生成 |
| `语音风格` | 默认 zh-CN-YunxiNeural |
| `烧录字幕` | 默认 false |

## 执行流程

### 步骤 1：确认旁白稿

```
1. 若用户提供了旁白稿 → 直接使用
2. 若未提供 → 读 Remotion 项目的 Composition 代码 → 根据组件内容生成旁白稿
3. 旁白稿保存为 {项目路径}/narration.txt
4. 预估时长：中文 ~4 字/秒 → 用字数反推 durationInFrames
```

### 步骤 2：生成音频 + 字幕

```
调 common-skills/语音tts-skills → edge-tts
  edge-tts --voice {语音风格} --file narration.txt \
    --write-media public/narration.mp3 \
    --write-subtitles public/narration.srt
```

### 步骤 3：Remotion 无声渲染

> ⚠️ 不使用 `<Audio>` 组件。纯视觉渲染。

```
调 [[../../feature-skills/Remotion-渲染无声视频/SKILL.md]]
→ 根据音频时长设置 durationInFrames
→ 渲染 silent.mp4
```

### 步骤 4：合成音视频

```
调 [[../../scripts/merge_audio_video.py]]
  python merge_audio_video.py silent.mp4 narration.mp3 \
    --srt narration.srt -o final.mp4 [--burn-subtitles]
```

### 步骤 5：验证

```
python -c "from moviepy import VideoFileClip; v=VideoFileClip('final.mp4'); print(f'{v.duration:.1f}s audio={v.audio is not None}')"
```

## 异常处理

| 异常 | 处理 |
|------|------|
| edge-tts 未安装 | `pip install edge-tts` 后重试；仍失败 → 提示用户手动安装 |
| moviepy 未安装 | `pip install moviepy` 后重试；仍失败 → 降级为仅输出无声视频 + SRT 字幕文件 |
| Remotion 项目路径不存在 | 暂停，请用户确认路径；若路径正确但缺少 `node_modules/` → `npm install` |
| 旁白稿生成失败（Composition 代码无意义） | 暂停，请用户提供旁白稿或描述视频内容 |
| 合成后音频不同步 | 检查 edge-tts 的 `--rate` 参数，默认不加速 |

## 检查点

- **步骤 1 后**：展示旁白稿预览（前 200 字），请用户确认"旁白内容是否准确？[继续/修改]"
- **步骤 3 后**：确认无声视频文件存在且大小 > 0，再进入合成

## 约束

- Remotion 组件中禁止引入 `Audio` / `staticFile` 相关代码
- durationInFrames = 音频秒数 × fps（精确匹配，避免黑屏或截断）
