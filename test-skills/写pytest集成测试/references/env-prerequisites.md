# 环境前置条件

## seccenter 默认栈

| 组件 | 默认 | 环境变量覆盖 |
|------|------|-------------|
| Gateway | `http://127.0.0.1:8000` | `SECCENTER_TEST_BASE_URL` |
| seccenter 服务 | 端口 2000 | — |
| 管理员邮箱 | `admin@system.local` | `SECCENTER_TEST_ADMIN_EMAIL` |
| 管理员密码 | `123456` | `SECCENTER_TEST_ADMIN_PASSWORD` |

## 启动检查清单

- [ ] Gateway 可访问
- [ ] 目标后端服务已注册到 Gateway
- [ ] MySQL 已执行 `schema.sql` + `data.sql`
- [ ] `tests/requirements.txt` 已安装（`pytest`、`requests` 等）

## 运行命令

```bash
cd tests
pytest                          # 全量
pytest test_03_tenant.py -v     # 单模块
pytest test_03_tenant.py::TestTenantCRUD::test_create_tenant
pytest -m "not slow"            # 跳过慢速
```

## 测试模式依赖（非 mock）

| 能力 | 约定 |
|------|------|
| 图形验证码 | 测试环境固定 `0000` |
| SMS/Email 验证码 | 后端 Mock 模式，如 `MOCK_CODE = "123456"` |
| 密码传输 | `maybe_encrypt_password` 读 loginSetting 决定是否 RSA |

## Redis 旁路（少数 E2E）

仅如密码重置全链路：环境变量 `SECCENTER_TEST_REDIS_HOST` 等；不可用时 `pytest.skip`。

## Agent 禁止

- 未确认环境已启动就生成「假定通过」的测试
- 在集成测试中默认 `unittest.mock.patch` HTTP 响应
