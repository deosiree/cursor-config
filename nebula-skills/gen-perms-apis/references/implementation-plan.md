# 梳理权限点与 APIs Skill 实施方案

## Summary
将 skill 套件落到 `F:\Documents\Repertory\Sieyuan\nebula\.cursor\nebula-skills\gen-perms-apis`，输入仓库路径后输出单份 `路由-组件-权限点-API 源码梳理.md`。

## 关键约束
- 使用 `$写skill` 的完整套件结构
- 业务文档收敛为单文件输出
- 原“未命中”文档内容并入每个路由下的 `非权限控制但真实调用 API`
- 模板不能直接拷贝 `apex_dev` 现有文档

## 输入契约
- `仓库路径`
- `输出目录`
- `输出文件名`
- `api契约`
- `补充契约路径`
- `关注模块 / focus_modules`：可选，默认全量
- `关注路由 / focus_routes`：可选，默认全量
- `非关注路由处理策略`：仅在关注模块或关注路由非空时启用
- `约束与边界文件`
- `路由入口`
- `视图根目录`
- `组件根目录`
- `网关根目录`
- `原始 API 根目录`

## 强制试跑
样本仓库固定为：

- `F:\Documents\Repertory\Sieyuan\nebula\apex_dev`

样本试跑结果应落到 `template/sample-run/`，并把调优结论回写到 `[[references/template-tuning-notes.md]]`。

## 后续回归补充

API 反查能力已补充为三类硬链路：

- `业务层 -> gateway -> api -> 契约`
- `业务层 -> api -> 契约`
- `子组件 emit/prop/v-model -> 父组件/组合式函数 -> gateway/api -> 契约`

对应规则见 `[[api-backtrace-rules.md]]`，回归样例见 `[[../assets/few-shot-example/api-backtrace-regression.md]]` 与 `[[../template/sample-run/apex_dev-api-backtrace-focus-iteration.md]]`。
