---
name: 盘点-页面权限空态反模式
description: 只读扫描业务页是否存在「暂无数据冒充无权限」等反模式。触发词：扫描空态反模式、暂无数据无权限、PageNoPermission 反模式盘点。
---

# 盘点-页面权限空态反模式

## RED

- 没有本 skill 时，agent 凭印象改码，漏掉仍用 `fetchData` 清空列表的页面
- 常见失败：
  - 只 grep `el-empty`，漏掉默认表格空态（AP-01）
  - 把已有 `PageNoPermission` 的页面标为反模式
  - 扫描 opsdeck 等非 `targetRepo`

## 输入契约

| 参数 | 必填 | 默认 |
|------|------|------|
| `targetRepo` | 否 | `apex_dev` |
| `关注路由` | 否 | 全量 views |

## GREEN — 扫描步骤

### Step 1：grep 扫描信号

```bash
rg "pageData\.value = \[\]" src/views
rg "暂无页面访问权限|暂无权限查看" src/views
rg "PageNoPermission" src/views
rg "-no-perm" src
```

### Step 2：按 AP 表归类

| ID | 信号 | 修复方向 |
|----|------|----------|
| AP-01 | `!canGate` 清空数据 + 仍渲染 `el-table` | 兄弟分支 `PageNoPermission` |
| AP-02 | 裸 `el-empty` 无组件 | 改用 `PageNoPermission` |
| AP-03 | 空态嵌在列表 `el-card` 内 | 兄弟分支 |
| AP-04 | 页面级 `.xxx-no-perm` scss | 删样式，用组件 |

### Step 3：输出表格

```markdown
| 路由 | 文件 | antiPattern | pageGatePermCandidate | recommendedFix |
```

已接入 `PageNoPermission` → 标 `ok`，不列反模式。

### Step 4：链到下游

有反模式 → `[[../编排-页面无权限空态落地]]` 或 `[[../../intention-skills/策略-页面权限空态]]`

## 失败分支与兜底

| 触发条件 | 一线修复 | 兜底 |
|----------|----------|------|
| grep 无结果但用户截图显示暂无数据 | 查 `fetchData` 守卫 + 默认 el-table empty | 对照 before-02 |
| 扫描非 targetRepo | 停止，确认仓库 | 默认仅 apex_dev |
| 只列路由无文件路径 | 补 `文件:行号` | REFACTOR 强制 |

## 反例黑名单

- ❌ 未读文件就标「已修复」
- ❌ 把 reference-02 设备数据标为待改（除非用户明确）
- ❌ 扫描结果无 `recommendedFix`

## 参考

- `[[../../references/page-no-permission-anti-patterns.md]]`
- `[[../../template/sample-run/before-02-页面空态/]]`
- `[[assets/few-shot-scan-tenant-dashboard.md]]`

## REFACTOR

- 结果必须含文件路径与行级特征

## 使用示例

```text
扫描 apex_dev 哪些页还在用暂无数据冒充无权限。
```
