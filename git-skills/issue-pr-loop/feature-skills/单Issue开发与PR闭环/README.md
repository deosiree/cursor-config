# 单 Issue 开发与 PR 闭环

负责一个已解锁 Issue 的本地计划、实现、验证、PR 准备及人工审查反馈修复。

## 适用场景

- 依据 Goal 和依赖图逐项开发。
- 为当前 Issue 补 `develop.md` 后实现。
- 处理同一个 PR 的审查意见并重新验证。

## 与相邻节点边界

- [[../../intention-skills/项目规划与Issue图谱/SKILL.md]] 负责目标和多 Issue 依赖设计。
- 本节点只做一个 Issue，不重写整份项目计划。
- [[../项目验收与文档收敛/SKILL.md]] 负责全量合并后的项目终验。
- 具体 worktree 操作可路由到仓库已安装的 `创建沙盒分支` skill。

## 资源

- develop 模板：[[../../template/mvp/issues/issue-id/develop.md]]
- 阶段清单：[[../../assets/阶段交接检查清单.md]]
- 完整示例：[[../../template/snapshot/issues/I-01/develop.md]]

## 使用示例

```text
开始 GitHub #57：先读 Goal、依赖图和对应 develop.md，按节点实现、运行验收并准备 PR；人审和合并留给我。
```
