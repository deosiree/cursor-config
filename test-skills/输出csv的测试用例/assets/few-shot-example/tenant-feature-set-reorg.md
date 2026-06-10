# Few-shot：租户管理功能集合重组（0610）

真实会话沉淀：从 `testcases_export.csv` 迁移 5 条旧用例，对照源码扩展为 46 条 v2 CSV。

## 触发话术

```text
从 testcases_export 筛选创建人员=惠岩、功能集合=租户管理的用例，
按 alarm_.csv 风格重组到 tenant.csv，模块名租户管理界面，子系统从模板取，
对照 apex_dev 租户页面源码补充用例，输出 docs/问题单/0610/tenant.csv。
```

## 迁移映射（旧 5 条）

| 原 ID | 原名称 | 新功能集合 | 新条数 |
|-------|--------|------------|--------|
| 425 | 操作列-更多组件 | 界面布局 | 3 |
| 426 | 管理项目-必选项目 | 弹窗交互 | 2 |
| 427 | 删除租户 | 删除操作 | 4 |
| 428 | gateway的错误信息 | 异常处理 | 1（重写） |
| 438 | 表单校验约束 | 表单校验 | 5 |

## cases.json 样例 1 — 页面加载

```json
{
  "name": "租户列表页面初始加载展示工具栏表格与分页",
  "featureSet": "页面加载",
  "direction": "正向",
  "level": 0,
  "purpose": "index.vue onMounted / fetchData",
  "remark": "1. 页面标题为「租户列表」…",
  "precondition": "1. 用户已登录 Apex 2. 当前账号具备 sys:tenant:query 权限…",
  "steps": "1. 进入「安全管理」>「租户管理」（路由 /Apex/tenant）\n2. 观察页面工具栏、表格与底部分页区域\n3. 确认 loading 结束后表格有数据或空态",
  "env": "测试环境；路由 /Apex/tenant",
  "reserve1": "ui",
  "sortOrder": 1,
  "expected": "1. 页面标题为「租户列表」\n2. 工具栏展示关键字搜索、搜索、新增、删除、列设置等区域\n3. 表格与底部分页组件正常渲染，loading 结束后有数据或空态"
}
```

## cases.json 样例 2 — 异常处理（原 428 重写）

旧 428 为 gateway POST 步骤；新用例验证 **用户可见错误通知 + 弹窗回退**，功能集合 `异常处理`（非接口联调）。

```json
{
  "name": "mock创建租户业务错误时展示有效错误提示并回退第一步",
  "featureSet": "异常处理",
  "direction": "异常",
  "level": 1,
  "purpose": "index.vue handleCreateNextOrSubmit / handleGatewayError handleApiError",
  "remark": "迁移自原用例 428；mock 创建接口返回 business 错误",
  "precondition": "1. 用户具备 sys:tenant:add 2. 已通过 mock 使租户创建接口返回业务错误（含明确 message）",
  "steps": "1. 点击「新增」，按向导填写完整租户与所有者信息\n2. 在第三步点击「确定」提交\n3. 观察页面错误提示与弹窗状态",
  "expected": "1. 页面右下角弹出一次错误通知，文案为后端返回的具体业务错误（如 [code]租户名已存在），而非「服务不可用」\n2. 创建弹窗不关闭，自动回到第一步「基本信息」\n3. 第一步步骤节点呈 invalid 状态\n4. 列表未出现新创建的租户",
  "env": "测试环境；路由 /Apex/tenant；mock 创建接口返回业务错误",
  "reserve1": "ui",
  "sortOrder": 4
}
```

## fieldDefaults（tenant 0610）

```json
{
  "创建人员": "惠岩",
  "子系统": "17",
  "模块名": "租户管理界面"
}
```

> 子系统 `17` 来自 `docs/问题单/模板/tenant.csv`，**不是**旧 export 中的 `8`。

## 用例类型（0610 起）

| direction / featureSet | CSV 用例类型 | 显示 |
|------------------------|--------------|------|
| 正向、逆向（默认） | 0 | 功能测试 |
| 异常 / 异常处理 | 1 | 异常测试 |
| 边界 | 3 | 边界测试 |

完整规则：`references/case-type-map.md` · 真源：`docs/问题单/模板/types.csv`

## 功能集合分布（46 条）

| 功能集合 | 条数 | 备注 |
|----------|------|------|
| 页面权限 | 8 | 模板已有 |
| 表格展示 | 6 | 模板已有 |
| 弹窗交互 | 6 | **需测试工具手动添加** |
| 表单校验 | 5 | **需测试工具手动添加** |
| 筛选查询 | 4 | 模板已有 |
| 界面布局 | 4 | 模板已有 |
| 删除操作 | 4 | **需测试工具手动添加** |
| 分页 | 3 | 模板已有 |
| 异常处理 | 4 | 模板已有 |
| 页面加载 | 2 | 模板已有 |

## 复跑命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/tenant.cases.json \
  --template ../../../docs/问题单/模板/tenant.csv \
  --output ../../../docs/问题单/0610/tenant.csv \
  --force
```

## 关联文件

- 完整 cases：`configs/tenant.cases.json`
- 质量报告：`evals/tenant-reorg-0610.md`
- 格式说明：`references/csv-format-v2-feature-set.md`
- 用例类型：`references/case-type-map.md`
- 意图 skill：`intention-skills/legacy-export迁移重组/SKILL.md`
