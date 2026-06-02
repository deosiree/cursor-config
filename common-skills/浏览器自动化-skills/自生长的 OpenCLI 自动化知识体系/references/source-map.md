# OpenCLI 通用路由 — 外部引用总览

本路由中心引用但不拷贝以下已有 skill 的内容。所有引用路径**相对于本文件所在目录的上层**（即 `自生长的 OpenCLI 自动化知识体系/`）。

## 引用列表

| 被引用的 skill | 相对路径 | 角色 | 场景文件 |
|---|---|---|---|
| opencli-ux-role-tab-validation | `opencli-ux-role-tab-validation/` | 自动化测试：角色弹窗 Tab 校验断言模式 + lib/common.sh 封装 | [[references/场景-自动化测试.md]] |
| opencli-ux-tenant | `opencli-ux-tenant/` | 自动化测试：租户 CRUD 全流程 + config/profile 加载 | [[references/场景-自动化测试.md]] |
| opencli-ux-user-perm | `opencli-ux-user-perm/` | 自动化测试：用户管理 E2E + 操作列权限 + isOwner/Header 诊断 | [[references/场景-自动化测试.md]]、[[references/场景-权限与登录态诊断.md]] |
| opencli-ux-menu | `opencli-ux-menu/` | 自动化测试：菜单路由路径按项目判重 + Element Plus 弹窗表单 | [[references/场景-自动化测试.md]] |
| opencli-ux-menu-import | `opencli-ux-menu-import/` | 菜单权限合并 YAML 预览导入 + HTTP dry_run + SSH ERRO 三联 | [[references/场景-菜单导入与SSH联调.md]] |
| ssh-skills | `common-skills/ssh-skills/` | jump + kubectl 查 seccenter 后端日志（与 OpenCLI 互补） | [[references/场景-菜单导入与SSH联调.md]] |
| OpenCLI-下载飞书文档 | `common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档/` | 爬虫：SPA 滚动抓取 + 去重合并 + 结构化输出 | [[references/场景-爬虫与数据提取.md]] |

## 每个 skill 的核心贡献

### opencli-ux-role-tab-validation

| 能力 | 文件 |
|------|------|
| OpenCLI 命令封装（oc_plain） | `lib/common.sh` |
| 弹窗 Tab 切换与表单错误断言 | `lib/common.sh`（`assert_role_dialog_tab`, `assert_role_form_error`） |
| 原生 JS eval 兜底（click_dialog_footer_button, fill_role_name） | `lib/common.sh` |
| 截图失败自动保存 | 各 assert 函数 |
| 可复用的 config 加载机制 | `lib/config.sh` |

### opencli-ux-menu

| 能力 | 文件 |
|------|------|
| 项目下拉切换 + 新增弹窗 eval 打开 | `lib/common.sh`（`select_menu_project`, `open_menu_create_dialog`） |
| 可见 overlay 内表单错误断言 | `lib/common.sh`（`get_menu_form_state`, `assert_menu_route_error_contains`） |
| 登录按钮 login-submit-btn 优先 | `lib/common.sh`（`click_login_submit`） |
| local-subapp（8081 免登录）profile | `config/ux-test.config.json` |
| 踩坑清单 | `references/menu-route-dup-pitfalls.md` |

### opencli-ux-user-perm（isOwner / Header）

| 能力 | 文件 |
|------|------|
| isOwner bypass / session 诊断 eval | `references/场景-权限与登录态诊断.md` |
| 踩坑与 computed fix | `references/perm-bypass-isOwner-pitfalls.md` |
| 可执行 checklist | `feature-skills/权限后门与Header诊断/SKILL.md` |
| 会话 few-shot | `assets/few-shot-example/session-perm-bypass-header.md` |

### opencli-ux-menu-import

| 能力 | 文件 |
|------|------|
| HTTP dry_run 预览闭环 | `docs/menu/scripts/menu_import_preview_loop.py`（仓库内，skill 仅引用） |
| 补丁 id 写回 | `docs/menu/scripts/ensure-patch-menu-ids.py` |
| SSH 真实 ERRO 对照 | `common-skills/ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md` |
| 三联场景说明 | `references/场景-菜单导入与SSH联调.md` |
| 会话 few-shot | `assets/few-shot-example/session-menu-import-preview.md` |

### ssh-skills（ssh-k8s-浏览后端日志）

| 能力 | 文件 |
|------|------|
| kubectl logs + grep ERRO | `feature-skills/ssh-k8s-浏览后端日志/SKILL.md` |
| plink 非交互 SSH | 同上 + `config/ssh.config.json` |
| ERRO vs 100000 映射 | 同上 + `docs/menu/导入失败排查-100000.md` |

### opencli-ux-tenant

| 能力 | 文件 |
|------|------|
| 多 profile 管理（local/cloud/phone-user） | `config/ux-test.config.json` |
| 本地配置覆盖（密码/密码等敏感字段 gitignore） | `config/ux-test.config.local.json` |
| 验证码处理策略（auto/manual/bind-only） | `lib/common.sh`（`handle_captcha_mode`） |
| Python jq 替代 JSON 合并 | `lib/config.sh`（`_merge_json_files`） |

### OpenCLI-下载飞书文档

| 能力 | 文件 |
|------|------|
| 飞书 SPA 滚动策略 | `scripts/download.js`, `lib/opencli.js` |
| 分页去重与提前结束 | `scripts/download.js` |
| 结构化命令行参数解析 | `scripts/download.js`（`--url --out`） |

## 引用方式

在场景文件中通过 Wikilink 引用：

```markdown
参考已有 skill：[opencli-ux-role-tab-validation](../opencli-ux-role-tab-validation/README.md)
```

Agent 视角：

```
1. 读场景文件 → 找到引用的已有 skill
2. 如果路径是相对路径 → 用 read_file 读其 README.md 或 SKILL.md
3. 如果路径是 Wikilink [[opencli-ux-...]] → 按相对路径解析
```
