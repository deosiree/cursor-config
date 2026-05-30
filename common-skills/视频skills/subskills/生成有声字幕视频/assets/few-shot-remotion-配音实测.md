# Few-shot: Remotion 配音完整流程

**触发：** "给 DetailedIntro 加男声配音和字幕"
**路由：** 编排-为Remotion视频配音
**耗时：** ~8 分钟（旁白 1 分 + TTS 30 秒 + 渲染 5 分 + 合成 1 分）
**产出：** `few-shot-detailed-intro.mp4`（5.7 MB，6 分钟）+ `few-shot-detailed-intro.srt`（168 条字幕）

---

## 实际执行记录

### 步骤 1：写旁白稿
```bash
# 根据 DetailedIntro.jsx 的 6 个技能 + 安装指南 + 结尾，写 narration.txt
# 预估：~1100 字 → ~275 秒 ≈ 5 分钟
```

### 步骤 2：生成音频 + 字幕
```bash
edge-tts --voice zh-CN-YunxiNeural \
  --file narration.txt \
  --write-media public/narration.mp3 \
  --write-subtitles public/narration.srt

# 产出：narration.mp3 (1.4 MB) + narration.srt (4.7 KB)
```

### 步骤 3：Remotion 无声渲染
```bash
# durationInFrames 设为 10800（6 分钟 × 30fps）
C:\...\node_modules\.bin\remotion.cmd render \
  src/index.js DetailedIntro out/detailed-silent.mp4 --codec=h264

# 产出：detailed-silent.mp4（无声）
```

### 步骤 4：moviepy 合成
```bash
python scripts/merge_audio_video.py \
  out/detailed-silent.mp4 public/narration.mp3 \
  --srt public/narration.srt -o out/detailed-intro.mp4

# 产出：detailed-intro.mp4（5.7 MB，带音频）
```

### 步骤 5：验证
```bash
python -c "from moviepy import VideoFileClip; v=VideoFileClip('out/detailed-intro.mp4'); print(f'{v.duration:.1f}s audio={v.audio is not None}')"
# 输出：360.0s audio=True
```

---

## 踩过的坑

| 坑 | 解决 |
|----|------|
| Remotion `<Audio>` 组件 webpack 404 | 不走 Audio 组件，用 moviepy 后合成 |
| edge-tts `--file` 模式不生成 SRT | 加 `--write-subtitles` 参数 |
| moviepy 中文 Path 问题 | 用 `str(Path)` 或 raw string |
| 音频比视频长 0.04s | `a.subclipped(0, v.duration)` 截断 |
