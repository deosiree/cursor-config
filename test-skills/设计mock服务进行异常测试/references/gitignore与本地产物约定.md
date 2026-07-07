# gitignore 与本地产物约定

## apex_dev 默认（profile: apex_dev）

在目标仓库 `.gitignore` 追加：

```gitignore
# CSV 异常 UI mock 自测（本地）
mock/csv-error*.mock.ts
mock/README.md
hytests/
.mock-shared/
```

`.env.development.local` 通常已在 gitignore（含 `*.local`）。

## 本地必需文件

| 文件 | 说明 |
|------|------|
| `.env.development.local` | `VITE_MOCK_DEV_SERVER=true` |
| `mock/csv-error*.mock.ts` | mock 实现 |
| `.mock-shared/error-scenario.json` | 场景切换 |
| `mock/README.md` | 瘦索引 |
| `hytests/` | registry + automation + workflow |

## 不提交原则

- mock 与自测文档为 **个人/团队本地验证** 产物
- 技能套件（huiyanSkills）沉淀方法论与 few-shot，不替代仓库内 gitignored 运行时文件

## 新仓库 profile

在 `target-repo-profiles.md` 注册后，按该 profile 的 `gitignoreEntries` 追加规则。
