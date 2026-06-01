# OpenCLI 角色 Tab 校验跳转自动化测试

基于 [OpenCLI](https://github.com/jackwener/OpenCLI) `browser` 子命令，验证 [`useTabValidation`](../../../apex_dev/src/composables/useTabValidation.ts) 在角色新增弹窗中的 Tab 跳转行为。

## 前置条件

1. **OpenCLI + Chrome 扩展**

   ```bash
   npm install -g @jackwener/opencli
   opencli doctor   # 需全部 OK
   ```

2. **Python 3**（读取/合并 JSON 配置）

3. **Git Bash 或 WSL**（Windows 下推荐）

4. **本地开发**

   - `microfb`：`http://localhost:8080` 已启动
   - `apex_dev`：`8081` 已注册为子应用

## 快速开始

```bash
cd .cursor/test-skills/opencli-ux-role-tab-validation

# 全流程（登录 + TC1~TC4）
bash run-e2e.sh --profile local

# 已登录，只跑角色 Tab 用例
bash role-tab-validation.sh --profile local --skip-login
```

## 测试用例

| 用例 | 步骤 | 期望 |
|------|------|------|
| TC1 | 新增角色 → 不填名 → 切「关联设备」→ 确定 | 跳回「基础信息」，显示「角色名称不能为空」 |
| TC2 | 新增角色 → 不填名 → 切「菜单权限」→ 确定 | 同上 |
| TC3 | 新增角色 → 填合法名 → 确定 | 弹窗关闭或 toast「新增成功」 |
| TC4 | 新增 → 切「关联设备」→ 取消 → 再新增 | 默认 Tab 为「基础信息」 |

**本轮跳过**：设备列表加载失败 → 跳转「关联设备」+ warning toast。

## 配置

| 文件 | 说明 |
|------|------|
| [`config/ux-test.config.json`](config/ux-test.config.json) | profile、rolePath、测试角色名前缀 |
| `config/ux-test.config.local.json` | 本地覆盖（gitignore），用于远程密码 |

Session 名默认 `nebula-ux`，与 [`opencli-ux-tenant`](../opencli-ux-tenant) 共用，可复用登录态。

## 失败排查

```bash
opencli browser nebula-ux screenshot screenshots/fail-tc1-tab.png
opencli browser nebula-ux state
opencli browser nebula-ux get url
```

常见原因：

- `localhost:8080` / `8081` 未启动
- 未登录或 session 过期 → 重新 `bash login.sh --profile local`
- 图形验证码 → 将 profile `captchaMode` 改为 `manual`

## 脚本说明

| 脚本 | 作用 |
|------|------|
| `run-e2e.sh` | 入口：登录 + TC1~TC4 |
| `role-tab-validation.sh` | 核心用例 |
| `login.sh` | 仅登录 |
| `lib/common.sh` | OpenCLI 封装与断言 |
| `lib/config.sh` | 加载 profile |
