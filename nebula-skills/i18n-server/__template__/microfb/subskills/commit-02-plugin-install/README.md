# commit-02-plugin-install

## 来源提交

- 提交哈希：`aca321dcfbd75c0368481c4dbd4a46d88ddbf07b`
- 短哈希：`aca321d`
- 主题：i18n 实例初始化：安装插件

## 背景

安装新 i18n runtime 所需依赖，并锁定新方案的版本基线。

## 触发条件

- 已经有可运行的退化分支
- 允许升级 `vue-i18n` 主版本
- 需要对齐新 runtime 的依赖约束

## 改动范围

- 升级 `vue-i18n` 到 11.x
- 新增 `vue-i18n-kit-sy`
- 确认 package 管理器锁文件已更新

## 核心文件

- `package.json`
- `pnpm-lock.yaml`

## 完成后的中间态

仓库依赖层已经具备新 i18n runtime 的安装条件，但业务代码尚未接线。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-03-runtime-bootstrap`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
