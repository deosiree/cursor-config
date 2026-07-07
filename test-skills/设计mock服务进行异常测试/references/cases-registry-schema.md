# cases_registry.yaml 字段契约（前端异常 mock）

路径：`{hytestsDir}/cases_registry.yaml`（gitignored）

## 顶层

```yaml
# CSV 自测用例 → 异常 mock 映射（手工）
# 完整自测流程：hytests/docs/workflow.md
# 测试方式：方案 A — 8081 直连 + Console 注入权限

cases:
  - case_id: "3545"
    # ...
```

## 单条用例字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `case_id` | 是 | CSV 用例编号 |
| `name` | 是 | 用例名称 |
| `module` | 否 | 功能模块 |
| `status` | 是 | `manual` / `blocked` / `verified` |
| `test_mode` | 是 | 固定 `8081-direct-inject-perm` |
| `base_url` | 是 | 如 `http://localhost:8081` |
| `route` | 是 | 如 `/cloud/Apex/system/user` |
| `scenario_active` | 是 | 对应 `error-scenario.json` 的 `active` |
| `mock_endpoint` | 是 | 如 `POST forward/seccenter/v2/user/list` |
| `mock_error_code` | 否 | 如 `40001` |
| `mock_readme` | 是 | `mock/README.md`（瘦索引） |
| `workflow_doc` | 是 | `docs/workflow.md` |
| `automation_doc` | 是 | `docs/automation/{case_id}.md` |
| `perm_status` | 否 | `ok` / `pending_human` |
| `required_perms` | 否 | 权限码列表 |
| `note` | 否 | 阻塞原因等 |

## 示例

```yaml
  - case_id: "3545"
    name: 列表接口失败时页面不白屏
    module: 用户管理界面
    status: manual
    test_mode: "8081-direct-inject-perm"
    base_url: "http://localhost:8081"
    route: /cloud/Apex/system/user
    scenario_active: "3545"
    mock_endpoint: "POST forward/seccenter/v2/user/list"
    mock_error_code: 40001
    mock_readme: mock/README.md
    workflow_doc: docs/workflow.md
    automation_doc: docs/automation/3545.md
    perm_status: ok
    required_perms: ["sys:user:query"]
```
