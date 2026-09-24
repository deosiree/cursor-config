# 创建沙盒分支

父级 agent 套件：用 git worktree 开 sibling 沙盒，或安全删除沙盒；intention / feature 分层。

## Frontmatter 模式

**本地中文模式**：`name` / `description` 均为中文。见 [[SKILL.md]]。

## 职责边界

| 本套件 | 邻近 skill |
| --- | --- |
| 开/删 sibling worktree 沙盒 | [[../merge临时分支到主分支并删除临时分支/SKILL.md]]：整支 merge + 删临时分支 |
| 可选恢复 stash 到沙盒 | [[../按顺序cherry-pick到其他分支/SKILL.md]]：只挑 commit |
| 不写业务实现 | `git-commit-batching-workflow`：批提交文案 |

## 目录结构

```text
创建沙盒分支/
├── README.md
├── SKILL.md
├── intention-skills/
├── feature-skills/
├── template/
├── assets/
├── references/
└── evals/
```

## 使用示例

```text
基于 develop 开沙盒 devmgr，恢复 stash@{0}，先别 push。
使用 $创建沙盒分支。
```

```text
安全删除 apex_devmgr / 分支 devmgr；有未提交改动先停下问我。
使用 $创建沙盒分支。
```

完整叙事：[[template/示例-从develop开沙盒并恢复stash.md]]、[[template/示例-安全删除未合入沙盒.md]]

## 验收方式

- 父级精简 + intention/feature 节点非空心
- 行为口径：[[evals/触发用例.md]]
- Agent 自检：[[assets/执行检查清单.md]]
- Darwin：[[evals/darwin-hl4-final.md]]（已达 HL-4，建议收手；轨迹 [[evals/results.tsv]]）
