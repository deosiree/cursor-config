---
name: 撰写UI交互cases
description: 将开发过程中的 UI 交互结论转为 cases.json 字段（名称/前置条件/步骤/预期）。不写脚本、不选路径。
---

# 撰写 UI 交互 cases

## Task

把开发中验收的 UI 交互行为转换为 `cases.json` 中的字段。**不执行脚本、不选择输出路径**。

## Input

- 开发结论描述（自然语言或上轮会话输出）
- 模块名、领域名（用于参考 `domain-template-map.md`）

## Output

`cases.json` 片段：

```json
{
  "moduleId": "role-ui-tab",
  "cases": [
    {
      "name": "{页面}-{场景}-{期望摘要}",
      "precondition": "用户已登录；已进入「菜单路径」页面；环境说明",
      "steps": "1. 第一步\n2. 第二步",
      "expected": "1. 界面预期一\n2. 界面预期二"
    }
  ]
}
```

## Boundary

- **不加** `remark` 字段（UI 用例无 test.ts 溯源）
- **不加** `developResult` 在此层；脚本层默认 = 预期结果
- 名称不加 `[正向]` / `[反向]` 前缀
- 预期结果使用编号列表，非 `正向：` / `反向：` 格式
- 不写 `功能集合`、`用例ID`

## 撰写规则

严格按 `[[../../references/ui-interaction-test-case-rules.md]]`：

- 一条用例一个验证点
- 前置条件写登录/环境/路径，不写进步骤
- 步骤以动词开头，≤ 7 步
- 预期用界面语言（Tab 名、toast、红字）

## Example

```text
输入：「新增角色弹窗，切到关联设备 Tab 后点确定，空角色名应跳回基础信息并提示」
输出：
{
  "cases": [{
    "name": "新增角色-关联设备Tab提交空角色名-应跳回基础信息并提示",
    "precondition": "用户已登录；已进入「安全管理 > 角色管理」页面；microfb与apex_dev子应用可用",
    "steps": "1. 点击「新增角色」打开弹窗\n2. 不填写「角色名称」\n3. 切换到「关联设备」Tab\n4. 点击弹窗底部「确定」",
    "expected": "1. 当前 Tab 自动切回「基础信息」\n2. 「角色名称」标签前显示必填标识（*）\n3. 「角色名称」下方显示错误提示「角色名称不能为空」\n4. 弹窗不关闭，未创建新角色"
  }]
}
```
