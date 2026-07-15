# 按顺序 cherry-pick 到其他分支

轻量中文 skill：把**已落地**的一个或多个 commit，按从旧到新顺序复制到目标分支。

## Frontmatter 模式

本次采用**本地中文模式**：

- `name`：中文技能名
- `description`：中文触发描述

详见 [[SKILL.md]] 的 YAML frontmatter。

## 职责边界

| 本 skill | 不做 |
| --- | --- |
| 已提交 commit → 另一分支（单挑 / 列表 / 区间） | 未提交工作区的 stash 搬运 |
| 冲突门控与 continue/abort/quit 指引 | 交互式 rebase、改写历史 |
| 可选 push / 删源分支（须明确授权） | 默认自动 push 或删分支 |
| — | 整支 merge + 删临时分支（见 merge skill） |

邻近 skill：

- [[../merge临时分支到主分支并删除临时分支/SKILL.md]]：整支合入并删临时分支
- `git-commit-batching-workflow`：管「未提交改动如何批提交文案与命令」
- 本 skill：管「**已有 commit** 如何按序落到另一分支」

## 目录结构

```text
按顺序cherry-pick到其他分支/
├── README.md                 # 本文件（维护者导航）
├── SKILL.md                  # Agent 执行入口
├── template/                 # 给人仿写的完整示例
├── assets/                   # 给 agent 按需读取的清单与 few-shot
├── references/               # 源文档摘要与设计理由
└── evals/                    # 触发 / 误触发验收
```

## 知识来源

- `F:\Documents\Default-Obsidian\语言\git快捷使用\恢复 & 回滚\提交到另一分支cherry-pick.md`
- `F:\Documents\Default-Obsidian\语言\git快捷使用\git快捷使用.md`（cherry-pick 节）

摘要见：

- [[references/为何不用stash.md]]
- [[references/多提交与冲突手册.md]]
- [[references/Windows-worktree与长路径.md]]（脏主仓沙盒实跑；Filename too long 规避）

## 使用示例

```text
我只要 feature 上那几次 translate 相关提交，按顺序 cherry-pick 到 main，
不要用 stash，先别 push。使用 $按顺序cherry-pick到其他分支。
```

完整命令叙事：[[template/示例-临时分支到main.md]]

## 验收方式

- 结构：存在 README / SKILL / template / assets / references / evals
- 行为口径：见 [[evals/触发用例.md]]
- Agent 自检：[[assets/执行检查清单.md]]

## 阶段二实跑（预留）

本 skill **落盘 ≠ 对仓库实跑**。对 `huiyanSkills` 仓库将临时分支落到 `main` 时：

1. 用户先整理并提交干净工作树
2. 用户明确确认「可以实跑」
3. 再激活本 skill：源分支 / 目标 `main` / 完整 old→new 列表 → cherry-pick → 验收
4. 仅当用户明确说不要临时分支时，再 `branch -d`
5. 默认不 `push`，除非用户当场要求

### 已知对照（落盘时快照，实跑前须重新核对）

- 源：`auto-optimize/20260715-1605-translate`
- 目标：`main`
- 曾领先 main 的提交示例：`3280240` → `6e398e3` → `4be9c93` → `16f0af7`（用户后续提交后 tip 可能变化）
