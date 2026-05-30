# 语音 TTS 路由中心 — 说明文档

## 我该什么时候用？

当你需要把文字转成语音——生成 MP3 朗读音频、带字幕的 SRT 文件、或者把整篇文档转成播客。

## 快速使用

1. 告诉 Agent：`把这段文字转成 MP3`
2. Agent 读 `SKILL.md` → 判断需求 → 选 TTS 后端
3. 默认用 edge-tts（免费，微软语音，中文支持好）

## 可用后端

| 后端 | 一句话 | 费用 |
|------|--------|:---:|
| **edge-tts** | 微软免费 TTS，中文语音丰富 | 免费 |
| **文档转播客 脚本** | 本地 Python 脚本，含 SRT 字幕 | 免费 |
| **openai-edge-tts** | 自部署 HTTP API，兼容 OpenAI 格式 | 免费 |
| **Obsidian edge-tts** | Obsidian 插件内直接听 | 免费 |

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "把这段文字转成 MP3" | edge-tts --voice zh-CN-XiaoxiaoNeural |
| "生成朗读音频，要字幕" | edge-tts --write-subtitles |
| "把这个文档转成播客" | 调 文档转播客 skill |

## 推荐中文语音

- `zh-CN-XiaoxiaoNeural` — 女声，温柔（默认）
- `zh-CN-YunxiNeural` — 男声，新闻播报
- `zh-CN-XiaoyiNeural` — 女声，活泼
