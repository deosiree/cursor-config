# opencli-ux-api-whitelist

菜单管理 **API 白名单** 弹窗表格的 OpenCLI E2E 子 skill（自生长 OpenCLI 知识体系）。

## 快速开始

```powershell
# 1. 在 p2ejw7ww Chrome 手动登录 http://localhost:8080/cloud/login（admin@system.local）
# 2. 打开菜单管理页
cd "…/自生长的OpenCLI自动化知识体系/opencli-ux-api-whitelist"
.\run-e2e.ps1 -Check       # 可选：doctor
.\run-e2e.ps1              # 只测滚动（默认 -BindOnly -SkipSeed）
.\run-e2e.ps1 -Full        # 插种 50 条 + 滚动
```

## 脚本

| 文件 | 用途 |
|------|------|
| `test-api-whitelist-table-scroll.ps1` | 主流程 |
| `opencli-whitelist-seed-50-oneline.js` | 串行真实 API ×50 |
| `opencli-whitelist-scroll-eval-oneline.js` | 滚动指标（`el-scrollbar__wrap`） |
| `opencli-login-admin-eval-oneline.js` | admin 登录 eval |

## 目录

- `references/` — 踩坑与 Element Plus 滚动模式
- `template/before|after` — RED/GREEN 样本
- `feature-skills/` — 登录、插种、滚动分步
- `evals/` — 触发词与 test-prompts

## 约定

见父级 `references/opencli-默认会话与登录约定.md`：8080、admin、p2ejw7ww profile。

## 沉淀新场景

1. 会话结束写 `../session-log/YYYY-MM-DD-*.md`
2. 可复制本目录 `scripts/` 模式 scaffold 新子 skill
3. 横向模式写入父级 `references/公共模式与反模式.md`
