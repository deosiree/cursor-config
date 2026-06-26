# 测试类型判定表

Agent 在 RED 阶段用本表判定是否应路由到 **本 skill（HTTP 黑盒集成）**。

## 判定矩阵

| 类型 | 特征 | 典型工具 | 是否本 skill |
|------|------|----------|-------------|
| **单元测试** | 隔离函数/类，mock 全部外部依赖 | pytest + mock，Vitest | 否 |
| **进程内 API 集成** | 打 ASGI/FastAPI，`dependency_overrides`，不连真实 DB | httpx + AsyncClient | 否 → terminology-agent TDD |
| **HTTP 黑盒集成** | `requests` 打 Gateway，真实 DB，自造数据 + 清理 | pytest + requests | **是** |
| **API 级 E2E** | 多步跨接口/旁路（Redis 植入验证码等） | pytest + requests (+ redis) | **是** → `撰写-多步E2E流程` |
| **UI E2E** | 浏览器自动化 | Playwright/Cypress | 否 → 未来独立 skill |
| **手工回归 CSV** | 步骤给人执行，导入测试系统 | cases.json → CSV | 否 → 输出csv skill |

## 信号检查清单

满足 **≥3 条** 即路由本 skill：

- [ ] 测试通过 HTTP 访问 `BASE_URL/.../v2/...`
- [ ] 需要已启动 Gateway / 后端 / 数据库
- [ ] 用 `requests.Session` 或等价 HTTP 客户端
- [ ] 测试内创建实体并在 teardown 删除
- [ ] 不使用 `unittest.mock` mock 业务 API 响应

## 与 terminology-agent TDD 对比

| 维度 | HTTP 黑盒（本 skill） | terminology-agent TDD |
|------|----------------------|------------------------|
| 依赖 | 真实 Gateway + DB | mock repo / ASGI |
| 目录 | 扁平 `tests/test_NN_*.py` | 共置 `app/**/tests/` |
| 组织 | `Test*` 类 + `test_*` 方法 | 顶层 `async def test_*` |
| 速度 | 慢；CI 可用 `-m integration` | 快；默认全跑 |
| 文件头 | 场景索引 + 测试策略 | 一行 + mock 策略说明 |
| 注释 | 类/方法中文 docstring | 方法 outcome docstring |

## 误触发

以下表述 **不要** 路由本 skill：

- 「Vitest 单元测试」「mock repo」「httpx ASGI」「dependency_overrides」
- 「输出 CSV」「手工用例」「测试系统导入」
- 「Playwright 点按钮」
