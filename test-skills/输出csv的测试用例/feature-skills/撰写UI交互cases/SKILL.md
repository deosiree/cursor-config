---
name: 撰写UI交互cases
description: 将开发过程中的 UI 交互结论转为 cases.json 字段。支持 v1（功能集合留空）与 v2（featureSet + expected 合并进测试步骤）。不写脚本、不选路径。
---

# 撰写 UI 交互 cases

## Task

把开发中验收的 UI 交互行为转换为 `cases.json` 中的字段。**不执行脚本、不选择输出路径**。

## Input

- 开发结论描述（自然语言或上轮会话输出）
- 模块名、领域名（用于参考 `domain-template-map.md`）

## Output

### v1（追加到领域 CSV，功能集合留空）

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

### v2（功能集合重组，`generate_feature_csv.py`）

骨架见 `[[../../template/tenant-feature-set/ui-case-v2-skeleton.json]]`。

额外字段：`featureSet`（必填）、`direction`（推荐，推导用例类型）、`level`、`purpose`、`remark`、`env`、`reserve1`（`ui`）、`sortOrder`。

- cases.json 分别写 `steps` 与 `expected`（**expected 必填**）
- CSV 导出时脚本合并为「测试步骤」列（见 [`csv-export-format-rules.md`](../../references/csv-export-format-rules.md)），**「用例结果」列留空**

## Boundary

### v1

- **不加** `remark` 字段
- 不写 `功能集合`、`用例ID`

### v2

- **必须**写 `featureSet` 与 `expected`（cases.json 层）
- CSV「用例结果」**留空**；expected 合并进「测试步骤」（见 csv-export-format-rules）
- `remark` / `purpose` 允许（源码溯源、迁移备注）
- 名称不加 `[正向]` / `[反向]` 前缀；方向写入 `direction` 字段
- **用例类型**：按 `direction` 推导（`正向/逆向→0`、`边界→3`、`异常→1`）；`featureSet=异常处理` 时视为异常测试；详见 `[[../../references/case-type-map.md]]`

### 通用

- **不加** `developResult` 在此层
- 预期使用编号列表，非 `正向：` / `反向：` 格式

## 撰写规则

严格按 `[[../../references/ui-interaction-test-case-rules.md]]`：

- 一条用例一个验证点
- 前置条件写登录/环境/路径，不写进步骤
- 步骤以动词开头，≤ 7 步
- 预期用界面语言（Tab 名、toast、红字）

## Example（v1）

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

## Example（v2）

```text
输入：「创建租户接口返回业务错误时，应 toast 具体错误并回到向导第一步」
输出：
{
  "cases": [{
    "name": "mock创建租户业务错误时展示有效错误提示并回退第一步",
    "featureSet": "异常处理",
    "direction": "异常",
    "precondition": "1. 用户具备 sys:tenant:add 2. 已 mock 创建接口返回业务错误",
    "steps": "1. 点击「新增」完成向导填写\n2. 第三步点击「确定」\n3. 观察错误提示与弹窗状态",
    "expected": "1. 右下角错误通知展示具体业务错误，非「服务不可用」\n2. 弹窗不关闭，回到第一步\n3. 列表未新增租户",
    "reserve1": "ui"
  }]
}
```

完整样本：`[[../../assets/few-shot-example/tenant-feature-set-reorg.md]]`
