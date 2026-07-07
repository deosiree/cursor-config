# 设计 mock 服务进行异常测试

← [[SKILL.md]] · 并列 skill：[[../基于测试用例写后端的pytest自动化测试/SKILL.md]]

从 **已筛选 CSV** 驱动 apex_dev **vite mock** + **hytests 手工自测**（8081 直连 + Console 注入权限）。

黄金样本：`F:\Documents\Repertory\Sieyuan\nebula\apex_dev`（3545/3570/3571）

---

## 自然语言怎么用

```text
使用 $设计mock服务进行异常测试：
- targetRepoProfile: apex_dev
- csvPath: docs/自测单/异常处理_已筛选.csv
- 需求: 全量解析 CSV，写 csv-error mock、cases_registry、每用例 automation README；
  完整自测流程放 hytests/docs/workflow.md，mock/README.md 保持瘦索引
```

### 字段对照

| 字段 | 含义 | 示例 |
|------|------|------|
| `targetRepoProfile` | 落盘仓库 | `apex_dev` |
| `csvPath` | **你已筛选** 的 CSV | `docs/自测单/异常_*.csv` |
| `caseIds` | 可选子集 | `3545,3570` |
| `allowDarwin` | 质量试跑 | `true` |

> 技能 **不二次筛选** CSV；你传什么行就写什么用例。

---

## 目录结构

```
设计mock服务进行异常测试/
├── SKILL.md
├── README.md
├── references/
├── intention-skills/
├── feature-skills/
├── assets/few-shot-example/3545-3570-3571-mvp/
├── template/
└── evals/
```

---

## 目标仓库产物（apex_dev）

| 路径 | 说明 |
|------|------|
| `mock/csv-error*.mock.ts` | mock 实现（gitignored） |
| `.mock-shared/error-scenario.json` | 场景切换 |
| `mock/README.md` | 瘦索引 |
| `hytests/docs/workflow.md` | 完整自测流程 |
| `hytests/docs/automation/{id}.md` | 每用例 README |
| `hytests/cases_registry.yaml` | 机器索引 |

---

## Darwin 质量

- 文档评分：**87.3/100**（Round 3，HL-4 触顶）
- 产物验收：12/12（Round 0 自检）
- 详情：[[evals/results/final-report.md]]

---

```bash
# .env.development.local
VITE_MOCK_DEV_SERVER=true

cd apex_dev && pnpm dev
# 打开 http://localhost:8081/cloud/Apex/system/user
# Console 注入权限 → 见 hytests/docs/workflow.md
```

---

## 使用示例

**MVP 三用例（3545/3570/3571）**

```text
csvPath=异常处理_MVP.csv，写 csv-error.mvp.mock.ts 三场景 + 三个 automation README。
```

**批量追加**

```text
csvPath=异常处理_批次2.csv，在现有 mock 文件追加 scenario 分支，更新 registry 与 mock README 表。
```

**权限待确认**

```text
case 3465 页面权限码不确定，mock 与 curl 先交付，浏览器步骤 blocked，perm_status=pending_human。
```
