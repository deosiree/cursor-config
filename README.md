# 通用 AI Skills 库

面向 AI Agent 使用者与技能维护者，收录可按任务选择的 `SKILL.md`、工作流和配套资料，覆盖通用协作、软件开发、技术栈与内容处理等场景。仓库不依赖某一种编辑器或 AI 平台；自动发现方式和安装位置由目标平台决定。

## 快速开始

1. 克隆仓库，或直接在 GitHub 上浏览目录：

   ```bash
   git clone https://github.com/deosiree/cursor-config.git
   cd cursor-config
   ```

2. 按任务浏览下方目录，进入对应 Skill 文件夹。也可以在本地用 ripgrep 搜索入口：

   ```bash
   rg --files -g SKILL.md -g "!**/node_modules/**"
   ```

3. 先查看 `SKILL.md` 的描述和触发条件，再按正文执行；只有 Skill 明确引用时才继续读取相关 `references/`、`assets/` 或 `evals/`。

若使用的 AI 平台支持 Skills，可按该平台的官方说明添加所需的单个 Skill 目录。本仓库不规定跨平台统一安装路径，也不要求把整个仓库放进某个工具专属目录。

## 内容导航

| 主题 | 适合查找 | 目录 |
| --- | --- | --- |
| 通用协作与复用能力 | 任务分析、文档处理及可跨项目复用的工作流 | [`agent-skills/`](agent-skills/)、[`common-skills/`](common-skills/) |
| 开发与交付 | 调试、代码审查、开发、Git、测试、Harness 与 IDE 工作流 | [`debug-or-review-skills/`](debug-or-review-skills/)、[`dev-skills/`](dev-skills/)、[`git-skills/`](git-skills/)、[`test-skills/`](test-skills/)、[`harness-skills/`](harness-skills/)、[`IDE-skill/`](IDE-skill/) |
| 技术栈与项目领域 | Go、Vue、Nebula、项目结构和翻译工具相关技能 | [`go-skills/`](go-skills/)、[`vue-skills/`](vue-skills/)、[`nebula-skills/`](nebula-skills/)、[`proj-skills/`](proj-skills/)、[`translateTool-skills/`](translateTool-skills/) |
| 文档、格式与内容 | HTML、Markdown、角色视角和系统类能力 | [`html-skills/`](html-skills/)、[`md-skills/`](md-skills/)、[`role-skills/`](role-skills/)、[`system-skills/`](system-skills/) |
| 评估与仓库资料 | Skill 质量评估，以及维护文档、规格和脚本 | [`darwin-skill/`](darwin-skill/)、[`docs/`](docs/)、[`specs/`](specs/)、[`scripts/`](scripts/)、[`reports/`](reports/) |

部分目录包含特定项目或领域的技能。使用前请核对各自的适用范围、前置条件与限制，不要仅凭所在分类判断它适用于所有项目。

## 如何使用一个 Skill

`SKILL.md` 是每个 Skill 的入口。使用前建议依次确认：

- **适用场景**：任务是否符合 Skill 的触发条件和目标范围。
- **输入与前置条件**：是否需要指定文件、环境、权限或用户确认。
- **执行与交付**：按步骤执行，并检查规定的输出和验收条件。
- **配套资料**：按 Skill 的引用加载子 Skill、模板、示例或评估材料。

每个 Skill 可以按需要组织 `intention-skills/`、`feature-skills/`、`references/`、`assets/`、`evals/` 等目录；并非每个 Skill 都包含所有类型的资料。以对应目录中的说明为准。

## 贡献与维护

欢迎通过 [Issues](https://github.com/deosiree/cursor-config/issues) 反馈问题和建议，并通过 Pull Request 提交修改。提交前请：

- 仓库自行维护的规则、规格和文档使用简体中文；技术标识、命令与代码可保留原文。
- 同一规则维护一个权威来源；其他入口提供链接或路由，不复制细则。
- 控制改动范围，并提供可复核的验证结果；未运行的检查应如实注明。
- 提交标题遵循 Conventional Commits：`<type>(<scope>): <中文摘要>`，其中 `<scope>` 可选。

完整治理原则见[仓库章程](.specify/memory/constitution.md)。

## 许可

仓库根目录目前没有统一的 `LICENSE` 文件；部分 Skill 目录包含独立授权文件，使用前请检查目标目录。没有许可证时，默认版权规则仍适用；公开可见不代表获得复制、修改或再发布权限，详见 [GitHub 许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。
