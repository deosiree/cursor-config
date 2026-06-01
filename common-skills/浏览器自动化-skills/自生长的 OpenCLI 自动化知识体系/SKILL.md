---
name: 自生长OpenCLI自动化
description: 自生长的 OpenCLI 自动化知识体系 — 底座路由中心。按场景分发到子领域 skill（租户管理、用户管理、角色Tab校验等），每次使用沉淀回自身避免知识散落。当需要浏览器自动化（端到端测试/手动点击/SPA爬虫/登录复用）时使用。
tags:
  - 浏览器自动化
  - OpenCLI
  - 自动化测试
  - 手动操作
  - 爬虫
  - 数据提取
should-trigger:
  - prompt 含 "OpenCLI" + 浏览器 / 自动化 / 测试 / 爬虫 / 点击
  - prompt 含 "浏览器自动化" + URL / 登录 / 页面操作
  - prompt 含 "手动操作" + 浏览器 / 网页填写
  - prompt 含 "爬虫" + JS 渲染 / SPA / 飞书文档
  - prompt 含 "登录态复用" + 多个脚本 / session 共享
should-not-trigger:
  - 用户只想用 web_fetch 获取静态 HTML 页面
  - 用户明确说 "不要打开浏览器" 或 "纯命令行"
  - 用户需要无头浏览器（OpenCLI 需要真实 Chrome 窗口）
  - 用户需要跨平台 CI（OpenCLI 依赖本地 Chrome 扩展）
---

# 自生长的 OpenCLI 自动化知识体系

> **定位：** 自生长知识体系的底座路由中心。只做路由，不做拷贝。根据场景分发到子 skill 或通用操作指南。
> **范围：** OpenCLI 的 `browser` 子命令能驱动真实 Chrome 执行任何浏览器操作——自动化测试、手动点击模拟、表单填写、SPA 爬虫、登录态复用等。
> **自生长：** 每次使用沉淀的脚本、踩坑、few-shot 回收到对应子 skill 中，避免知识散落在对话记录里。

## RED（失败基线）
- 对 SPA 网站用 `web_fetch` → 拿到空壳 HTML
- 用纯 shell 断言浏览器状态（无 DOM 感知）→ 脆弱、易误报
- 每次新建 session 而非复用 → 需要重复登录、验证码

## GREEN（执行主线）
见下方"路由规则"和"使用方法"。

## 路由规则

