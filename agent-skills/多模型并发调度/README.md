# 多模型并发调度

## 概述

多供应商多模型的加权路权并发调度 agent 套件。核心能力：

- **任务感知**：自动判断批处理任务（翻译/审查/测试）vs 复杂任务（编码/推理）
- **模型提案**：未指定模型时生成含路数/批大小/计费/URL 的提案表 → 等人确认
- **车道限流**：每个模型独立 lane 上限（讯飞 20 路、硅基各 1 路、智谱 1 路）
- **批大小自适应**：大规模满路跑 vs 小规模平分缩批
- **免费/主力分离**：翻译默认走 free tier，不消费主力模型

## 文件结构

```
agent-skills/多模型并发调度/
├── SKILL.md                                  # 主 agent 路由
├── README.md                                 # 本文件
├── intention-skills/
│   ├── 分析-任务分类与模型提案/               # 任务分类 + 模型提案表 + CHECKPOINT
│   ├── 分析-路权判定/                         # 路权计算 + 批大小自适应
│   └── 编排-加权调度/                         # CLI 组装 + 路由
├── feature-skills/
│   ├── 执行-车道限流调度/                     # LanePoolDispatcher
│   └── 探测-模型可用性/                       # 探测 + 定价过期检查
├── lib/
│   └── laneDispatcher.js                     # LanePoolDispatcher 实现
├── references/
│   └── lane-model.md                         # 路权模型完整说明
├── template/few-shot-example/
├── evals/
│   └── evals.json
└── results.tsv
```

## 共享依赖

本套件依赖 translate 套件中的共享配置：

| 文件 | 说明 |
|------|------|
| `lib/models.config.json` | 模型清单（路数/批大小/定价/供应商） |
| `../translate/lib/modelCatalog.js` | 模型目录加载器（从 JSON 读取） |
| `../.env` | API Key（每个供应商） |

## 使用方式

### 场景 1：翻译任务（自动推荐免费池）

```
用户：翻译这个文件，英译俄

agent 路由：
  分析-任务分类与模型提案 → taskClass=batch, tier=free
  → 生成模型提案表（8 模型 / 27 路 / 全部限免）
  → 🔴 CHECKPOINT 等人确认
  → 人确认「全用」
  → 分析-路权判定 → totalLanes=27, 场景A/B
  → 编排-加权调度 → CLI 组装
  → 执行-车道限流调度 → LanePoolDispatcher → 翻译完成
```

### 场景 2：编码任务（自动推荐主力模型）

```
用户：帮我审查这个项目的代码架构

agent 路由：
  分析-任务分类与模型提案 → taskClass=complex, tier=primary
  → 生成模型提案表（DeepSeek v4-pro 500路/$0.87 + v4-flash 2500路/$0.28）
  → 🔴 CHECKPOINT 等人确认
  → 人确认「用 v4-flash」
  → 单模型执行（不走并发调度）
```

### 场景 3：用户已指定模型（跳过提案）

```
用户：用讯飞和智谱一起翻译这个文件

agent 路由：
  → 跳过任务分类（用户已指定）
  → 分析-路权判定（讯飞 20 路 + 智谱 1 路 = 21 路）
  → 编排-加权调度
  → 执行-车道限流调度
```

## 模型配置

所有模型信息见 `lib/models.config.json`。换模型/调路数/更新定价只需编辑该文件。

`.env` 只存 API Key，模型增删在 `models.config.json`。
