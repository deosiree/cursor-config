# OpenCLI — 通用浏览器自动化中心

> OpenCLI 的 `browser` 子命令不只是一个测试工具——它能驱动真实 Chrome，**模拟任何人工浏览器操作**，覆盖自动化测试、手动点击模拟、SPA 爬虫、数据提取等场景。

## 它能做什么

| 场景 | 说明 | 典型用途 |
|------|------|---------|
| **🧪 自动化测试** | 登录 → 操作 → DOM 断言 → 截图 | 端到端回归、表单校验、Tab 跳转校验 |
| **🖱️ 手动点击自动化** | 模拟人工点击、填写、选择 | 批量录入、定时任务、多账号操作 |
| **🕷️ 爬虫与数据提取** | JS 渲染后提取全文或结构化数据 | 飞书文档抓取、SPA 站点数据、动态内容采集 |
| **🔐 登录态复用** | 一次登录，跨 skill/会话复用 | 同一 session 名 `nebula-ux` 跨脚本共享 |

## 前置条件

```bash
# 1. 安装 OpenCLI
npm install -g @jackwener/opencli

# 2. 验证环境
opencli doctor            # 全部 OK 才能使用

# 3. Chrome 扩展已安装（opencli doctor 会引导）
```

## 快速开始

```bash
# 打开一个页面
opencli browser my-session open "https://example.com"

# 点击按钮
opencli browser my-session click --role button --name "登录"

# 填写输入框
opencli browser my-session fill --role textbox --name "用户名" "admin"

# 获取页面文本
opencli browser my-session extract

# 截图
opencli browser my-session screenshot ./debug.png
```

## 已有 Skill 速查

以下已有 skill 可直接使用，无需重复编写：

| Skill | 路径 | 场景 |
|-------|------|------|
| OpenCLI 角色 Tab 校验 | `.cursor/test-skills/opencli-ux-role-tab-validation/` | 弹窗 Tab 切换校验 + 表单错误断言 |
| OpenCLI 租户管理 | `.cursor/test-skills/opencli-ux-tenant/` | 租户创建 → 列表校验 → 删除 → 空列表校验 |
| OpenCLI 下载飞书文档 | `.cursor/common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档/` | 飞书文档全文抓取保存为 Markdown |

## 文件结构

```
浏览器自动化-skills/OpenCLI/
├── SKILL.md                    # Agent 路由逻辑（按场景分发）
├── README.md                   # 本文件（人类说明）
└── references/
    ├── source-map.md           # 外部引用总览
    ├── 场景-自动化测试.md       # 测试场景 → 引用 test-skills
    ├── 场景-手动点击自动化.md    # 手动操作场景 → 通用命令指南
    └── 场景-爬虫与数据提取.md    # 爬虫场景 → 引用探索skills
```

## 与探索技能 OpenCLI-下载飞书文档 的关系

`探索skills/feature-skills/OpenCLI-下载飞书文档` 专注于**飞书文档**这个特定目标的提取，是本中心"爬虫与数据提取"场景的一个**具体实现示例**。本中心在此基础上扩展 SPA 爬虫和结构化数据提取的通用模式。

## 跨 skill session 共享

所有引用本中心的 skill 应使用**相同的 session 名称**（默认 `nebula-ux`），以便复用登录态：

```bash
# 先登录
opencli browser nebula-ux open "http://localhost:8080/login"
# ... 完成登录操作 ...

# 后续任何 skill 使用同 session 名即可跳过登录
opencli browser nebula-ux get url
```

## 工具选型：何时用 OpenCLI vs 替代品

| 工具 | 需要真实浏览器 | JS 渲染 | 可编程断言 | 跨平台 CI | 典型场景 |
|------|:------------:|:-------:|:---------:|:---------:|---------|
| **OpenCLI** | ✅ 真实 Chrome | ✅ | ✅ shell 脚本 | ❌ 需 Chrome 扩展 | 本地自动化测试 / 手动操作 / SPA 爬虫 |
| **Playwright** | ✅ 可无头 | ✅ | ✅ 全语言 API | ✅ 完善 | 专业 E2E 测试 / CI 流水线 |
| **Puppeteer** | ✅ 可无头 | ✅ | ✅ Node.js API | ✅ 完善 | Chrome 专用自动化 / 截图生成 |
| **web_fetch** | ❌ 无浏览器 | ❌ 空壳 HTML | ❌ 只读 | ✅ HTTP 即可 | 静态页面内容提取 |
| **Selenium** | ✅ 多浏览器 | ✅ | ✅ 多语言 | ✅ 完善 | 跨浏览器兼容性测试 |

**选型建议：**
- 已装 Chrome + 要操作真实浏览器（点击/填写/截图）→ **OpenCLI**（最轻量，一行命令）
- 需要 CI 流水线 + 高级等待策略 → **Playwright**
- 只需提取静态 HTML → **web_fetch**（最简单，依赖零安装）
- 需要跨浏览器兼容性测试 → **Selenium**

## 故障排查速查

| 症状 | 最可能原因 | 修复 |
|------|----------|------|
| `opencli: command not found` | 未安装 | `npm install -g @jackwener/opencli` |
| `opencli doctor` 显示 `✗` | 浏览器桥接未连接 / Chrome 扩展未装 | 按 doctor 提示安装扩展并启动 daemon |
| `click --name "确定"` 无反应 | Button 文本含空格/图标，role 定位不到 | 用 `eval "document.querySelector(...).click()"` 兜底 |
| `fill --role textbox` 值填了但页面没反应 | 框架（Vue/React）未触发 input 事件 | 用 eval + `dispatchEvent(new Event('input', {bubbles:true}))` |
| `extract` 返回空或极少内容 | SPA 未渲染完 / 页面需要滚动加载 | 先 `wait text` 等关键元素出现，再 extract |
| Session 过期 / 回到登录页 | 登录态超时 | 重新执行 login 流程 或 `opencli browser <session> bind` |
| `wait text` 超时 | 页面未加载 / 文本不存在 | 先 `screenshot` 查看当前页面状态 |
| Windows 下 `.sh` 报错 | 纯 cmd 而非 Git Bash | 用 Git Bash 或 WSL 运行 |
| opencli 命令卡住不返回 | daemon 进程崩溃 | `opencli doctor` 检查，重启终端 |

> Windows 用户推荐使用 **Git Bash** 或 **WSL** 运行 `.sh` 脚本，勿用纯 cmd。
