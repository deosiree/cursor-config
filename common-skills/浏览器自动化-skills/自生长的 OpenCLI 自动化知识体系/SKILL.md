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
  - prompt 含 "E2E" + 浏览器 / 端到端
  - prompt 含 "自动化回归" + 页面 / 浏览器
  - prompt 含 "OpenCLI" + session / 复用 / 绑定 / bind
  - prompt 含 isOwner / 权限后门 / 个人中心 / sessionStorage userInfo + OpenCLI
  - prompt 含 菜单导入 / ImportProjectMenuTree / 权限合并 yaml / 100000 未知错误 + OpenCLI 或 SSH
  - prompt 含 "自动化操作" + 网页 / 填表 / 批量
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
| **自动化测试-菜单路由判重** | 项目切换 + 路由路径 blur 异步判重断言 | → `opencli-ux-menu/`（直接路由） |
| **自动化测试-菜单权限合并导入** 🆕 | 权限合并 YAML 预览/导入、`ImportProjectMenuTree`、`[100000]未知错误`、SSH 查 ERRO、自动补 id | → `opencli-ux-menu-import/` + [[references/场景-菜单导入与SSH联调.md]] + `ssh-skills/feature-skills/ssh-k8s-浏览后端日志/` |
| **自动化测试-权限/isOwner/Header** | isOwner bypass、sessionStorage 诊断、登录后个人中心下拉 | → [[references/场景-权限与登录态诊断.md]] + `opencli-ux-user-perm/feature-skills/权限后门与Header诊断/` |
| **自动化测试-其他场景** | 端到端校验（操作→断言） | → [[references/场景-自动化测试.md]] — 路由到子 skill 或通用流程 |
| **手动点击自动化** | 模拟人工操作：点按钮、填表单、切换 Tab、截图 | → [[references/场景-手动点击自动化.md]] |
| **爬虫与数据提取** | SPA / JS 渲染站点提取全文或结构化数据 | → [[references/场景-爬虫与数据提取.md]] |
| **登录会话管理** | 先登录再执行后续操作 | → [[references/场景-手动点击自动化.md#登录会话]]（共用） |
| **批量用户角色分配** 🆕 | 用户列表批量分配角色，逐用户勾选+提交 | → [[references/场景-批量用户角色分配.md]] — 自生长（2026-06-06） |
| **以上都不是** 🆕 | 新场景 / 不匹配上述任何条件 | → [[#自生长流程]] — 自生长：参照模板 scaffold 新子 skill + 更新此表 |

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
| `opencli-ux-menu/` | 自动化测试：菜单路由路径按项目判重 |
| `opencli-ux-menu-import/` | 自动化测试：菜单权限合并 YAML 预览导入 + SSH 三联 |
| `common-skills/ssh-skills/` | 后端排障：jump + kubectl 查 seccenter Pod 日志 |
| `common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档/` | 爬虫与数据提取：飞书文档滚动抓取 |

## 自生长流程

> 本知识体系的核心能力：当遇到路由表未覆盖的新场景时，**不自闭、不拒绝、不猜测**——按以下流程生长出新子 skill。

### 触发条件

| 条件 | 示例 |
|------|------|
| 用户需求不在现有路由表的 7 行中 | "帮我把配网文件批量上传到 10 个设备" |
| 现有路由表的场景匹配但实现方式不同 | 自动化测试但目标是 `ant-design` 而非 `element-plus` |
| 现有子 skill 的 lib 不足以支撑新操作 | 需要拖拽 / 文件上传 / iframe 操作 |
| 新环境 / 新 profile 模式 | electron 应用、非 Chrome 浏览器 |

### 生长步骤（自动化管道）

> **关键变化**：每次自生长同时提供 **Agent 执行路径**（用 `read_file`/`write_file` 等内置工具）和 **Shell 执行路径**（`bash harvest/*.sh` 全自动化）。
> **自生长 checkpoint**：进入自生长前必须向用户确认「将创建新场景「{场景名}」，确认？(y/n)」，用户确认后才执行步骤 0-5。

### 自生长步骤（Agent 路径 vs Shell 路径）

| # | 步骤 | Agent 路径（当前对话中用内置工具） | Shell 路径（用户终端执行） |
|:-:|:-----|:----------------------------------|:-------------------------|
| **⏸️ 决策** | 自生长 checkpoint | **确认**：`"此场景尚未覆盖，将创建新场景「{场景名}」，确认？(y/n)"` → 用户确认后才继续 | 同上 |
| **0** | 记录会话日志 | 用 `write_file` 写入 `session-log/{date}-{session}-{scene}.md`（模板见 `harvest/templates/session-log.md`），记录：session/profile/命令序列/踩坑/截图 | `bash harvest/session-log.sh capture <session> <profile> "<task>"` |
| **1** | 识别场景 | 确认路由表无匹配 → 声明 "此场景尚未覆盖，开始自生长" | 同上 |
| **2** | 沉淀命令 | 在当前对话中直接执行 OpenCLI 命令（用 `run_command opencli browser ...`），记录关键命令序列、踩坑、eval 表达式 | 同上 |
| **3** | 归档为新场景 | 用 `write_file` 创建 `references/场景-{name}.md`（从 `harvest/templates/scene.md` 填充），更新 `SKILL.md` 路由规则表，追加 `test-prompts.json` | `bash harvest/add-scene.sh -n "<场景名>" -s <session> -p <profile> -P "<用户请求>" -c "<命令序列>" -C "<触发条件>"` |
| **4** | 子 skill（可选） | **≥3 可复用脚本时**：用 `write_file` 逐一创建 `opencli-ux-{name}/` 下的 12+ 文件（参考 `harvest/scaffold-skill.sh` 的生成结构），注册到路由表 | `bash harvest/scaffold-skill.sh -n "<场景名>" -s <session> -p <profile> -P "<用户请求>"` |
| **5** | 验证 | 确认 `test-prompts.json` 已有新条目，确认路由表可命中新场景 | 同上 |

### 自生长 Agent 路径详解

Agent 路径的核心理念：**不依赖 bash 环境，用 Agent 内置的文件工具 (`read_file`/`write_file`/`edit_file`) 完成自生长全流程**。

**Step 0 — 记录日志（Agent 路径）**

```yaml
# 用 write_file 创建会话日志
write_file:
  path: "session-log/{date}-{session}-{scene}.md"
  content: |
    ---
    session: {session}
    profile: {profile}
    date: {date}
    task: "{task_desc}"
    ---
    ## 关键命令序列
    ```bash
    opencli browser {session} open {url}
    opencli browser {session} click ...
    ```
    ## 踩坑记录
    - ...
    ## 沉淀决策
    - [ ] 创建 references/ 场景文件
```

**Step 3 — 归档为新场景（Agent 路径）**

```yaml
# 1. 创建 references/ 场景文件
write_file:
  path: "references/场景-{name}.md"
  content: |   # 从 harvest/templates/scene.md 获取模板结构

# 2. 更新 SKILL.md 路由规则表
edit_file:     # 在「以上都不是」行前插入新行

# 3. 更新 test-prompts.json
edit_file:
  path: "test-prompts.json"
  search: "]"  # 在最后一个 ] 前追加新条目

# 4. auto-commit（如果有 git 环境）
run_command:
  command: "cd .cursor && git add ... && git commit -m \"🏗️ OpenCLI自生长: 新增场景「{name}」\""
```

**Step 4 — 子 skill 骨架（Agent 路径）**

≥3 个可复用脚本时，用 `write_file` 逐一创建子 skill 目录下的 12+ 文件（参考 `harvest/scaffold-skill.sh` 的输出结构），再用 `edit_file` 注册到路由表。

### 子 skill 脚手架结构

### 子 skill 脚手架结构

不再手动创建。运行以下命令一键生成：

```bash
bash harvest/scaffold-skill.sh -n "<场景名>" -s <session> -p <profile> -P "<用户请求>"
```

生成的骨架结构：

```
new-scene-name/
├── SKILL.md                  # 前端 + 路由 + 输入/输出契约
├── README.md                 # 人类说明
├── config/
│   ├── ux-test.config.json   # 默认配置
│   └── ux-test.config.local.json.example  # 本地覆盖模板（.gitignore 中屏蔽 .local.json）
├── references/
│   ├── common-failures.md    # 常见失败原因与修复
│   └── {scene}-pitfalls.md   # 该场景特有的踩坑记录
├── lib/
│   ├── common.sh             # OpenCLI 封装函数（参考 opencli-ux-tenant/lib/）
│   └── config.sh             # 配置加载（合并 JSON）
├── login.sh                  # 登录封装（支持 --profile 和 --skip-login）
├── run-e2e.sh                # 主执行入口
├── evals/
│   ├── should-trigger.md     # 触发条件
│   ├── should-not-trigger.md # 不触发条件
│   └── darwin-baseline-report.md  # Darwin 基线评估
├── template/
│   ├── before/               # 执行前状态模板
│   └── after/                # 通过态模板
├── screenshots/              # 失败截图 / 结果截图
├── intention-skills/         # （可选）意图判断节点
└── feature-skills/           # （可选）子能力分层
```

### 自生长 vs 直接引用

| 情况 | 动作 |
|------|------|
| 新场景对话产生了 1-3 个命令序列 | `bash harvest/add-scene.sh ...` — 一键注册场景文件 + 路由表 + test-prompts |
| 新场景对话产生了稳定可复用的脚本 | `bash harvest/scaffold-skill.sh ...` — 创建完整子 skill 骨架（12+ 文件） |
| 新场景对话产生了新的 eval/lib 模式 | 同步更新 references/公共模式与反模式.md |
| 用户自己提了更简洁的写法 | 沉淀到 references/ + 更新踩坑记录 |

### 不生长的情况

- 用户需求可用现有子 skill 直接覆盖 → 直接路由，不自生长
- 用户只是口头提问不需要执行 → 回答即可，不自生长
- 只有一个命令就能解决的问题 → 执行并记录到本次对话日志即可
- 场景与已覆盖场景 ≥80% 重合 → 扩展已有子 skill 而非新建

## 观察自生长

每次自生长（新增场景 / 新增子 skill / 新增会话日志）都会自动执行 git commit，
产生一条可追溯的提交记录。你可以通过右侧任意一种方式观察体系生长过程：

### Git 日志观察

```bash
# 在 .cursor/ 目录（git 仓库根目录）查看自生长相关提交
cd .cursor
git log --oneline --grep="OpenCLI自生长"

# 查看最近 N 次自生长
cd .cursor
git log --oneline -10 --grep="OpenCLI自生长"

# 查看某次自生长的具体变更
cd .cursor
git show <commit-hash>
```

### Git 推送记录观察

```bash
# 推送到远端后，在 GitHub / GitLab / Gitee 的提交历史中搜索「OpenCLI自生长」
cd .cursor
git push
```

然后在远程仓库的 Commit 页面可以清晰看到每次自生长的记录，
每条 commit 带有统一的前缀表情符号，方便肉眼追踪。

### Commit 约定

| 类型 | 表情 | commit message 格式 | 示例 |
|------|:----:|---------------------|------|
| **新增场景** | 🏗️ | `🏗️ OpenCLI自生长: 新增场景「{名称}」(日期)` | `🏗️ OpenCLI自生长: 新增场景「配网批量上传」(2026-06-02)` |
| **新增子 skill** | 🌱 | `🌱 OpenCLI自生长: 新增子 skill「{名称}」(N 文件)(日期)` | `🌱 OpenCLI自生长: 新增子 skill「配网批量上传」(14 文件)(2026-06-02)` |
| **会话日志** | 📝 | `📝 OpenCLI自生长: 新增会话日志「{session}-{date}」(日期)` | `📝 OpenCLI自生长: 新增会话日志「nebula-ux-20260602」(2026-06-02)` |

> 💡 **提示**：每次自生长后，切换回 IDE 查看 Source Control 面板即可看到待推送的 commit。
> 定期 `cd .cursor && git push` 后，远程仓库的提交历史就是完整的自生长时间线。
