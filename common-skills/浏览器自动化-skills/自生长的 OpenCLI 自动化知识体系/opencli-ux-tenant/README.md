# OpenCLI 租户管理 UX 自动化测试套件

基于 [OpenCLI](https://github.com/jackwener/OpenCLI) `browser` 子命令，自动完成：**登录（microfb）→ 租户创建 → 列表校验 → 删除 → 空列表校验** 全流程。

## 快速开始

```bash
cd opencli-ux-tenant

# 本地环境（默认 admin@system.local / 123456）
bash run-e2e.sh

# 远程环境（需先配置密码，见下文）
bash run-e2e.sh --profile cloud

# 仅登录
bash login.sh --profile local

# 已登录，只跑租户段
bash run-e2e.sh --profile local --skip-login

# 自检模式：查看配置概览和环境诊断（不执行测试）
bash run-e2e.sh --check
```

---

## 前置条件

| 依赖 | 说明 | 安装方式 |
|------|------|----------|
| **OpenCLI** | 浏览器自动化 CLI | `npm install -g @jackwener/opencli` |
| **Chrome + 扩展** | OpenCLI 桥接 | 运行 `opencli doctor` 确认全部 OK |
| **jq 或 Python 3** | JSON 配置合并（优先 jq） | `winget install jqlang.jq` 或装 Python |
| **Git Bash / WSL** | 运行 `.sh` 脚本 | Windows 推荐，勿用 cmd |

```bash
# 验证环境
opencli doctor
```

---

## 配置文件

| 文件 | 用途 |
|------|------|
| `config/ux-test.config.json` | 仓库内置：profile 定义 + 租户测试数据（版本管理） |
| `config/ux-test.config.local.json` | 本地覆盖：远程环境的真实密码（已 gitignore） |
| `config/ux-test.config.local.json.example` | 本地文件模板 |

### 配置密码（远程环境必须）

```bash
cp config/ux-test.config.local.json.example config/ux-test.config.local.json
# 编辑该文件，将 profiles.cloud.password 等改为真实密码
```

### 内置 Profile

| Profile | baseUrl | 默认账号 | captchaMode | 用途 |
|---------|---------|---------|-------------|------|
| `local` | http://localhost:8080 | admin@system.local | auto | 本地开发 |
| `cloud` | https://cloud.lanniu.top | admin@system.local | manual | 正式环境 |
| `t-cloud` | https://t-cloud.lanniu.top | admin@system.local | manual | 测试环境 |
| `ip-47` | http://47.103.23.246 | admin@system.local | manual | IP 直连 |
| `phone-user` | https://cloud.lanniu.top | 13813815913 | bind-only | 手机号用户 |

### 环境变量

| 变量 | 作用 | 示例 |
|------|------|------|
| `UX_PROFILE` | 指定 profile，等价 `--profile` | `UX_PROFILE=cloud bash run-e2e.sh` |
| `UX_TENANT_NAME` | 锁定租户名（由 run-e2e.sh 自动设置，子脚本继承） | 一般无需手动设 |
| `UX_PYTHON` | 指定 Python 解释器路径 | `UX_PYTHON=/usr/bin/python3` |

---

## 测试步骤（对应业务用例 1-10）

| 步骤 | 操作 | 预期 |
|------|------|------|
| **1** | 打开租户页 → 点击 **新增** | 弹出创建向导（基础信息） |
| **2** | 填写租户名、用户名、选择「密码直设」、密码/确认密码、手机、邮箱 | 表单可提交 |
| **3** | 点击 **下一步**（基础信息 → 关联项目） | 进入项目列表 |
| **4** | 勾选项目 `test_plat`（可在 `tenantData.projectName` 修改） | 复选框选中 |
| **5** | 点击 **下一步**（关联项目 → 角色确认） | 显示角色信息 |
| **6** | 点击 **确定** 提交创建（最后一步为「确定」，非「下一步」） | 提示「新增租户成功」 |
| **7** | 搜索框输入租户名 → 点击 **搜索** → 断言列表 **有且仅有 1 条** | 创建成功已验证 |
| **8** | 该行操作列 → **更多** → **删除** | 弹出确认弹窗 |
| **9** | 弹窗点击 **确定** → 等待「删除成功」 | 删除完成 |
| **10** | **再次搜索**同一租户名 → 断言列表 **0 条** | 删除已确认 |

---

## 验证码 / MFA 策略

| captchaMode | 行为 | 适用场景 |
|-------------|------|----------|
| `auto` | 无验证码则继续；有则自动报错退出 | 本地开发（无验证码） |
| `manual` | 暂停，等待人工输入验证码后按 Enter（**120s 超时**） | 远程环境有图形验证码 |
| `bind-only` | 不自动登录；提示人工绑定 | 需要手机验证码 / MFA |
| `skip` | 完全跳过验证码检查 | 调试用 |

**遇到 MFA 二次验证**：换无 MFA 账号，或用 `bind-only` 模式手动登录后 `--skip-login`。

---

## 失败排查

### 自动保存的现场信息

脚本失败时（`die()`）自动在 `screenshots/` 目录保存：

- `die-{时间戳}.png` — 页面截图
- `die-{时间戳}.txt` — 错误描述 + URL + 页面标题 + 弹窗内容

### 手动排查命令

```bash
# 查看当前页面状态
opencli browser nebula-ux state

# 截图
opencli browser nebula-ux screenshot screenshots/debug.png

# 获取当前 URL
opencli browser nebula-ux get url
```

### 常见原因

| 现象 | 原因 | 解决 |
|------|------|------|
| `password 为 CHANGE_ME` | 远程环境密码未配置 | `cp config/ux-test.config.local.json.example config/ux-test.config.local.json` 并填入密码 |
| `opencli doctor` 未通过 | Chrome 扩展未安装或桥接异常 | 运行 `opencli doctor` 查看具体问题 |
| 无法打开登录页 | 本地服务未启动 | 检查 `localhost:8080` |
| 步骤 4 卡在表单校验 | 租户名已存在或必填项缺失 | 换租户名或手动清理 |
| 步骤 5 找不到项目 | 环境无 `test_plat` 项目 | 修改 `tenantData.projectName` |
| `captchaMode=auto` 报错 | 页面出现图形验证码 | 切换 `manual` 或 `bind-only` |
| 步骤 7 一直找不到租户 | 创建未成功或搜索超时 | 查看截图 `screenshots/` 目录 |

---

## 脚本一览

| 脚本 | 职责 | 用法 |
|------|------|------|
| `run-e2e.sh` | **入口**：登录 + 租户全流程 | `bash run-e2e.sh [--profile NAME] [--skip-login] [--check]` |
| `login.sh` | 仅登录流程 | `bash login.sh [--profile NAME]` |
| `tenant-create-delete.sh` | 步骤 1-10：创建 → 查询 → 删除 → 再查询 | `bash tenant-create-delete.sh [--profile NAME]` |
| `tenant-search-delete.sh` | 步骤 7-10：搜索 → 删除 → 再搜索 | `bash tenant-search-delete.sh [--profile NAME]` |
| `lib/config.sh` | 配置加载模块（被 common.sh source） | 不直接调用 |
| `lib/common.sh` | 公共函数库：OpenCLI 包装、断言、日志、失败截屏 | 被所有入口脚本 source |
| `config/ux-test.config.json` | 环境配置 + 租户测试数据 | 编辑 profile 和 tenantData |

所有入口脚本均支持 `--check` 自检模式，输出配置概览和环境诊断。

---

## 注意事项

- Session 名默认为 `nebula-ux`（可在配置 `sessionName` 修改）
- UI 文案差异：用例中的「新建」在页面上为 **「新增」**（已处理）
- 创建向导三步：**基础信息 → 关联项目 → 角色确认**
- 租户数据固定，每次跑完自动删除，无需随机后缀
- 可重复执行：若某步失败，清理后重试即可
