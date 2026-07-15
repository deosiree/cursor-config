# test-prompts（待写入 test-prompts.json）

> Plan 模式无法写 JSON。批准 Agent 后原样写入 `translateTool-skills/translate/test-prompts.json`。

```json
[
  {
    "id": "tp-en2ru-001",
    "name": "Qt xlsx 英译俄 happy path",
    "prompt": "用 translate 技能把 f:\\DownLoads\\qt通用语言.xlsx 英文翻译列翻成俄文，输出 xlsx",
    "expected": "识别 --mode en2ru；读英文翻译列；输出 qt通用语言_ru.xlsx；%1/%2 占位符保留"
  },
  {
    "id": "tp-en2ru-002",
    "name": "误触发防护",
    "prompt": "翻译这个 xlsx 词条文件成英文",
    "expected": "走 zh2en 默认模式，不覆盖俄文列；不误触发 en2ru"
  },
  {
    "id": "tp-en2ru-003",
    "name": "占位符边界",
    "prompt": "en2ru 模式翻译: Could not register file '%1': %2",
    "expected": "俄文译文中 %1 和 %2 格式不变，顺序可随语序调整但 token 不可拆分"
  }
]
```

## evals（待写入 evals/evals.json）

见计划正文 acceptance；Agent 执行时一并落盘。
