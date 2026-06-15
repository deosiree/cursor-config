# Darwin 评估：实跑范围审计

## 评估对象
本次实跑（session end 时的沉淀操作）

## 实测范围 vs 完整清单

| 功能 | 实测方式 | 实际覆盖 | 应覆盖 |
|------|---------|:-------:|:------:|
| route-obsidian 分类 | grep 关键词存在 | ✅ 文件级 | 实际 dispatch 到 feature skill |
| obsidian-vault-mgt 前置检查 | grep 规则存在 | ✅ 文件级 | 实际检查 VAULT_ROOT + 目录 |
| obsidian-vault-mgt frontmatter | grep 模板存在 | ✅ 文件级 | 实际用模板创建笔记 |
| obsidian-vault-mgt 决策树 | grep 文本存在 | ✅ 文件级 | 实际按类型创建笔记 |
| obsidian-vault-mgt 异常处理 | grep 表格存在 | ✅ 文件级 | 实际触发异常场景 |
| obsidian-vault-mgt Python 脚本 | ls 文件存在 | ✅ 文件级 | 实际运行脚本 |
| obsidian-vault-mgt references | ls 文件存在 | ✅ 文件级 | 实际查阅内容 |
| llm-wiki ingest | 未测 | ❌ | 实际 ingest 一个来源 |
| llm-wiki query | 未测 | ❌ | 实际 query 一次知识库 |
| llm-wiki lint | 未测 | ❌ | 实际 lint 检查 |
| llm-wiki synthesize | 未测 | ❌ | 实际 synthesize 编译 |
| vault-weekly-review | 未测 | ❌ | 实际生成周报 |
| vault-duplicate-detection | 未测 | ❌ | 实际检测重复 |
| qmd search | 未测 | ❌ | 实际搜索 |
| Human Loop 触发 | 未测 | ❌ | 实际 send 模糊请求 |
| 跨 skill 链式 dispatch | 未测 | ❌ | 全链路跑通 |
| VAULT_ROOT .env 加载 | 未测 | ❌ | 实际 source .env |
| Python 脚本实际执行 | 未测 | ❌ | python3 *.py |

## 结论

**实测覆盖率：4/18 = 22%。实跑范围太小。**
