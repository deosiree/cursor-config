# 写 pytest 集成测试

← [[SKILL.md]] · 并列 skill：[[../输出csv的测试用例/SKILL.md]] · [[../基于测试用例写后端的pytest自动化测试/SKILL.md]]

为 nebula 后端撰写 **pytest + requests HTTP 黑盒集成测试**，黄金样本：`F:\Documents\Repertory\Sieyuan\nebula\seccenter\tests`。

---

## 自然语言怎么用（必读）

复制以下模板，缺项 Agent 会追问：

```text
使用 $写pytest集成测试：
- targetRepo: nebula/seccenter
- baseUrl: http://127.0.0.1:8000
- moduleName: tenant
- scenarioType: CRUD
- fileStrategy: append_to_existing
- 需求: 在 test_03_tenant.py 增加租户暂停后 VerifySession 应失败的用例
```

### 字段对照

| 字段 | 含义 | 示例 |
|------|------|------|
| `targetRepo` | 仓库 | `nebula/seccenter` |
| `baseUrl` | Gateway | `http://127.0.0.1:8000` |
| `moduleName` | 模块 | `tenant`、`user`、`api_permission` |
| `scenarioType` | `CRUD` / `isolation` / `permission` / `e2e_flow` | `CRUD` |
| `fileStrategy` | `new_numbered_file` / `append_to_existing` | `append_to_existing` |

---

## 前置环境

1. 启动目标服务 + Gateway（seccenter 默认 Gateway `8000`、服务 `2000`）
2. 数据库已执行 `schema.sql` + `data.sql`（系统管理员 `admin@system.local`）
3. `cd tests && pip install -r requirements.txt`
4. 可选环境变量：`SECCENTER_TEST_BASE_URL`、`SECCENTER_TEST_ADMIN_EMAIL`、`SECCENTER_TEST_ADMIN_PASSWORD`

详见 [[references/env-prerequisites.md]]。

---

## 目录结构（本 skill）

```
写pytest集成测试/
├── SKILL.md
├── intention-skills/     # 何时新建文件 / 补用例 / 迁 Swagger
├── feature-skills/       # 怎么写 conftest、CRUD、隔离、E2E
├── references/           # 类型判定、注释规范、布局决策
├── assets/few-shot-example/
├── template/新模块骨架/
└── evals/
```

---

## 使用示例

### 新建模块测试文件

```text
为 seccenter 新增 API 白名单模块，创建 test_18_api_whitelist.py，含 TestApiWhitelistCRUD 与策略型文件头。
```

### 补场景到已有文件

```text
在 test_07_user.py 的 TestUserLocking 类中增加「锁定用户无法登录」反向用例。
```

### 从 Swagger 迁接口

```text
根据 seccenter.swagger.json 的 /tenant/suspend 接口，生成集成测试骨架（创建租户 → suspend → verify session 失败 → 清理）。
```

---

## 与「输出 CSV 测试用例」的区别

| | 本 skill | 输出csv的测试用例 |
|---|---------|------------------|
| 产物 | `.py` pytest | `.csv` 测试系统导入 |
| 执行 | `pytest` 自动化 | 人工按步骤执行 |
| 环境 | 真实 Gateway + DB | 无运行时依赖 |
