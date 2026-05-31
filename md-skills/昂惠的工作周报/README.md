# 昂惠的工作周报

> 基于飞书文档《达人BD每日工作记录》自动生成本周工作周报。

## 触发词

周报、本周工作、weekly report、生成周报

## 目录索引

```
昂惠的工作周报/
├── SKILL.md                              # Agent skill（路由 + 门禁）
├── README.md                             # 本文件
│
├── intention-skills/
│   └── 编排-生成工作周报/SKILL.md         # 5步编排器
│
├── feature-skills/
│   ├── 提取-本周飞书内容/SKILL.md         # OpenCLI → 定位本周 → 勾选
│   ├── 聚合-本周工作内容/SKILL.md         # Agent 驱动合并 → ≤10条
│   └── 生成-周报文档/SKILL.md             # 拼装四段 → 写文件（最终落盘已并入编排器步骤5）
│
├── scripts/
│   ├── embed-template.js                 # 模板 → prompt block
│   └── embed-fewshot.js                  # few-shot → prompt block
│
├── template/
│   ├── mvp/真实输出.md                    # LLM few-shot
│   └── snapshot/周报模板结构.md           # 结构约束
│
├── references/
│   ├── 周报生成规则.md                    # 业务规则
│   ├── 聚合原则.md                        # 聚合指导 + 历史参考
│   ├── 昂惠的工作周报-template.md         # 模板原文
│   ├── 工作周报-YYYY-MM-DD.md             # 命名约束
│   └── 昂惠的工作周报-2026-05-31.md       # few-shot 原文
│
├── assets/few-shot-example/SKILL.md      # few-shot 路由
├── evals/evals.json                      # 评估数据
└── test-prompts.json                     # 测试提示词
```

## 依赖

- `[[../../common-skills/OpenCLI下载飞书文档/SKILL.md]]` — 通用飞书文档下载能力

## 数据流

```
飞书文档
  → 提取-本周飞书内容（OpenCLI 下载 + 定位本周 + 勾选检测）
  → 聚合-本周工作内容（Agent 驱动合并 ≤ 10条）
  → 生成-周报文档（内嵌模板 + few-shot + 拼装四段）
  → 读取-输出文档落盘（纯文本输出）
```

## 使用示例

```text
生成周报
→ 自动执行 5 步流程 → 输出可复制文本
```
