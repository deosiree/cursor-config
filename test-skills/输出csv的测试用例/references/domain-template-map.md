# 领域 ↔ 模板 CSV 映射表

## 映射关系

| domain 参数 | 模板文件（`docs/问题单/模板/`） | 典型模块名 |
|-------------|--------------------------------|------------|
| `role` | `role.csv` | 角色管理界面（子系统 `17`，v2） |
| `menu` | `menu.csv` | 菜单管理 |
| `tenant` | `tenant.csv` | 租户管理界面（v2；v1 历史行可能为「租户管理」） |
| `dashboard` | `dashboard.csv` | 管理中心首页界面（子系统 `17`，v2） |
| `user` | `user.csv` | 用户管理界面（子系统 `17`，v2） |
| `securityConfig` | `securityConfig.csv` | 安全配置界面（子系统 `17`，v2） |
| `e2e` | `e2e.csv` | 端到端测试 |
| `login` | `login.csv` | 登录登出 |
| `required` | `必填字段.csv` | 必填字段 |

## 使用规则

1. **无匹配模板** → 脚本 `exit ≠ 0`，Agent **必须**列出 `docs/问题单/模板/` 下现有文件并请用户指定 `domain` 或新建模板（**不猜测文件名**）。
2. **fieldDefaults**（标签、执行方式、子系统、创建人员等）从模板 CSV **首条数据行众数** 推断（复用 `csv_to_test_config.py` 逻辑）。
3. **模块名**可由映射表或用户口述覆盖，不以模板文件名推断。v2 重组时优先读模板首行模块名（如 `租户管理界面`）。
4. **子系统** v2 路径必须从模板首行读取，勿沿用旧 `testcases_export` 中的值（如 tenant 为 `17` 而非 `8`）。

## 默认路径

| 参数 | 默认值 |
|------|--------|
| `templateDir` | `docs/问题单/模板` |
| `outputDir` | `docs/问题单/{date}`（date = 当天 MMDD） |
| `date` 覆盖 | `--date 0601` 或 Agent 对话中指定 |
