# Skill 拓展路线图

状态：`planned` = 仅规划；`done` = 已在本套件落地。

## Intention 层

| 节点 | 状态 | 触发 |
|------|------|------|
| 基于test.ts生成 | done | 有 `*.test.ts` |
| 沉淀模块配置 | done | 参考 CSV / 自然语言默认值 |
| 基于源码+口述生成 | done | 无 test.ts，口述 UI 场景 |
| 基于Swagger契约生成 | planned | 后端 API 用例为主 |
| 合并多来源去重 | planned | 多 CSV/多 cases 合并 |

## Feature 层

| 节点 | 状态 | 路径模式 |
|------|------|---------|
| api-基于test.ts生成 | done | `src/api/**/__tests__/**` |
| gateway-基于test.ts生成 | done | `src/gateway/**/__tests__/**` |
| darwin拓展发现 | done | 每轮强制 |
| views-基于源码生成 | planned | `src/views/**` |
| store-基于test.ts生成 | planned | `src/store/**` |
| utils-基于test.ts生成 | planned | `src/utils/**` |
| types-基于源码生成 | planned | `src/types/**` |
| enum-基于源码生成 | planned | `src/enums/**` |
| directive-基于源码生成 | planned | `src/directives/**` |
| hook-基于源码生成 | planned | `src/hooks/**` |
| components-基于源码生成 | planned | `src/components/**` |
| router-基于test.ts生成 | planned | 路由/redirect 类 |
| 集成-基于源码生成 | planned | 多模块联调 |
| 端到端-基于场景生成 | planned | Playwright/Cypress |

## 脚本层（无需新 skill）

换模块仅换 JSON + 复用 `generate_test_csv.py` 即可，除非出现新的输入介质（口述、Swagger）。
