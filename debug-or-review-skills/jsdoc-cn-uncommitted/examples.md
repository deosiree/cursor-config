## 示例 1：本项目选择 microfb 仓库

用户需求：

- “为当前 microfb 的 git 未提交代码补充 JSDoc/行注释（中文）”

执行要点：

- 设定 `repo_root = F:/Documents/Repertory/Sieyuan/nebula/microfb`
- 在该目录执行：
  - `git status -sb`
  - `git diff --name-only`
- 只对这些变更文件补注释（例如 `src/utils/*.ts`、`src/views/**/*.vue`、新增测试等）

## 示例 2：本项目选择 apex_dev 仓库

用户需求：

- “apex_dev 里改了登录/用户/租户相关页面，提交前把新增/修改函数都补全中文 JSDoc”

执行要点：

- 设定 `repo_root = F:/Documents/Repertory/Sieyuan/nebula/apex_dev`
- 盘点未提交文件后逐个补注释，并跑 `lint/typecheck/test`（以项目脚本为准）

## 示例 3：单仓项目（无需指定 repo_root）

用户需求：

- “给未提交代码补 JSDoc”

执行要点：

- 若工作区只检测到一个 `.git`：默认使用该仓库根目录
- 仍需通过 `git rev-parse --show-toplevel` 做一次确认

