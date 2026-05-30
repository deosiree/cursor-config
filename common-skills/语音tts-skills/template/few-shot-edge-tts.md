# edge-tts — 真实输出

**触发：** "把这段 Agent Loop 定义转成 MP3"  
**命令：**
```bash
edge-tts --voice zh-CN-XiaoxiaoNeural \
  --text "Agent Loop 是智能体系统的核心运行时。它不是一次用户提问就结束，而是一个循环过程：推理、行动、观察、再推理，直到任务完成。" \
  --write-media few-shot-agent-loop.mp3 \
  --write-subtitles few-shot-agent-loop.srt
```

**产出文件：**
- `few-shot-agent-loop.mp3`（77 KB，15 秒，中文女声）
- `few-shot-agent-loop.srt`（2 条字幕）

**SRT 内容：**
```
1
00:00:00,100 --> 00:00:04,037
Agent Loop 是智能体系统的核心运行时。

2
00:00:03,987 --> 00:00:13,075
它不是一次用户提问就结束，而是一个循环过程：推理、行动、观察、再推理，直到任务完成。
```

**可用中文语音：**
- `zh-CN-XiaoxiaoNeural` — 女声，温柔（本示例使用）
- `zh-CN-YunxiNeural` — 男声，新闻播报
- `zh-CN-XiaoyiNeural` — 女声，活泼
