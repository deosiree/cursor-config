# hytests vs tests 职责边界

## 对比

| 维度 | `hytests/` | `tests/` |
|------|------------|----------|
| 目的 | CSV 自测单 ID 对齐 + 手册 | 官方 API 回归套件 |
| 读者 | 测试人员 / 内测 | 开发 CI |
| CSV 映射 | `@pytest.mark.csv_case` | 无 |
| 注册表 | `cases_registry.yaml` | 无 |
| 文档 | `README.md`（gen_readme 生成） | `tests/README.md`（手工维护） |
| 规模 | 450+ CSV 条，逐步覆盖 | 300+ 结构化测试 |
| 参考关系 | `refs` 指向 tests | 被 hytests 引用 |

## 何时写 hytests

- 用户 / CSV 用例 ID 必须可追溯
- 需要自测手册（步骤 + 自动化位置 + curl）
- 内测批次 MVP（如 9909–9913）

## 何时写 tests（或只写 refs）

- 无 CSV ID 的通用回归
- CI 门禁、模块完整 CRUD 覆盖
- hytests MVP 验证通过后，可提炼到 tests（可选，非本 skill 必须）

## 代码风格

两者均为 **pytest + requests HTTP 黑盒**，共享：

- Gateway 环境变量
- `assert_success` / `unwrap_response`
- 测试数据唯一前缀 / teardown

差异：

- hytests 必须有 **csv_case marker**
- hytests 可 `pytest.skip` + `blocked`（会话 SDK）
- hytests 文件命名 `test_csv_*` / `test_mvp_*`，不必 `test_NN_*` 编号

## 环境

| 变量 | 说明 |
|------|------|
| `SECCENTER_TEST_BASE_URL` | API Gateway（如 `:8000`） |
| `SECCENTER_TEST_ADMIN_EMAIL` | 登录邮箱 |
| `SECCENTER_TEST_ADMIN_PASSWORD` | 登录密码 |
| `SECCENTER_TEST_PROJECT_A/B` | 菜单隔离项目 ID |
| `SECCENTER_TEST_ROUTE_PREFIX` | nginx 代理前缀（可选） |

hytests：`hytests/.env.local`  
tests：`tests/config.py` 或环境变量

## 误路由

| 用户说 | 应路由 |
|--------|--------|
| 写 test_04_menu.py 官方测试 | [[../../写pytest集成测试/SKILL.md]] |
| 导出 UI 用例 CSV | [[../../输出csv的测试用例/SKILL.md]] |
| CSV 155 写 hytests + README | **本 skill** |

## 仓库布局（seccenter）

```
seccenter/
├── hytests/          ← 本 skill 主战场
│   ├── test_*.py
│   ├── cases_registry.yaml
│   ├── README.md
│   └── scripts/
├── tests/            ← 官方套件 + refs 来源
│   └── test_*.py
└── docs/自测单/      ← CSV 输入
```
