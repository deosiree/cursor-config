# edge-tts 中文语音库 — 完整参考

## 获取命令

```bash
edge-tts --list-voices | grep zh-CN
```

## 完整中文语音列表

### 标准普通话（6 个）

| 语音名称 | 性别 | 内容风格 | 音色特点 | 推荐场景 |
|---------|:----:|---------|---------|---------|
| `zh-CN-XiaoxiaoNeural` | 女 | News, Novel | 温暖柔和，清晰自然 | ⭐ **默认推荐**。通用朗读、教程、播客、长文有声化 |
| `zh-CN-XiaoyiNeural` | 女 | Cartoon, Novel | 活泼灵动，有朝气 | 儿童内容、动画配音、轻松话题、社交媒体文案 |
| `zh-CN-YunjianNeural` | 男 | Sports, Novel | 激情有力，有感染力 | 体育解说、促销宣传、励志内容、开场致辞 |
| `zh-CN-YunxiNeural` | 男 | Novel | 阳光开朗，明亮清晰 | 新闻播报、技术讲解、有声小说（阳光型男主） |
| `zh-CN-YunxiaNeural` | 男 | Cartoon, Novel | 可爱萌趣，带少年感 | 儿童故事、游戏角色、轻松动画配音 |
| `zh-CN-YunyangNeural` | 男 | News | 专业稳重，可靠感强 | **正式场景首选**。新闻联播、官方公告、产品发布、法律声明 |

### 方言（2 个）

| 语音名称 | 性别 | 方言区域 | 音色特点 | 推荐场景 |
|---------|:----:|---------|---------|---------|
| `zh-CN-liaoning-XiaobeiNeural` | 女 | 辽宁（东北话） | 幽默亲切，带东北口音 | 东北地区本地化内容、喜剧类播客、方言创作 |
| `zh-CN-shaanxi-XiaoniNeural` | 女 | 陕西（关中话） | 明亮爽朗，带陕西口音 | 西北地区本地化内容、地方文化节目 |

---

## 快速选择指南

### 按内容类型

| 内容类型 | 推荐语音 | 理由 |
|---------|---------|------|
| 技术文章 / 教程 | `zh-CN-XiaoxiaoNeural` | 清晰自然，长时间听不疲劳 |
| 新闻 / 公告 | `zh-CN-YunyangNeural` | 专业稳重，可信度高 |
| 有声小说（故事） | `zh-CN-XiaoxiaoNeural`（温情）或 `zh-CN-YunxiNeural`（阳光） | 根据角色调性 |
| 儿童内容 | `zh-CN-XiaoyiNeural` 或 `zh-CN-YunxiaNeural` | 活泼/可爱，符合孩子喜好 |
| 营销 / 促销 | `zh-CN-YunjianNeural` | 激情有力，能调动情绪 |
| 方言节目 | `zh-CN-liaoning-XiaobeiNeural` 或 `zh-CN-shaanxi-XiaoniNeural` | 本地化亲和力 |

### 按性别

- **女声：** `Xiaoxiao`（通用）、`Xiaoyi`（活泼）、`Xiaobei`（东北）、`Xiaoni`（陕西）
- **男声：** `Yunyang`（专业）、`Yunxi`（阳光）、`Yunjian`（激情）、`Yunxia`（可爱）

### 按语速 / 音高微调

所有语音均支持运行时调整：

```bash
# 放慢语速（负值放缓，正值加快）
edge-tts --voice zh-CN-XiaoxiaoNeural --rate=-10% --text "..."

# 调高音调
edge-tts --voice zh-CN-YunxiNeural --pitch +20Hz --text "..."

# 降低音量
edge-tts --voice zh-CN-XiaoxiaoNeural --volume=-20% --text "..."
```

> **经验值：** 长文本建议 `--rate -5%`，听感更从容；教程类建议 `--rate +0%` 保持标准。

---

## 外部链接

- [rany2/edge-tts](https://github.com/rany2/edge-tts) — Python CLI，11k stars
- [官方 VoiceList 文档](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts#text-to-speech)
