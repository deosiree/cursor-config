# Few-shot: 从文字稿到有声字幕视频（完整链路）

**触发：** "把这个演讲稿做成带字幕的解说的视频"
**路由：** 判断优先级第 1 条 → [[../subskills/生成有声字幕视频/SKILL.md]] → 编排-为Remotion视频配音
**耗时：** ~10 分钟（旁稿 2 分 + TTS 1 分 + 渲染 5 分 + 合成 1 分 + 验证 1 分）

---

## 执行流程

### 步骤 1：写旁白稿

根据文字稿内容，分段编写 narration.txt：

```text
# 每段对应一个 Remotion 场景
[场景 1：开场] 大家好，今天我们来讲解 Agent Loop 的核心概念...
[场景 2：流程] 首先，Agent 接收用户输入...
[场景 3：循环] 然后，Agent 调用工具并观察结果...
```

**原则：** 每段 3-5 句话，对应 Remotion 的一个场景（约 10-30 秒）。

### 步骤 2：生成音频 + 字幕

```bash
edge-tts --voice zh-CN-YunxiNeural \
  --file narration.txt \
  --write-media public/narration.mp3 \
  --write-subtitles public/narration.srt

# 确认产出
ls -la public/narration.*
# → public/narration.mp3 (音频)
# → public/narration.srt (SRT 字幕，含时间戳)
```

### 步骤 3：用音频时长反推 Remotion 参数

```python
# 获取音频时长（秒）
python -c "from moviepy import AudioFileClip; a=AudioFileClip('public/narration.mp3'); print(a.duration)"
# → 输出：180.5（秒）

# 计算 durationInFrames
# durationInFrames = 音频时长 × fps
# 180.5 × 30 ≈ 5415
```

在 Remotion 组件中设置 `durationInFrames` 为音频时长对应的帧数。

### 步骤 4：Remotion 无声渲染

```bash
npx remotion render src/index.js MyVideo \
  out/silent.mp4 --codec=h264

# 产出：out/silent.mp4（无声视频）
```

### 步骤 5：moviepy 合成（音视频 + 字幕烧录）

```bash
python scripts/merge_audio_video.py \
  out/silent.mp4 public/narration.mp3 \
  --srt public/narration.srt \
  -o out/final-with-subtitles.mp4
```

### 步骤 6：验证

```bash
python -c "
from moviepy import VideoFileClip
v = VideoFileClip('out/final-with-subtitles.mp4')
print(f'时长: {v.duration:.1f}s')
print(f'有音频: {v.audio is not None}')
print(f'分辨率: {v.size}')
# 额外验证字幕是否嵌入（用 ffprobe）
"
ffprobe out/final-with-subtitles.mp4 2>&1 | findstr subtitle
```

---

## 完整路径图

```
文字稿/演讲稿
    │
    ▼
写旁白稿 (narration.txt)           ← Agent 撰写，适配视频节奏
    │
    ├──▶ edge-tts ──→ narration.mp3 + narration.srt
    │
    ▼
计算 durationInFrames = 音频时长 × fps
    │
    ▼
Remotion 无声渲染 ──→ silent.mp4
    │
    ▼
moviepy 合成 ──→ final.mp4（带音频 + 烧录字幕）
```

## 关键约束

| 规则 | 原因 |
|------|------|
| 旁白稿先写再生成音频 | 音频时长决定视频 durationInFrames |
| Remotion 不用 `<Audio>` 组件 | webpack 兼容性差，走 moviepy 后合成 |
| SRT 由 edge-tts `--write-subtitles` 生成 | 不依赖 Remotion 字幕渲染 |
| 音频截断：`a.subclipped(0, v.duration)` | 防止音频比视频长导致不同步 |

## 踩坑预防

| 坑 | 解决 |
|----|------|
| edge-tts 未安装 | `pip install edge-tts` |
| moviepy 中文路径问题 | 用 `str(Path)` 或原始字符串 |
| 音频比视频长 ~0.04s | `a.subclipped(0, v.duration)` 截断对齐 |
| 字幕时间戳偏移 | SRT 基于音频生成，确保与无声视频对齐 |
