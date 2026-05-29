# OpenCLI 租户管理 UX 自动化测试

基于 [OpenCLI](https://github.com/jackwener/OpenCLI) `browser` 子命令，完成：**登录（microfb）→ 租户创建 → 列表校验 → 删除 → 空列表校验**。

## 前置条件

1. **OpenCLI + Chrome 扩展**

   ```bash
   npm install -g @jackwener/opencli
   opencli doctor   # 需全部 OK
   ```

2. **Python 3**（读取/合并 JSON 配置）

3. **Git Bash 或 WSL**（Windows 下推荐，勿用纯 cmd 跑 `.sh`）

4. **本地开发**：`microfb` 在 `http://localhost:8080` 已启动，且子应用 `apex_dev` 已注册（租户页可访问）

## 快速开始

```bash
cd .cursor/test-skills/opencli-ux-tenant

# 默认 profile=local（admin@system.local / 123456）
bash run-e2e.sh

# 指定环境
bash run-e2e.sh --profile cloud

# 仅登录
bash login.sh --profile local

# 已登录，只跑租户流程
bash run-e2e.sh --profile local --skip-login
```

## 配置文件

| 文件 | 说明 |
|------|------|
| [`config/ux-test.config.json`](config/ux-test.config.json) | 仓库内 profile、租户测试数据 |
| `config/ux-test.config.local.json` | 本地覆盖（已 gitignore），用于真实密码 |
| [`config/ux-test.config.local.json.example`](config/ux-test.config.local.json.example) | 本地文件示例 |

复制示例并填写远程环境密码：

```bash
cp config/ux-test.config.local.json.example config/ux-test.config.local.json
# 编辑 profiles.cloud.password 等
```

### 内置 Profile

| Profile | baseUrl | 账号（默认） | captchaMode |
|---------|---------|-------------|-------------|
| `local` | http://localhost:8080 | admin@system.local | auto |
| `cloud` | https://cloud.lanniu.top | admin@system.local | manual |
| `t-cloud` | https://t-cloud.lanniu.top | admin@system.local | manual |
| `ip-47` | http://47.103.23.246 | admin@system.local | manual |
| `phone-user` | https://cloud.lanniu.top | 13813815913 | bind-only |

环境变量：

- `UX_PROFILE=cloud` — 等价 `--profile cloud`
- 租户数据固定为 `config/ux-test.config.json` 中 `tenantData`（默认租户名 `tenant0529`）；每次跑完会删除，无需随机后缀
- `run-e2e.sh` 在父进程锁定 `UX_TENANT_NAME`，确保创建与步骤 7–10 搜索均为同一租户名

## 测试步骤（租户段）

对应业务用例 1–10：

1. 打开租户页，点击 **新增**
2. 填写租户名、用户名、激活方式「密码直设」、密码/确认密码、手机、邮箱
3. **下一步**（基础信息 → 关联项目）
4. 勾选项目 `test_plat`（可在 config `tenantData.projectName` 修改）
5. **下一步**（关联项目 → 角色确认）
6. **确定** 提交创建（最后一步 footer 为「确定」，非「下一步」）
7. 在搜索框输入租户名并点 **搜索**，断言列表 **有且仅有 1 条**
8. 在该行操作列点 **更多 → 删除**（不会误点工具栏批量删除）
9. 在 `ElMessageBox` 弹窗点 **确定**，等待「删除成功」
10. **再次搜索**同一租户名，断言列表 **0 条**（确认已删掉）

## 验证码 / MFA

| captchaMode | 行为 |
|-------------|------|
| `auto` | 无验证码则继续；有则失败并提示 |
| `manual` | 暂停，人工输入验证码后按 Enter |
| `bind-only` | 不自动登录；提示 `opencli browser nebula-ux bind` |

出现 **MFA 二次验证** 时：换无 MFA 账号，或使用 bind-only + 人工登录后 `--skip-login` 跑租户脚本。

## 失败排查

```bash
opencli browser nebula-ux screenshot screenshots/debug.png
opencli browser nebula-ux state
opencli browser nebula-ux get url
```

常见原因：

- `CHANGE_ME` 未在 local.json 覆盖密码
- localhost:8080 未启动
- 租户名已存在 → 设置 `TENANT_NAME_SUFFIX`
- 环境无 `test_plat` 项目
- 图形验证码 → `manual` 或 `bind-only`

## 脚本说明

| 脚本 | 作用 |
|------|------|
| `run-e2e.sh` | 入口：登录 + 租户全流程 |
| `login.sh` | 仅登录 |
| `tenant-create-delete.sh` | 仅租户（需已登录 session） |
| `tenant-search-delete.sh` | 仅步骤 7-10（查询 → 删除 → 再查询） |
| `lib/config.sh` | 加载 profile |
| `lib/common.sh` | OpenCLI 封装与断言 |

Session 名默认 `nebula-ux`（可在配置 `sessionName` 修改）。

## 与 UI 文案差异

- 用例中的「新建」在页面上为 **「新增」**（已按源码处理）
- 创建向导三步：**基础信息 → 关联项目 → 角色确认**
