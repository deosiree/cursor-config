---
name: 语音TTS路由
description: 文字转语音路由。支持 edge-tts（免费）、文档转播客、OpenAI TTS。接收文字后自动选后端生成 MP3/SRT。
trigger: 文字转语音, TTS, 生成MP3, 朗读, 语音合成, 转成音频, 有声朗读, 播客
---

# 语音 TTS 路由中心

## RED（失败基线）
- 需要中文语音但用了仅英文的 TTS → 输出不可用
- 长文本（>5000 字）直接调 API → 超时或 token 爆炸
- edge-tts 未安装时静默失败 → 必须先检测，不可用则提示安装
  - 检测命令：`edge-tts --help`（返回非 0 则提示 `pip install edge-tts`）
- 用户给了文件路径但用了 `--text` 而非 `--file` → 命令无效
- 输出文件已存在未检查 → 静默覆盖丢失原文件
- moviepy 未安装时合并步骤失败 → 必须先检测 `pip list | findstr moviepy`
- edge-tts 需要联网，无网络时超时 → 需提示检查网络或配置 `--proxy`
- 文本为空的请求 → 无意义输出，需拦截

## 边界处理

| 边界场景 | 检测方式 | 处理动作 |
|---------|---------|---------|
| 用户给文件路径而非内联文本 | 输入含 `.txt/.md/.json` 或 `C:\` `/` 开头 | 切换为 `edge-tts --file input.txt` |
| 输出文件已存在 | `if exist output.mp3` | 提示"output.mp3 已存在，覆盖？[y/N]"，否则指定新路径 |
| moviepy 未安装 | `pip list 2>nul \| findstr moviepy` | 提示 `pip install moviepy`，暂停等待安装完成 |
| 网络不可用 | `edge-tts --help` 超时或连接错误 | 提示"edge-tts 需要联网，请检查网络或配置 --proxy" |
| 空文本或 <5 字 | `len(text) < 5` | 提示"文本过短（<5字），确认继续？[y/N]" |

## 执行流程（Agent 按此顺序执行）

```
1. 解析意图 → 匹配 trigger 词 → 判断模式（仅MP3/MP3+SRT/长文本/播客）
2. 环境检测 → edge-tts --help → 不可用则 pip install → 边界检查（文件/网络/空文本）
3. 文本获取 → 内联用 --text，文件路径用 --file input.txt
4. 语音选择 → 默认 zh-CN-XiaoxiaoNeural，用户可指定（参考 references/edge-tts-voices.md）
5. 生成 → ≤5000字单次 edge-tts，>5000字走长文本策略（分段预览→确认→逐段→moviepy合并）
6. 确认 → 播放时长检查 + 产物路径告知用户
```

## 生成前必读（Few-shot）

| 交付模式 | 必读示例 | 目录 |
|---------|---------|------|
| **仅 MP3** | 语速/音色效果 | `[[template/few-shot-edge-tts.md]]` |
| **MP3 + SRT** | 字幕时间戳效果 | `[[template/few-shot-agent-loop.mp3]]` + `[[template/few-shot-agent-loop.srt]]` |
| **长文本分片** | 8000字分段预览+合并效果 | `[[template/few-shot-long-text-split.md]]` |
| **完整播客** | 双人对话稿 + MP3 | [[../../../md-skills/文档转播客/template/snapshot/]] |

## 交付模式

| 模式 | 产物 | 命令 |
|------|------|------|
| **仅 MP3**（默认） | 单个音频文件 | `edge-tts --voice zh-CN-XiaoxiaoNeural --text "..." --write-media out.mp3` |
| **MP3 + SRT** | 音频 + 字幕 | 加 `--write-subtitles out.srt` |
| **长文本分片** | 多个 MP3 + 合并 | 走下方"长文本策略" |
| **完整播客** | 对话稿 + MP3 + SRT | 路由到 [[../../../md-skills/文档转播客/SKILL.md]] |

## GREEN（执行主线）

| 需求 | 路由目标 | 命令 |
|------|---------|------|
| **免费 TTS**（推荐） | edge-tts CLI | `edge-tts --voice zh-CN-XiaoxiaoNeural --text "..." --write-media output.mp3` |
| **Node.js 集成** | andresayac/edge-tts | `npm install edge-tts` |
| **播客级 TTS**（含 SRT 字幕） | 文档转播客 脚本 | `python scripts/md-podcast-to-mp3.py`（见 [[../../../md-skills/文档转播客/scripts/md-podcast-to-mp3.py]]） |
| **API 端点** | openai-edge-tts | 自部署 HTTP API，兼容 OpenAI TTS 格式 |
| **Obsidian 内 TTS** | obsidian-edge-tts | Obsidian 插件，边读笔记边听 |

## 中文语音推荐

```
zh-CN-XiaoxiaoNeural    ← 女声，温柔（默认推荐）
zh-CN-YunxiNeural       ← 男声，新闻播报
zh-CN-XiaoyiNeural      ← 女声，活泼
zh-CN-YunjianNeural     ← 男声，沉稳
```

列出所有可用中文语音：`edge-tts --list-voices | grep zh-CN`

常用微调参数：
```bash
# 语速放缓（适合长文本）
edge-tts --voice zh-CN-XiaoxiaoNeural --rate=-10% --text "..." --write-media out.mp3
# 音调调高（适合儿童内容）
edge-tts --voice zh-CN-XiaoyiNeural --pitch=+20Hz --text "..." --write-media out.mp3
# 从文件读取
edge-tts --file input.txt --voice zh-CN-XiaoxiaoNeural --write-media out.mp3
```
完整语音风格参考：`[[references/edge-tts-voices.md]]`

## 长文本策略（>5000 字）

```
1. 按段落分割，每段 ≤ 500 字，用换行符分隔
2. 逐段生成 MP3：edge-tts --text "{段落}" --write-media "part_{i}.mp3"
3. 用 Python 合并：
   from moviepy import AudioFileClip, concatenate_audioclips
   clips = [AudioFileClip(f"part_{i}.mp3") for i in range(n)]
   final = concatenate_audioclips(clips)
   final.write_audiofile("output.mp3")
