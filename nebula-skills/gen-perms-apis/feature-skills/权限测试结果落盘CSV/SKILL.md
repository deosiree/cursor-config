---
name: 权限测试结果落盘CSV
description: 将 OpenCLI E2E 验证结果映射为 CSV 字段格式，委托外部 skill「输出csv的测试用例」生成最终 CSV 文件。本 skill 是薄包装，不重复实现 CSV 生成逻辑。
---

# 权限测试结果落盘CSV

## RED

- 没有本 skill 时，验证结果只留在对话日志中，无法导入测试系统或做回归对比
- 常见失败：
  - CSV 字段映射错误（预期结果列写到了备注列）
  - 忘记引用外部 skill 的字段规范，自造 CSV 格式不兼容
  - 落盘路径不规范，后续找不到

## 设计原则

> **本 skill 是薄包装。** 不自己实现 CSV 生成，只做 E2E 结果 → cases.json 的字段映射，然后委托外部 skill 生成 CSV。外部 skill 优化后，本 skill 自动受益。

## 输入

- `verificationResults`：必填（来自 `OpenCLI双会话权限验证` 的输出）
- `CSV 输出路径`：必填（如 `docs/问题单/0605/perm-e2e.csv`）
- `模块名`：默认 `权限管理`
- `子系统`：默认 `8`
- `创建人员`：必填

## GREEN

### 1. 映射 E2E 结果 → cases.json 字段

将每条验证结果映射为 `输出csv的测试用例` 所需的 cases 字段：

| E2E 结果字段 | cases.json 字段 | 转换规则 |
|-------------|----------------|---------|
| `perm` | 隐含在名称中 | `名称` = `权限E2E验证 — {perm} — {status}` |
| `status` | 决定预期结果格式 | pass → `正向：{actual}`；fail → `正向：期望通过但实际 {actual}` |
| `actual` | `预期结果` | 直接映射，保留 OpenCLI 返回值/行为描述 |
| `round` | `备注` | `第 {round} 轮 — 配置: {granted} / {revoked}` |

### 2. 组装 cases 数组

```json
[
  {
    "name": "权限E2E验证 — sys:dashboard:view — pass",
    "precondition": "admin 已为"权限测试角色"勾选 sys:dashboard:view；test 用户 13813815913 已重新登录",
    "steps": "1. 用 13813815913 登录系统\n2. 访问 /cloud/Apex/dashboard\n3. 检查页面渲染和 API 调用",
    "expected": "正向：首页正常渲染，loadDashboardData 返回 200",
    "remark": "第 1 轮 — 配置: [sys:dashboard:view] / []"
  }
]
```

### 3. 委托外部 skill 生成 CSV

将组装好的 cases.json 传入外部 skill：

```text
使用 $输出csv的测试用例
模块名：权限管理，子系统：8，创建人员：惠岩
cases 如下：[上一步的 cases 数组]
输出到 {CSV 输出路径}
```

> 外部 skill 路径：`F:\Documents\Repertory\Sieyuan\nebula\.cursor\test-skills\输出csv的测试用例`

### 4. 验证 CSV

- 表头 36 列对齐测试系统导入规范
- 每条 E2E 结果对应一行
- `预期结果` 不含模糊词（"功能正常"等）
- `前置条件` 包含角色配置信息

## 输出

- `csvPath`：落盘的 CSV 文件路径
- `caseCount`：落盘用例数
- `externalSkillUsed`：`输出csv的测试用例`

## REFACTOR

- 若 CSV 字段映射出错（预期结果写到备注），收紧映射表校验
- 若外部 skill 路径变更，更新本 skill 中的引用路径
- 若前置条件缺少本轮配置信息，补「前置条件必须包含 admin 配置了什么」
- 若委托外部 skill 失败但未报错，补「外部 skill 调用后必须验证 CSV 文件已生成」

## 使用示例

```text
把本轮 E2E 验证结果落盘到 docs/问题单/0605/perm-e2e.csv，
模块名权限管理，创建人员惠岩。
```
