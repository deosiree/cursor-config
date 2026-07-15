# merge 临时分支到主分支并删除临时分支

轻量中文 skill：整支 `merge` 进主分支，验收后删除临时分支。

## Frontmatter 模式

**本地中文模式**：`name` / `description` 均为中文。见 [[SKILL.md]]。

## 职责边界

| 本 skill | 邻近 skill |
| --- | --- |
| 整支 merge + 默认删临时分支 | [[../按顺序cherry-pick到其他分支/SKILL.md]]：只挑部分 commit |
| 本地合入为主 | `git-commit-batching-workflow`：批提交文案，不负责 merge |

## 目录结构

```text
merge临时分支到主分支并删除临时分支/
├── README.md
├── SKILL.md
├── template/
├── assets/
├── references/
└── evals/
```

## 使用示例

```text
临时分支收工了，merge 进 main 然后删掉临时分支，先别 push。
使用 $merge临时分支到主分支并删除临时分支。
```

完整叙事：[[template/示例-merge进main并删临时分支.md]]

## 验收方式

- 结构六件套齐全
- 行为口径：[[evals/触发用例.md]]
- Agent 自检：[[assets/执行检查清单.md]]
