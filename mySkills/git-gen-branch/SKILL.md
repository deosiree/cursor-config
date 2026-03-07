---
name: git-gen-branch
description: 基于当前未提交改动生成规范分支名，并输出细粒度 commit 批次名与每批推送文件清单。用于复杂改动的分批提交和可控推送。
---

# 目标
先识别当前全部未提交改动，再输出可读、可追踪、可执行的分支名与细粒度提交方案。

## 命名规则
1. 结构：`<type>/<scope>-<summary>`。
2. `type` 建议：`feat` `fix` `refactor` `chore` `docs` `test`。
3. 全小写，使用 `-` 分隔，避免中文和空格。
4. 长度控制在 50 字符内。

## Commit 规则
1. 结构：`<type>(<scope>): <summary>`。
2. 每个 commit 只包含一个语义单元（配置、API、权限、路由、页面、修复等）。
3. 允许在 `<summary>` 前加入 emoji 前缀（如 `:sparkles:`、`:bug:`、`:wrench:`）。
4. **版本名冒号后的 `<summary>` 必须使用中文**（可含英文术语/缩写，如 API、OAuth、V2，但主叙述必须为中文）。
5. 禁止纯英文 summary（如 `add login page`、`refactor auth flow`）。
6. 一批次最少 1 个 commit，建议 3-8 个 commit（改动越大拆分越细）。
7. 若文件数 >= 25，默认输出 4-8 个功能批次。
8. 单批次建议不超过 12 个文件；超过则继续拆分。
9. 每个 commit 必须绑定明确文件清单，禁止“全量混提”。

## 细粒度拆分优先级（必做）
1. 按层拆分：`config/build` > `api/mock` > `permission/auth/router` > `views/components` > `bugfix`。
2. 按功能域拆分：同为 `views` 也要按业务域分组（如 `login`、`system/user`、`tenant`）。
3. 按变更性质拆分：新增能力（`feat`）与修复问题（`fix`）不得混在同一批次。
4. 按风险拆分：权限、鉴权、请求链路优先单独成批，便于回滚。

## 执行步骤
1. 识别当前全部未提交改动（必做）：
   - `git status --short`
   - `git status --porcelain`
   - `git diff --name-only`
   - `git diff --name-only --cached`
2. 检查是否存在 `MM`（已暂存+未暂存混杂）：
   - 若存在，先建议执行：`git restore --staged .`
3. 检查是否存在 gitlink/子仓库误纳入（模式 `160000`）：
   - 可用：`git ls-files -s`
   - 若命中 `.cursor`、`vendor` 等路径，标记为“不建议推送”。
4. 按“细粒度拆分优先级”聚类文件，强制拆成单一功能主题批次。
5. 提取任务核心动作与影响范围，归一化为简短英文关键词。
6. 生成分支名：1 个推荐 + 2 个备选。
7. 生成 commit 批次方案：每批包含 `commit message` + `文件清单` + `备注`。
8. 对每个 `commit message` 做语言校验：冒号后内容必须为中文叙述，不满足则重写。
9. 生成推送顺序：先低风险（配置/API）后高风险（权限/登录/路由）。
10. 标注不建议立即推送的文件（如 `.env*`、临时目录、构建产物、gitlink）。
11. 若单文件包含多类变更，优先建议 `git add -p` 做 hunk 级拆分。

## 输出要求
1. 必须包含五段输出：`分支名`、`commit 批次`、`推送文件`、`预处理命令`、`不建议推送`。
2. 分支名部分：给出推荐分支名与理由，并给出 2 个备选名。
3. commit 批次部分：给出每一批的 commit 版本名，并说明该批次目标。
4. commit 批次命名风格应贴近：
   - `chore(config): :wrench: 调整构建与环境配置`
   - `feat(api): :sparkles: 接入 seccenter v2 接口`
   - `refactor(permission): :recycle: 重构权限校验链路`
   - `fix(views): :bug: 修复登录页交互异常`
5. 推送文件部分：按“批次”分组列出路径，支持多行 `文件：...`。
6. 预处理命令部分：若检测到 `MM`，必须给出 `git restore --staged .` 建议。
7. 不建议推送部分：说明文件与原因（环境差异、临时文件、自动生成文件、gitlink）。
8. 给出可直接复制执行的命令骨架（按批次 `git add` / `git add -p` / `git commit` / `git push`）。

## 固定输出模板
你这批改动建议按 `<N>` 个功能批次提交（基于当前 `<repo>` 实际变更）：

1. `<type>(<scope>): :emoji: <中文 summary>`
文件：`<path-a> <path-b> ...`
备注：`<可选，风险/依赖/回滚说明>`

2. `<type>(<scope>): :emoji: <中文 summary>`
文件：`<path-c> <path-d> ...`
备注：`<可选>`

建议先执行一次，避免“已暂存+未暂存混杂（MM）”影响分批：
`git -C <repo> restore --staged .`

按上面每批 `git add <paths>` 后 `git commit -m "<message>"`。

额外建议（高优先级）：
1. `git -C <repo> restore --staged <suspicious-path>`
2. 如不需跟踪，加入 `.gitignore`：`<pattern>`
3. 最后再 `git -C <repo> push origin <branch>`

## 外部最佳实践校验（必做）
1. 无论是否使用本 skill，都先进行一次 web search，确认当前任务的最佳实践与最新约束。
2. 优先来源顺序：官方文档 > 标准组织/维护者仓库 > 高质量技术文档。
3. 至少引用 2 个来源；高风险任务（生产、权限、安全、数据）至少 3 个来源交叉验证。
4. 输出中必须包含：来源链接、采纳点、未采纳点与原因。
5. 若检索结果不足或冲突，必须明确不确定性并给出保守方案。