| 场景 | 条件 | 策略/引用 |
|------|------|----------|
| **自动化测试-用户管理** | 创建/清理种子用户、操作列权限诊断、对比本人/他人操作列 | → `opencli-ux-user-perm/`（直接路由） |
| **自动化测试-租户管理** | 租户创建/搜索/删除 CRUD 全流程 | → `opencli-ux-tenant/`（直接路由） |
| **自动化测试-角色Tab校验** | 弹窗 Tab 切换 + 表单错误断言 | → `opencli-ux-role-tab-validation/`（直接路由） |
| **自动化测试-其他场景** | 端到端校验（操作→断言） | → [[references/场景-自动化测试.md]] — 路由到子 skill 或通用流程 |
| **手动点击自动化** | 模拟人工操作：点按钮、填表单、切换 Tab、截图 | → [[references/场景-手动点击自动化.md]] |
| **爬虫与数据提取** | SPA / JS 渲染站点提取全文或结构化数据 | → [[references/场景-爬虫与数据提取.md]] |
| **登录会话管理** | 先登录再执行后续操作 | → [[references/场景-手动点击自动化.md#登录会话]]（共用） |

每个场景文件包含：
1. 适用的已有 skill 引用路径（Wikilink `[[…]]` 或相对路径）
2. 核心 OpenCLI 命令模式（不依赖 skill 的裸命令）
3. 前置条件与检查点

## 使用方法（Agent 视角）

```
1. 判断场景类型（见路由规则表）
2. 读对应场景文件（references/场景-{类型}.md）：
   - 路径相对于本 SKILL.md 同级的 references/ 目录
   - 如果 wikilink `[[...]]` 不可解析，直接用相对路径读
3. 按场景文件的步骤执行：
   a. 如果场景指向已有 skill → 调用该 skill（按 skill 的 README 或 SKILL.md）
   b. 如果是通用操作指南 → 按指南步骤执行 opencli browser 命令
4. 验证操作结果（截图 / DOM 断言 / 输出检查）
5. 返回给调用方：做了什么、结果如何
```

## 前置条件检查（自动门禁）

在任何场景执行前先检查。Agent 应自动执行以下检查，不要等待用户提示才做：

```bash
command -v opencli >/dev/null 2>&1 || { echo "❌ 请安装: npm install -g @jackwener/opencli"; exit 1; }
opencli doctor >/dev/null 2>&1 || { echo "❌ opencli doctor 未通过，请修复浏览器桥接"; opencli doctor; exit 1; }
```

### 子 skill 执行前自检清单

Agent 调用于 skill 前，自动按以下顺序检查：

| # | 检查项 | 失败处理 |
|---|--------|---------|
| 1 | `opencli doctor` 通过 | 提示用户修复后重试 |
| 2 | 目标子 skill 目录存在 | 报错路径不存在 |
| 3 | 子 skill 的 `config/ux-test.config.local.json` 已配置密码 | 提示用户复制 example 并填写 |
| 4 | 已有 session 是否仍在登录态（`opencli browser SESSION get url`） | 非登录态则执行 login 或 bind |
| 5 | 批量删除前请用户确认租户 + keepCount | 未确认则暂停 |

## 常用基础命令速查

| 命令 | 用途 |
|------|------|
| `opencli browser <session> open <url>` | 在浏览器中打开 URL |
| `opencli browser <session> click --role button --name "确定"` | 点击指定按钮 |
| `opencli browser <session> fill --role textbox --name "用户名" "admin"` | 填写输入框 |
| `opencli browser <session> eval "JS_CODE"` | 在页面执行 JS，返回结果 |
| `opencli browser <session> screenshot <path>` | 截图 |
| `opencli browser <session> get url` | 获取当前 URL |
| `opencli browser <session> state` | 获取页面状态（可见元素） |
| `opencli browser <session> wait text "关键词" --timeout 5000` | 等待文本出现 |
| `opencli browser <session> bind` | 将已有浏览器标签绑定到 session |
| `opencli browser <session> extract [--chunk-size N]` | 提取页面可见文本 |
| `opencli fetch <url> --render` | 渲染后抓取页面（无 session 模式） |

## 检查点

### 用户确认点（Agent 执行前必须停顿确认）

| 阶段 | 确认内容 | 向用户确认的问题 |
|------|---------|----------------|
| ⚡ 执行前 | 目标 URL / 环境 /  profile 是否正确 | 「确认将操作：{URL}，profile={profile}，继续？(y/n)」 |
| 🔐 登录前 | 是否需要复用已有 session | 「已有 session `nebula-ux` 可用，是否跳过登录？(--skip-login)」 |
| 🖱️ 操作前 | 操作步骤是否符合预期 | 「计划执行以下步骤：1.打开页面 2.点击 X 3.填写 Y 4.截图。确认？(y/n)」 |
| 🕸️ 爬虫前 | 输出路径 / 页面数量预期 | 「将从 {URL} 提取内容，保存到 {path}，预计 {N} 页。确认？(y/n)」 |

### 技术检查点

- **执行任何 opencli 命令前**：先 `opencli doctor` 检查（脚本入口处自动执行）
- **需要登录的页面**：先用 login 流程或 bind 绑定已登录标签
- **SPA 页面**：eval + 显式 `wait text` 比 `click --name` 更可靠（按钮可能不在 DOM 中）
- **session 名称**：固定为 `nebula-ux` 跨 skill 复用（所有子 skill 共用）
- **操作后截图**：重要步骤后截图，方便排查

### Fallback 路径（操作失败时的降级链路）

| 失败层 | 主路径 | 降级 1 | 降级 2 | 降级 3 |
|--------|-------|--------|--------|--------|
| OpenCLI 不可用 | `opencli doctor` 修复 | 提示用户安装/重启 Chrome | 改用 `web_fetch` 提取静态内容 | 放弃操作，报错 |
| 页面打不开 | `open` + `wait text` | `screenshot` 查看页面状态 | 换 `web_fetch` 检查 URL 可达性 | 提示用户手动验证 |
| 元素定位失败 | `click --name` / `fill --role` | eval JS 兜底（CSS 选择器） | eval JS 按文本内容查找 | 截图 + 报错 |
| Session 过期 | 自动检测 URL 含 `/login` | 重新执行 login 流程 | 提示用户 `bind` 已登录标签 | 放弃，报错 |
| 断言失败 | `wait text` + eval JSON | `screenshot` 存证 | 重试 2 次（间隔 2s） | 报告失败详情 + 截图 |

## 约束

- 不修改任何被引用的已有 skill 文件
- 不拷贝被引用 skill 的脚本/config 到本目录
- 遇到未覆盖的新场景 → 在 references/ 新增场景文件 + 更新路由规则表

## 常见反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|---------|
| 每次执行都新建 session | 重复登录 + 验证码，耗时且脆弱 | 固定 session 名（如 `nebula-ux`），用 `--skip-login` 复用 |
| 依赖 `sleep` 等待页面加载 | 网络波动时假超时或假成功 | 用 `wait text` + `wait --timeout` 条件等待 |
| 只用 `click --name` 不兜底 | Element Plus 等组件库的按钮文本带空格/图标，role 定位失败 | 先用 `click --name`，失败后 `eval JS` 兜底（见子 skill lib/common.sh） |
| `eval` 不返回 JSON | 输出是自由文本，后续断言困难 | eval 表达式始终包 `JSON.stringify(...)` 输出结构化结果 |
| 忽略 `opencli doctor` 检查 | 浏览器桥接已断开，命令静默失败 | 脚本入口处调用 `opencli doctor >/dev/null` 前置检查 |
| 脚本里硬编码密码 | 不小心提交 git | 用 config JSON 文件 + `.gitignore` 本地覆盖（参考子 skill 的 `config/ux-test.config.local.json`） |

遇到 OpenCLI 命令失败时，可调用全局 skill `opencli-autofix` 自动诊断修复：

```bash
# 在 Agent 会话中
run_skill { name: "opencli-autofix", arguments: "opencli browser nebula-ux click --role button --name '登录' 失败" }
```

## 外部引用总览

| 被引用的已有 Skill | 角色 |
|-------------------|------|
| `opencli-ux-role-tab-validation/` | 自动化测试：角色 Tab 校验跳转 |
| `opencli-ux-tenant/` | 自动化测试：租户 CRUD 流程 |
| `opencli-ux-user-perm/` | 自动化测试：用户管理 E2E + 操作列权限诊断 |
| `common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档/` | 爬虫与数据提取：飞书文档滚动抓取 |
