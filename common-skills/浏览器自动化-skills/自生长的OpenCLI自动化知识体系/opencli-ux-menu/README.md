# OpenCLI 菜单管理 — 路由路径按项目判重

基于 [OpenCLI](https://github.com/jackwener/OpenCLI) `browser` 子命令，验证 [`MenuFormDialog`](../../../apex_dev/src/views/system/menu/components/MenuFormDialog.vue) 中**同项目内**路由路径唯一性校验。

## 前置条件

1. **OpenCLI + Chrome 扩展**

   ```bash
   npm install -g @jackwener/opencli
   opencli doctor   # 需全部 OK
   ```

2. **Python 3**（读取/合并 JSON 配置）

3. **Git Bash 或 WSL**（Windows 下推荐；PowerShell 可手动执行 opencli 命令）

4. **本地开发**

   - 推荐：`apex_dev` 子应用 `http://localhost:8081` 已启动（profile `local-subapp`，无需基座登录）
   - 可选：`microfb` 基座 `http://localhost:8080` + 子应用 8081（profile `local`，需登录）

5. **测试数据**

   - `test0415` 中已存在路由路径 `/opencli/dup0415`（TC1 依赖）
   - 若不存在，可先在 test0415 手动新增一条，或修改 `config/ux-test.config.json` 中 `duplicateRoutePath`

## 快速开始

```bash
cd opencli-ux-menu

# bash / Git Bash（TC1~TC3）
bash run-e2e.sh

# Windows PowerShell（无 bash 时 TC1~TC2；有 bash 自动转调）
.\run-e2e.ps1

# 诊断 / 提取路径
bash diagnose-menu-page.sh
.\scripts\diagnose-menu-page.ps1 -Profile local-subapp
.\scripts\extract-route-paths.ps1 -Project test0415

# 演示语法先于判重
bash menu-syntax-before-dup-demo.sh
```

## 测试用例

| 用例 | 步骤 | 期望 |
|------|------|------|
| TC1 | 项目 **test0415** → 新增 → 填已存在路径 → blur | 显示「当前项目下的路由路径已存在」 |
| TC2 | 项目 **test0601** → 新增 → 填相同路径 → blur | **无**上述重复错误 |
| TC3 | 项目 **test0415** → **编辑**该路径菜单 → blur | **无**重复错误（排除自身 id） |

## 配置

| 文件 | 说明 |
|------|------|
| [`config/ux-test.config.json`](config/ux-test.config.json) | profile、菜单路径、测试项目与路径 |
| `config/ux-test.config.local.json` | 本地覆盖（gitignore），用于远程密码 |

| Profile | baseUrl | authMode | 说明 |
|---------|---------|----------|------|
| `local-subapp`（默认） | `http://localhost:8081` | `none` | 子应用直连，本次会话验证通过 |
| `local` | `http://localhost:8080` | `login` | 基座登录后进菜单页 |
| `cloud` | `https://cloud.lanniu.top` | `login` | 远程，需 local.json 填密码 |

Session 名默认 **`nebula-menu-ux`**（与 tenant/user-perm 的 `nebula-ux` **隔离**，避免抢同一 Chrome 标签）。

```bash
# 8080 基座：人工登录 → bind → TC1~TC3
bash bind-and-run.sh
.\bind-and-run.ps1
```

## 失败排查

```bash
opencli browser nebula-ux screenshot screenshots/fail-tc1-dup-in-project.png
opencli browser nebula-ux get url
opencli browser nebula-ux eval "JSON.stringify([...document.querySelectorAll('.el-form-item__error')].map(e=>e.textContent))"
```

常见原因见 [`references/menu-route-dup-pitfalls.md`](references/menu-route-dup-pitfalls.md)。

## 脚本说明

| 脚本 | 作用 |
|------|------|
| `run-e2e.sh` / `run-e2e.ps1` | 入口：登录（如需）+ TC1~TC3 |
| `bind-and-run.sh` / `bind-and-run.ps1` | 8080 人工登录 → bind → TC1~TC3 |
| `menu-route-dup-check.sh` | 核心判重用例（bash，含 TC3） |
| `scripts/menu-route-dup-check.ps1` | PowerShell 版 TC1~TC3 |
| `scripts/Load-MenuUxConfig.ps1` | PS 配置加载（session / profile） |
| `diagnose-menu-page.sh` / `scripts/diagnose-menu-page.ps1` | 只读诊断 |
| `scripts/extract-route-paths.ps1` | 列出表格 routePath |
| `menu-syntax-before-dup-demo.sh` | 演示语法先于判重 |
| `login.sh` | 仅登录（含 login-submit-btn 优先点击） |
| `lib/common.sh` | 项目切换、弹窗、编辑、判重断言 |
| `lib/config.sh` | 加载 profile |

## 文档

| 路径 | 内容 |
|------|------|
| `references/menu-route-dup-pitfalls.md` | 踩坑清单 |
| `references/element-plus-overlay-pattern.md` | append-to-body 弹窗 OpenCLI 模式 |
| `references/routePath-validation-layers.md` | 语法 vs 唯一性分层 |
| `feature-skills/登录与预检/SKILL.md` | 8080 vs 8081、bind |
| `feature-skills/诊断菜单弹窗/SKILL.md` | 排障决策树 |
| `evals/test-prompts.json` | Darwin / 触发试跑提示词 |
| `evals/darwin-baseline-report.md` | 基线评估（dry_run） |

## 沉淀来源

- 会话：菜单路由路径按项目判重实现 + OpenCLI 实测（2026-06-01）
- few-shot：[`assets/few-shot-example/session-menu-route-dup.md`](assets/few-shot-example/session-menu-route-dup.md)
