# Obsidian Skills — 知识库管理技能总入口

> 本目录是 huiyanSkills 仓库中所有 Obsidian 相关技能的路由总入口。

---

## 目录结构

```
obsidian-skills/
├── README.md                             ← 本文件（人类指南）
├── intention-skills/                     ← 编排器（只做路由和派发，不执行具体操作）
│   └── route-obsidian/
│       ├── SKILL.md                      ← Single Dispatch + Human Loop 路由器（121行）
│       ├── README.md                     ← 人类说明
│       ├── evals/
│       │   ├── evals.json                ← 10 个评估用例（含边界）
│       │   └── test-prompts.json         ← 8 个受控试跑 prompt
│       └── template/
│           ├── mvp/任务输入.md            ← MVP 测试步骤
│           └── snapshot/套件结构快照.md    ← 当前快照
└── feature-skills/                       ← 原子技能（实际干活的）
    ├── llm-wiki/                         ← submodule: claude-wiki-verbs（完整 9 动词 LLM Wiki）
    ├── vault-maintainer/
    │   ├── README.md                     ← 安装指引
    │   └── SKILL.md                      ← Hermes 桥接 + 内置降级
    ├── obsidian-vault/
    │   ├── README.md                     ← 安装指引
    │   └── SKILL.md                      ← Hermes 桥接 + 内置降级
    └── qmd/                              ← 可选：NousResearch 语义搜索（153K★）
```

---

## 设计原则

### 1. intention-skills vs feature-skills 分层

| 类型 | 职责 | 举例 |
|------|------|------|
| **intention-skills**（编排器）| 识别用户意图 → 路由到正确的 feature skill | route-obsidian |
| **feature-skills**（原子技能）| 执行具体操作（读写/搜索/维护/摄入） | llm-wiki, vault-maintainer |

编排器不做具体操作，原子技能不知道路由逻辑。各司其职。

### 2. 反迭代漩涡（Anti-Vortex）设计

> 详见 `intention-skills/route-obsidian/SKILL.md` 的 4 条核心规则。

| 规则 | 说明 |
|------|------|
| **Single Dispatch** | 每次只 dispatch 一个子 skill，不链式 fallback |
| **Max 1 Auto-Fallback** | 仅可行性检查失败时自动回退一次 |
| **Fail → Human Loop** | 运行时失败不自动尝试其他 skill，报告用户决策 |
| **Token 止损** | >20 个工具调用未解决 → 停止并报告 |

### 3. 路由表速查

| 你要做什么 | 首选 skill | 次选（可行性失败时） |
|-----------|-----------|------------------|
| 新建/读写笔记 | obsidian-vault | llm-wiki save |
| 检索知识 | llm-wiki query | qmd |
| Vault 修复/合规 | vault-maintainer | 无→Human Loop |
| 摄入知识 | llm-wiki ingest | obsidian-vault |
| 综合/对比/编译 | llm-wiki (synthesize/critique/compare/eli5) | 无→Human Loop |

---

## 安装指南

### ✅ 已安装（立即可用）

- **llm-wiki** — git submodule，直接可用。完整 9 动词（ingest/query/save/lint/manage/synthesize/critique/compare/eli5）

### 📦 待安装（需手动操作）

以下技能需要通过 Hermes Agent 安装，因为它们来自 Hermes/OpenClaw 的 skill marketplace，没有独立的 GitHub 仓库：

```bash
# 安装 vault-maintainer（OpenClaw, 374K★）
hermes skills install vault-maintainer

# 安装 obsidian-vault（NousResearch, 153K★）
hermes skills install obsidian-vault

# 安装 qmd 语义搜索（NousResearch, 153K★，可选）
hermes skills install qmd
```

安装后，将 `~/.hermes/skills/<skill-name>/` 的内容复制到对应的 `feature-skills/<skill-name>/` 目录下。

---

## 更新方式

```bash
# 更新 llm-wiki（claude-wiki-verbs）
cd common-skills/obsidian-skills/feature-skills/llm-wiki
git pull origin main

# 更新主仓库的 submodule 指针
cd ../../..
git add common-skills/obsidian-skills/feature-skills/llm-wiki
git commit -m "chore: bump llm-wiki submodule"
```

---

## 设计参考

- **Karpathy LLM Wiki** — claude-wiki-verbs 实现的底层模式（3 层架构：raw → entities/concepts/comparisons → SCHEMA/index/log）
- **Hermes Agent** — obsidian-vault、vault-maintainer、qmd 的来源
- **OpenClaw** — vault-maintainer 的来源
- **反漩涡设计** — 源自 Agent 最佳实践的 Single-Dispatch + Human-Loop 模式
