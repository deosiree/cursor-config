# Darwin 基线评估报告 · 菜单路由路径判重 OpenCLI

> 评估日期：2026-06-01  
> Skill 路径：自生长的OpenCLI自动化知识体系/opencli-ux-menu/SKILL.md  
> 评估模式：**dry_run**（4 组 test-prompt 推演 + 2026-06-01 会话实测结论）  
> Session：**nebula-menu-ux**（与 nebula-ux 隔离）

---

## 总分（dry_run）

| 维度 | 分(1-10) | 权重 | 加权 |
|------|:--------:|:----:|:----:|
| Frontmatter / 触发 | 8 | 8 | 6.4 |
| 工作流清晰度 | 9 | 15 | 13.5 |
| 边界与踩坑 | 9 | 10 | 9.0 |
| 检查点 / 诊断 | 8 | 7 | 5.6 |
| 指令具体性 | 9 | 15 | 13.5 |
| 资源整合 | 9 | 5 | 4.5 |
| 架构分层 | 8 | 15 | 12.0 |
| 实测表现 | 8 | 25 | 20.0 |

**综合约 84.5 / 100**

---

## 实测结论（2026-06-01 会话）

| 用例 | 环境 | 结果 |
|------|------|------|
| TC1 同项目重复 | 8081 / test0415 | PASS |
| TC2 跨项目 | 8081 / test0601 | PASS |
| TC3 编辑自身 | bash 脚本已覆盖 | 待实跑 |
| 8080 自动登录 | login-submit-btn | 不稳定，推荐 bind-and-run |
| 语法先于判重 | `/0522` | PASS（demo 脚本可复现） |

---

## test-prompt dry_run 推演

### TP1：test0415/test0601 判重 E2E

| 阶段 | 不带 skill | 带 skill | 判定 |
|------|------------|----------|------|
| 入口 | 泛用 opencli browser 命令 | `run-e2e.ps1` / `bash run-e2e.sh` | skill 胜 |
| Session | 可能复用 nebula-ux 冲突 | `nebula-menu-ux` | skill 胜 |
| 路径 | 可能用 `/0522` 误判 | `routePath-validation-layers.md` | skill 胜 |

### TP2：8080 bind

| 阶段 | 不带 skill | 带 skill | 判定 |
|------|------------|----------|------|
| 登录 | click「登录」误点语言菜单 | `click_login_submit` / bind-and-run | skill 胜 |

### TP3：弹窗 fill 失败

| 阶段 | 不带 skill | 带 skill | 判定 |
|------|------------|----------|------|
| 定位 | 依赖 state dialog ref | overlay eval 模式 P6 | skill 胜 |

### TP4：TC3 编辑自身

| 阶段 | 不带 skill | 带 skill | 判定 |
|------|------------|----------|------|
| 覆盖 | 常漏测 excludeId | TC3 + `open_menu_edit_dialog_by_route_path` | skill 胜 |

---

## 改进 backlog

1. ~~PowerShell TC3~~ → 已补 `Open-EditDialogByRoutePath`
2. ~~独立 session~~ → `nebula-menu-ux`
3. ~~bind 脚本~~ → `bind-and-run.sh` / `.ps1`
4. 实跑 TC3 + bind-and-run 写入 Round2 实测分
5. CI 不适用（需本地 Chrome）

---

## 试跑命令

```bash
cd opencli-ux-menu
bash run-e2e.sh --profile local-subapp
bash bind-and-run.sh          # 8080 人工登录 + bind
.\run-e2e.ps1                 # Windows TC1~TC3
```
