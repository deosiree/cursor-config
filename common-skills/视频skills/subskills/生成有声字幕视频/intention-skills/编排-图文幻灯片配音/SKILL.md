---
name: 编排-图文幻灯片配音
description: 图片+文字 → Remotion 幻灯片视频 + edge-tts 配音旁白 + moviepy 合成。被 生成有声字幕视频 调用。
---

# 编排：图文幻灯片 + 配音

## 输入

| 参数 | 来源 |
|------|------|
| `图片列表` | 用户入参（路径数组或目录） |
| `每页文字` | 用户入参或自动提取 |
| `旁白稿` | 用户入参或根据文字自动生成 |
| `语音风格` | 默认 zh-CN-YunxiNeural |

## 执行流程

### 步骤 1：生成 Remotion 幻灯片项目

```
1. 若用户没有 Remotion 项目 → 自动创建：
   npx create-video@latest slide-video
   cd slide-video && npm install

2. 生成 SlideShow 组件（src/SlideShow.jsx）：
   - import { AbsoluteFill, Sequence, Img, useCurrentFrame, interpolate }
   - 每张图片一个 Sequence，duration = 总帧数 / 图片数
   - 默认每张 5 秒（150 帧 at 30fps），可在步骤 4 调整
   - 图片路径用 staticFile() 或 import
   - 文字叠加：底部 15% 高度半透明黑条（rgba(0,0,0,0.6)）
   - 白色文字（fontSize: 32, fontFamily: "sans-serif"）
   - 转场：opacity 从 0 → 1 → 1 → 0（每段最后 0.5s 淡出）

3. 注册 Composition：
   - id="SlideShow"
   - fps={30}, width={1920}, height={1080}
   - durationInFrames = 图片数 × 150（初始值，步骤 4 调整）
```

### 步骤 2：写旁白稿

```
1. 根据每页文字内容写旁白
2. 每页图片对应一段旁白
3. 估算总时长 = 页数 × 平均每页秒数
```

### 步骤 3：生成音频

```
edge-tts --file narration.txt --write-media narration.mp3 --write-subtitles narration.srt
```

### 步骤 4：调整 Remotion durationInFrames

```
用音频时长反推：durationInFrames = 音频秒数 × fps
重新分配每页图片的 duration
```

### 步骤 5：Remotion 无声渲染 + moviepy 合成

```
npx remotion render src/index.js SlideShow out/silent.mp4
python merge_audio_video.py silent.mp4 narration.mp3 --srt narration.srt -o final.mp4
```

## 异常处理

| 异常 | 处理 |
|------|------|
| 图片文件不存在 | 跳过该图片，在日志中标注；若全部不存在 → 暂停 |
| 图片格式不支持（非 jpg/png/webp） | 用 Pillow 转码：`python -c "from PIL import Image; Image.open('x.webp').convert('RGB').save('x.jpg')"` |
| 图片比例不一致 | 用 Pillow 居中裁剪为 16:9 |
| Remotion 渲染时图片路径 404 | 检查 `staticFile()` 路径 → 改用绝对路径 import |

## 检查点

- **步骤 1 后**：确认 SlideShow 组件能正常 `npx remotion studio` 预览
- **步骤 2 后**：展示旁白稿 + 估算总时长，请用户确认

## 约束

- 图片建议 16:9 比例（1920×1080），否则会有黑边（或自动裁剪）
- 文字叠加走 Remotion 组件渲染（非 moviepy 字幕），确保中文兼容
