# 菜单管理 + 登录界面 v2 用例 — 0615 交付记录

> **历史报告（0615 导入前格式）**：质检表「用例结果必填」指当时 CSV 列。当前以 [`references/csv-export-format-rules.md`](../references/csv-export-format-rules.md) 为准。

## 交付物

| 文件 | 条数 | 说明 |
|------|------|------|
| `docs/问题单/0615/menu.csv` | 97 | 菜单管理界面，UTF-8 |
| `docs/问题单/0615/login.csv` | 39 | 登录界面，UTF-8 |
| `configs/menu.cases.json` | 97 | 单一真相源 |
| `configs/login.cases.json` | 39 | 单一真相源 |
| `configs/menu.config.json` | — | regenerate 配置 |
| `configs/login.config.json` | — | regenerate 配置 |

## 固定字段

| 字段 | menu | login |
|------|------|-------|
| 子系统 | 17 | 17 |
| 模块名 | 菜单管理界面 | 登录界面 |
| 创建人员 | 惠岩 | 惠岩 |

## menu 功能集合分布（97 条）

| 功能集合 | 条数 |
|----------|------|
| 页面加载 | 4 |
| 页面权限 | 8 |
| 筛选查询 | 4 |
| 界面布局 | 6 |
| 表格展示 | 3 |
| 侧栏同步 | 4 |
| 基座侧栏 | 6 |
| 基座菜单同步 | 4 |
| 弹窗交互 | 16 |
| 表单校验 | 10 |
| 删除操作 | 4 |
| 排序默认值 | 4 |
| 级联状态 | 4 |
| API白名单 | 8 |
| 导入导出 | 4 |
| 国际化 | 3 |
| 异常处理 | 5 |

## login 功能集合分布（39 条）

| 功能集合 | 条数 |
|----------|------|
| 页面加载 | 3 |
| 密码登录 | 4 |
| 验证码登录 | 4 |
| 表单校验 | 4 |
| 图形验证码 | 5 |
| MFA二次验证 | 4 |
| 忘记密码 | 3 |
| 账号激活 | 2 |
| 登录后跳转 | 2 |
| 路由守卫 | 1 |
| 会话过期 | 1 |
| 退出登录 | 2 |
| 语言切换 | 2 |
| 异常处理 | 2 |

## 质量自检（ui-v2）

| 检查项 | menu | login |
|--------|------|-------|
| 用例结果必填 | 97/97 | 39/39 |
| 功能集合必填 | 97/97 | 39/39 |
| 用例ID 留空 | 通过 | 通过 |
| 无 F12/mock 步骤 | 通过 | 通过 |
| 步骤 ≤ 7 | 通过（perm 已简化为 4 步） | 通过 |

## 复跑命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/bootstrap_menu_login_v2_cases.py
python scripts/generate_feature_csv.py \
  --cases configs/menu.cases.json \
  --template ../../../docs/问题单/模板/menu.csv \
  --output ../../../docs/问题单/0615/menu.csv \
  --force
python scripts/generate_feature_csv.py \
  --cases configs/login.cases.json \
  --template ../../../docs/问题单/模板/login.csv \
  --output ../../../docs/问题单/0615/login.csv \
  --force
```

## Darwin 拓展发现（缺口）

| 缺口 | 建议 |
|------|------|
| OpenCLI 登录页冒烟 | 新增 `run-login-smoke.node.js` 对标 menu-index-smoke |
| perm-e2e 8 场景自动化 | 已有 gen-perms-apis，与 CSV S1–S8 对齐 |
| 测试工具功能集合 | 导入前确认「基座侧栏」「MFA二次验证」等已建 |
| gateway 层 36 条 | 仍用 `0529/menu-unit-gateway.csv`，不并入 v2 UI |
