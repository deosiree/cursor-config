# 长文本分片合并 — 真实输出

**触发：** "把这篇 8000 字的技术文章转成 MP3"

**用户输入：** 一篇 8000 字图文并茂的技术文章（正文省略）

---

## Agent 响应：分段预览

> 这篇文章约 8000 字，按段落分割为 3 段：
>
> | 分段 | 字数 | 预估时长 |
> |------|------|---------|
> | 第 1 段 | 2,680 字 | ~5.8 分钟 |
> | 第 2 段 | 3,200 字 | ~7.0 分钟 |
> | 第 3 段 | 2,120 字 | ~4.6 分钟 |
> | **合计** | **8,000 字** | **~17.4 分钟** |
>
> 预览前 3 段的首句：
> - **第 1 段开头：** "分布式系统的一致性模型是构建可靠微服务架构的基石……"
> - **第 2 段开头：** "在实际工程中，线性一致性往往因性能开销而被折中为最终一致性……"
> - **第 3 段开头：** "CAP 定理指出，一致性、可用性和分区容忍性三者不可兼得……"
>
> 是否按此分段生成？[继续 / 调整分段 / 取消]

**用户：** 继续

---

## Agent：逐段生成

```bash
# 第 1 段
edge-tts --voice zh-CN-XiaoxiaoNeural --rate +0% \
  --text "分布式系统的一致性模型是构建可靠微服务架构的基石……【中略】……这是第一部分的内容。" \
  --write-media part_1.mp3

# 第 2 段
edge-tts --voice zh-CN-XiaoxiaoNeural --rate +0% \
  --text "在实际工程中，线性一致性往往因性能开销而被折中为最终一致性……【中略】……这是第二部分的内容。" \
  --write-media part_2.mp3

# 第 3 段
edge-tts --voice zh-CN-XiaoxiaoNeural --rate +0% \
  --text "CAP 定理指出，一致性、可用性和分区容忍性三者不可兼得……【中略】……这是第三部分的内容。" \
  --write-media part_3.mp3
```

**产出文件：**
- `part_1.mp3`（1.2 MB，5 分 48 秒）
- `part_2.mp3`（1.5 MB，7 分 02 秒）
- `part_3.mp3`（1.0 MB，4 分 37 秒）

---

## Agent：moviepy 合并

```bash
python -c "
from moviepy import AudioFileClip, concatenate_audioclips

clips = [AudioFileClip(f'part_{i}.mp3') for i in range(1, 4)]
final = concatenate_audioclips(clips)
final.write_audiofile('output.mp3')
print(f'合并完成：output.mp3')
"
```

**产出文件：**
- `output.mp3`（3.7 MB，17 分 27 秒）

---

## Agent：时长确认

```bash
python -c "from moviepy import AudioFileClip; a=AudioFileClip('output.mp3'); print(f'{a.duration:.1f}s ({a.duration/60:.1f}min)')"
```

```
1047.0s (17.5min)
```

---

## 最终报告

```
✅ output.mp3 — 17 分 27 秒，中文女声（XiaoxiaoNeural），3.7 MB
临时文件 part_1/2/3.mp3 可清理
```

**对比预估值：** 17.4 min 预估 → 17.5 min 实际，偏差 <1%，分段策略有效。
