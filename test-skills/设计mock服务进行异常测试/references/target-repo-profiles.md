# 目标仓库 Profile

技能通过 `targetRepoProfile` 解析落盘路径，避免写死 apex_dev。

## apex_dev（默认）

```yaml
profile_id: apex_dev
repo_root: nebula/apex_dev
mockDir: mock/
mockFilePattern: csv-error*.mock.ts
scenarioFile: .mock-shared/error-scenario.json
hytestsDir: hytests/
workflowDoc: hytests/docs/workflow.md
mockReadme: mock/README.md
devPort: 8081
basePath: /cloud/Apex
envMockFlag: VITE_MOCK_DEV_SERVER
envLocalFile: .env.development.local
apiBasePath: /dev-api
forwardPrefix: forward/seccenter/v2
test_mode: 8081-direct-inject-perm
gitignoreEntries:
  - mock/csv-error*.mock.ts
  - mock/README.md
  - hytests/
  - .mock-shared/
```

## microfb（基座 Phase 2）

```yaml
profile_id: microfb
repo_root: nebula/microfb
mockDir: mock/
mockFilePattern: csv-error*.mock.ts
scenarioFile: .mock-shared/error-scenario.json
hytestsDir: ../apex_dev/hytests/
workflowDoc: ../apex_dev/hytests/docs/workflow.md
workflowSection8080: references/手工自测流程-8080基座mock.md
mockReadme: mock/README.md
devPort: 8080
basePath: /cloud
envMockFlag: VITE_MOCK_DEV_SERVER
envLocalFile: .env.development.local
apiBasePath: /dev-api
forwardPrefix: forward/seccenter/v2
authDirectPrefix: direct/seccenter/v2
test_mode: microfb-8080-scenario
requiresSubApp: apex_dev:8081
gitignoreEntries:
  - mock/csv-error*.mock.ts
  - .mock-shared/
  - .env.development.local
```

## 未来仓库（占位）

新增前端子应用时复制上表并修改：

| 字段 | 需确认 |
|------|--------|
| `devPort` | 各仓库 vite 端口 |
| `basePath` | 路由前缀 |
| `forwardPrefix` | API 转发前缀 |
| `envMockFlag` | mock 开关变量名 |
| `mockDir` | 是否已有 mock 插件目录 |

在 profiles 追加一节 + 可选 few-shot 样本；**不改动** intention/feature 主流程。

## 解析规则

1. 未指定 `targetRepoProfile` → `apex_dev`
2. 所有相对路径相对于 `repo_root`
3. 生成文件前检查 profile 字段齐全，缺则 `missingFacts`
