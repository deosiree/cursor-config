# Tool 节点说明（脚本 · 非子 agent）

主 agent 在步骤 7、9 通过 **Shell 调用本地 Python 脚本**，不要用 Task 子 agent，也不要在对话里「假装已合成音频」。

## 依赖安装

```powershell
pip install edge-tts pydub imageio-ffmpeg
```

| 组件 | 用途 |
| --- | --- |
| `edge-tts` CLI | 微软神经语音（免费），脚本内 `subprocess` 调用 |
| `pydub` | 拼接分段 MP3 |
| `imageio-ffmpeg` / ffmpeg | 音频导出 |

验证：

```powershell
edge-tts --version
python -c "from pydub import AudioSegment; print('pydub ok')"
```

## Tool: `validate_podcast_md`

| 项 | 说明 |
| --- | --- |
| 脚本 | [`../scripts/validate-podcast-md.py`](../scripts/validate-podcast-md.py) |
| 输入 | `播客朗读稿-[主题].md` 绝对或相对路径 |
| 前置 | 步骤 6 写稿完成 |
| 成功 | exit code `0` |
| 失败 | 打印缺项（frontmatter、卷首、快问、双人、禁四段标签等）→ 修稿后重跑 |

```powershell
python ".cursor/md-skills/文档转博客/scripts/validate-podcast-md.py" `
  "path\to\播客朗读稿-主题.md"
```

**门禁**：未通过 validate **不得** 调用 TTS。

## Tool: `podcast_md_to_mp3_srt`

| 项 | 说明 |
| --- | --- |
| 脚本 | [`../scripts/md-podcast-to-mp3.py`](../scripts/md-podcast-to-mp3.py) |
| 输入 | 同上朗读稿 `.md` |
| 前置 | validate 已通过；`delivery_mode: 完整` |
| 输出 | `-o` 指定 MP3；`--srt` 生成同 basename `.srt` |
| 音色 | 主播 `zh-CN-XiaoxiaoNeural`；嘉宾 `zh-CN-YunjianNeural` |
| 角色行 | `**主播**` / `**嘉宾**`（兼容 考官/答题者） |

```powershell
python ".cursor/md-skills/文档转博客/scripts/md-podcast-to-mp3.py" `
  "path\to\播客朗读稿-主题.md" `
  -o "path\to\完整版-主题-搭档聊天.mp3" `
  --srt
```

## 检查点 C（TTS 失败）

1. 保留已交付的朗读稿 + 详细解答（若有）。
2. 将上列 **完整命令** 发给用户本地执行。
3. 常见原因：

| 现象 | 处理 |
| --- | --- |
| `edge-tts 失败` / SSL | 确认使用 CLI（脚本已用 subprocess，勿改回 Python API） |
| `ffmpeg` 警告 | `pip install imageio-ffmpeg` 或安装系统 ffmpeg |
| PowerShell `--rate -5%` 报错 | 脚本已用 `+0%`，勿手改 rate |
| 单段过长 | 脚本按 `MAX_CHARS` 截断；可拆段或缩短对白 |

## 明确不用

- Task 子 agent 跑 TTS（无收益）
- 商用 TTS API token（本仓库默认 edge-tts 免费路径）
