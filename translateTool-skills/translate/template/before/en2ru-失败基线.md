# before · en2ru 失败基线

## 用户请求

```text
读取 f:\DownLoads\qt通用语言.xlsx，把「英文翻译」列翻译成俄文，回填到「俄文翻译」列，给我新的 xlsx。
```

## 当前 skill 实际行为（失败）

1. 触发 [`SKILL.md`](../../SKILL.md) 后，默认走 **zh2en**：把「词条」当中文翻成英文，写入「英文翻译」。
2. 本文件「词条」本身已是英文（与「英文翻译」相同），zh2en 会二次加工英文列，**俄文列仍为空**。
3. 无 `--mode en2ru`、无 `prompt-*-en2ru.md`、description 无「英译俄」触发词 → agent 可能根本不选本 skill，或选错 mode。
4. 缺 `xlsx`/`axios`/`iconv-lite` 依赖声明时，`node translateCsv.js` 直接 `Cannot find module 'xlsx'`。

## 可观测后果

| 现象 | 说明 |
|------|------|
| 俄文翻译列全空 | 5378 条均为空 |
| 英文列被无意覆盖 | zh2en 写回「英文翻译」 |
| 无 `_ru.xlsx` 交付物 | 输出仍按 CSV 预览逻辑命名 |

## 根因摘要

- 翻译方向硬编码中文 → 英文
- 未声明 en2ru 模式与占位符俄文 prompt
- 无 Darwin test-prompts / evals 拦住误触发
