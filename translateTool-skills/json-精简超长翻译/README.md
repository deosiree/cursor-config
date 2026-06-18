# json-精简超长翻译

## 定位

扫描 JSON 翻译文件（或递归扫描目录），检测指定语种字段的 UTF-8 字节长度是否超限，配合 LLM 将超长词条缩短到合规字节内，并输出到隔离目录。

## 目录职责

```
json-精简超长翻译/
├── SKILL.md                              # parent-agent 入口：分类 + 路由 + 门禁
├── README.md                             # 本文件：套件定位与使用说明
├── scripts/
│   └── check-russian.js                  # 核心检测 + 回验脚本（俄语）
├── intention-skills/
│   ├── README.md                         # 意图层总览
│   ├── 分析-输入确认/                     # 校验输入参数是否有效
│   └── 编排-精简工作流/                   # 根据检测报告编排缩短/跳过
├── feature-skills/
│   ├── README.md                         # 功能层总览
│   ├── 扫描-JSON词条检测/                 # 运行检测脚本，输出检测报告
│   ├── 执行-俄语LLM缩短/                  # LLM 参考字符预算缩短俄语字符串
│   └── 执行-回验输出/                     # 回验合规后写输出到 _new 目录
├── template/
│   ├── before/                            # 失败基线：无脚本时的常见偏差
│   └── after/                             # 完整使用示例（8 条真实案例）
├── assets/
│   ├── few-shot-example/                  # 给 agent 读的样本
│   └── skill-output-checklist.md          # 收尾检查清单
├── references/
│   └── 编码约束说明.md                    # UTF-8 编码规则 + C++ 限制背景
└── evals/
    └── evals.json                         # 触发/不触发评价用例
```

## 目录职责

| 目录 | 职责 |
|------|------|
| `SKILL.md` | 父级 agent 入口，负责任务分类、路由分发、人工门禁 |
| `scripts/` | 可复用的检测/回验脚本，不依赖 LLM |
| `intention-skills/` | 判断层：输入校验、流程编排决策 |
| `feature-skills/` | 执行层：检测运行、LLM 缩短、回验输出 |
| `template/` | 给人看的失败基线文档与完整使用案例 |
| `assets/` | 给 agent 读的 few-shot 样本与检查清单 |
| `references/` | 编码约束等技术参考 |
| `evals/` | 套件级触发/不触发生成式评价用例 |

## 使用示例

```text
使用 $json-精简超长翻译
  --inputPath F:\Documents\Repertory\Sieyuan\translationtool\docs\1.9.0翻译过长\db
  --fieldPath translation.ru_RU
  --byteLimit 63
  --outputSuffix _new
```

执行后：
- 扫描 `db/` 下所有 JSON 文件
- 检测每条词条的 `translation.ru_RU` 是否超 63 UTF-8 字节
- 无超长 → 直接全量复制到 `db_new/`
- 有超长 → 输出检测报告 → LLM 按预算缩短 → 回验 → 写入 `db_new/`

## 演化边界

- 当前仅支持俄语（`scripts/check-russian.js`）
- 未来新增语种 → 新增 `scripts/check-<语种>.js`，并扩展 parent-agent 路由
- 未来接入 Darwin 评估 → 新增 `feature-skills/Darwin-质量评分/`
