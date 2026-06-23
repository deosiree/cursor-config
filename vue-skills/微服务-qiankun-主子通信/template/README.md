# template/ 使用说明

## 职责边界（write-skill guardrails）

| 目录 | 读者 | 内容 |
|---|---|---|
| `template/` | **人类** | RED/GREEN 结构说明、失败信号、分步验收 |
| `assets/few-shot-example/` | **agent** | 完整触发 prompt + 双端 diff + traceability |

两者代码可重叠，但 template 必须多「为什么失败 / 怎么验」的结构层。

## 样本索引

| 场景 | before | after | consumerPattern |
|---|---|---|---|
| 用户信息同步 | `用户信息同步/before/` | `用户信息同步/after/` | patchStore |
| 电站 tab 高亮 | `电站切换/before/` | `电站切换/after/` | customEvent |

## 阅读顺序

1. 读 `before/` 确认失败信号
2. 读 `after/` 对照双端改动
3. 需要 agent 执行时，再读 `assets/few-shot-example/` 同名目录
