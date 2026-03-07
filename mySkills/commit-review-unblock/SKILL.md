---
name: commit-review-unblock
description: Use when code cannot be committed due to pre-commit or lint-staged failures and a structured code review is needed to separate code defects from environment blockers.
---

# 提交阻塞与代码审查

## 概述
当“无法提交代码”与“需要代码审查”同时出现时，先分离问题类型，再并行推进。核心原则：证据优先，先定位阻塞层，再给审查结论。

## 何时使用
1. `git commit` 失败，但原因不清楚（暂存问题、hook、lint、环境策略都可能）。
2. 用户要求“必须过审核后提交”，不能用 `--no-verify` 绕过。
3. 需要同时产出两类结果：
   - 可提交路径（阻塞根因与修复动作）
   - 代码审查结论（按严重级别）

## 执行步骤
1. 基线检查（仓库与暂存）
   - `git rev-parse --show-toplevel`
   - `git status --short --branch`
   - 若提示 `no changes added to commit`，先明确“未暂存”问题，不误判为 hook 失败。
2. 复现提交链路
   - 读取 `.husky/pre-commit` 和 `package.json` 中 `lint-staged` 规则。
   - 分别执行 hook 子命令（如 `type-check`、`lint-staged`），不要一次性猜测。
   - 若报错来自样式文件，优先单独执行 `stylelint` 复现到具体文件与行号。
3. 根因分层
   - 代码层：TS/Lint/Style 规则报错。
   - 流程层：暂存区为空、文件未加入提交。
   - 环境层：`lint-staged` 启动即失败，`spawn ... EPERM/ENOENT` 等。
4. Stylelint 专项（命中样式规则时必做）
   - 先用单文件命令复现：`pnpm exec stylelint --fix --allow-empty-input <file>`
   - 若命中 `no-invalid-position-declaration`：
     - 优先检查模板中的内联 `style="..."` 是否被 stylelint 误判或违反约束。
     - 将内联样式迁移为 class，并在 `<style scoped>` 中声明。
   - 修复后再次执行单文件 stylelint，再回到 `pnpm exec lint-staged` 做全链路验证。
5. 审查并行输出
   - 对改动文件做审查，按 `High/Medium/Low` 输出，带文件与行号。
   - Findings 必须先于总结，优先行为回归、逻辑错误、安全风险、遗漏测试。
6. 给出可执行收敛动作
   - 若代码层失败：修代码并复跑命令。
   - 若环境层失败：给出 `hook doctor` 诊断命令与放行项（node/git/pnpm/shell）。
   - 明确“通过标准”：`type-check` + `lint-staged` + `git commit` 成功。

## 快速判定表
1. 现象：`no changes added to commit`
   - 结论：暂存区问题
   - 动作：`git add` 后重试
2. 现象：`type-check` 失败
   - 结论：代码问题
   - 动作：修复 TS 报错
3. 现象：`lint-staged --debug` 早退且无 lint 输出
   - 结论：优先怀疑环境层
   - 动作：检查 Node 子进程与 `git/pnpm` 可执行性
4. 现象：`stylelint` 报具体文件与行号（如 `no-invalid-position-declaration`）
   - 结论：代码层（样式规范）问题
   - 动作：优先处理该文件；内联样式迁移为 class + `<style scoped>` 规则
5. 现象：`spawnSync ... EPERM/ENOENT`
   - 结论：系统策略/路径解析问题
   - 动作：修复白名单、PATH 或 shell 调用方式

## 输出模板
1. 阻塞定位
   - 根因层级：`代码层/流程层/环境层`
   - 证据命令：`<命令>` + `<关键输出>`
   - 若为样式问题：补充 `stylelint` 的文件路径、规则名、行号
2. 审查发现（按严重度）
   - `High`：`<问题>` `[文件:行号]`
   - `Medium`：`<问题>` `[文件:行号]`
   - `Low`：`<问题>` `[文件:行号]`
3. 通过路径
   - `1)` `<修复动作>`
   - `2)` `<验证命令>`
   - `3)` `<提交命令>`

## 常见误区
1. 把“未暂存”误判为 lint 失败。
2. 未拆分 hook 子命令，直接归因“lint-staged 有 bug”。
3. 只给审查意见，不给可提交路径。
4. 在“必须过审核”约束下建议 `--no-verify`。
