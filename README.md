# 通用 AI Skills 库

本仓库收录可复用的 AI 技能（Skills），覆盖通用协作、开发工具、项目领域与内容处理等场景。技能以各自目录中的 `SKILL.md` 为入口，可按当前 AI 工具的约定单独发现或安装；本仓库不依赖某一种编辑器。

## 目录

| 分类 | 内容 |
| --- | --- |
| `agent-skills/`、`common-skills/` | 通用协作与跨项目复用技能 |
| `debug-or-review-skills/`、`dev-skills/`、`git-skills/`、`test-skills/` | 调试、开发、Git 与测试工作流 |
| `harness-skills/`、`html-skills/`、`IDE-skill/`、`md-skills/` | Harness、HTML、IDE 与 Markdown 工具技能 |
| `go-skills/`、`nebula-skills/`、`proj-skills/`、`vue-skills/`、`translateTool-skills/` | 语言、框架、项目和业务领域技能 |
| `role-skills/`、`system-skills/` | 角色视角与系统类技能 |
| `darwin-skill/` | 技能质量评估与迭代 |
| `docs/`、`scripts/`、`specs/` | 文档、维护脚本与规格资料 |

各分类下可以包含 `intention-skills/`、`feature-skills/`、`references/`、`assets/`、`evals/` 等子目录；以每个技能自己的 `SKILL.md` 和目录说明为准。

## 使用

1. 克隆仓库到本地目录：

   ```bash
   git clone https://github.com/deosiree/cursor-config.git skills-library
   ```

2. 搜索技能入口：

   ```bash
   rg --files skills-library -g SKILL.md
   ```

3. 阅读目标技能的 `SKILL.md`，并按其中的路由加载相关子技能、参考资料或评估资产。若要安装到某个 AI 工具，请将所需技能目录放入该工具支持的 Skills 发现路径；具体路径由工具决定。

## 维护与贡献

- 在对应分类中维护技能及其配套资料，避免复制同一技能到多个分类。
- 新增或调整路由时，同步检查相关入口、子技能和索引说明。
- 通过 GitHub Issues 讨论问题和建议，通过 Pull Requests 提交修改。