4. 字幕同理：逐段生成 SRT → 调整时间戳偏移 → 合并
```

## 检查点

- **生成前**：`edge-tts --list-voices | grep zh-CN` 确认中文语音可用
- **长文本时**：展示分段预览（前 3 段内容 + 预估总时长），请用户确认"是否按此分段生成？[继续/调整分段/取消]"
- **生成后**：`python -c "from moviepy import AudioFileClip; a=AudioFileClip('output.mp3'); print(f'{a.duration:.1f}s')"` 确认时长

## REFACTOR
- 新增 TTS 后端 → 更新路由表 + 交付模式表
- 长文本分片策略 → 已独立为本节

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "把这段文字转成 MP3" | TTS → edge-tts → `--voice zh-CN-XiaoxiaoNeural` |
| "生成这段文章的朗读音频，要字幕" | TTS + SRT → edge-tts `--write-subtitles` |
| "把这个技术文档转成播客" | 播客 → 调 [[../../../md-skills/文档转播客/SKILL.md]] |

## 外部参考

| 来源 | 说明 |
|------|------|
| [rany2/edge-tts](https://github.com/rany2/edge-tts) | Python CLI，11k stars，免费微软 TTS |
| [andresayac/edge-tts](https://github.com/andresayac/edge-tts) | Node.js 版 edge-tts |
| [travisvn/openai-edge-tts](https://github.com/travisvn/openai-edge-tts) | 兼容 OpenAI TTS API 格式的 HTTP 端点 |
| [travisvn/obsidian-edge-tts](https://github.com/travisvn/obsidian-edge-tts) | Obsidian 插件 |
| 文档转播客 | `md-skills/文档转播客/scripts/md-podcast-to-mp3.py` |
| 中文语音风格库 | 全部8个zh-CN语音+场景推荐 | `[[references/edge-tts-voices.md]]` |
