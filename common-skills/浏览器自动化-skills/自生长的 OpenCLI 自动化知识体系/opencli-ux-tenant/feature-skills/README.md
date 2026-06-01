# 功能层 — 具体执行

## 定位

功能层负责实际的测试执行、清理和诊断操作。

## 子节点

| 节点 | 职责 | 调用脚本 |
|------|------|---------|
| `执行全流程/` | 步骤 1-10 完整 CRUD 流程 | `run-e2e.sh` / `tenant-create-delete.sh` |
| `执行搜索删除/` | 步骤 7-10 仅删除验证 | `tenant-search-delete.sh` |
| `诊断与清理/` | 失败分析 + 弹窗/搜索框清理 | `scripts/cleanup.sh` + 手动诊断 |

## 边界

- 不判断跑哪个 profile（交给 intention-skills）
- 不输出模板（交给 template/）
