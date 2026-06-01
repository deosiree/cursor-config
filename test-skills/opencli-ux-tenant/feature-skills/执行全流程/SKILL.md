---
name: 执行全流程
description: 执行租户管理完整 CRUD 流程：登录 → 创建 → 搜索校验 → 删除 → 空列表校验。
---

# 核心任务

基于已确定的 profile 和租户数据，驱动 OpenCLI browser 完成步骤 1-10 全流程。

## 何时触发

- `intention-skills/判断执行场景` 输出 `selectedFlow=full_flow`

## 输入 / 前置条件

- `selectedProfile` — 环境名
- `tenantName` — 租户名
- `skipLogin` — 是否跳过登录
- `confirmed` — 用户已确认执行（来自 SKILL.md 的执行前确认步骤）
- 以下环境就绪：
  - `opencli doctor` 通过
  - 配置文件存在
  - 密码已配置（如远程）

## 执行前二次确认

```text
即将在 {selectedProfile} 环境执行租户全流程：
  租户名: {tenantName}
  登录:   {skipLogin}
  包含:   创建 → 搜索 → 删除 → 再搜索
确认继续？(y/N)
```

用户确认后才执行命令。

## 执行命令

```bash
cd .cursor/test-skills/opencli-ux-tenant

# 带登录的全流程
bash run-e2e.sh --profile <selectedProfile>

# 跳过登录（已有 session）
bash run-e2e.sh --profile <selectedProfile> --skip-login

# 指定租户名（通过环境变量）
UX_TENANT_NAME=<customName> bash run-e2e.sh --profile <selectedProfile>
```

## 输出

- 标准输出：步骤日志 + 最终断言结果
- 退出码：
  - `0` — 全部通过
  - `1` — 脚本内部错误（配置/依赖/参数问题）
  - `2+` — 测试断言失败（具体步骤见日志）
- 失败时：`screenshots/die-{时间戳}.png + .txt`

## 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--profile NAME` | `local` | 环境配置名，见 `config/ux-test.config.json` 的 `profiles` |
| `--skip-login` | 不跳过 | 复用已有 browser session，跳过登录步骤 |
| `--check` | - | 自检模式：仅输出环境诊断，不执行测试 |

## 步骤对应

| 步骤 | 脚本函数 | 预期 |
|------|---------|------|
| 1 | 打开租户页 → 新增 | 弹窗出现 |
| 2 | 填写表单 | 字段填入 |
| 3-5 | 下一步 → 选项目 → 下一步 | 步骤推进 |
| 6 | 确定提交 | 提示成功 |
| 7 | 搜索 → assert 1 | 找到 1 条 |
| 8-9 | 更多 → 删除 → 确定 | 提示删除成功 |
| 10 | 搜索 → assert 0 | 空列表 |

## 边界

- 不负责诊断失败原因（交给 `诊断失败原因`）
- 不负责清理残留状态（交给 `诊断与清理`）
- 不判断用哪个 profile（交给 `判断执行场景`）

## 部分失败处理

| 失败位置 | 影响 | 恢复策略 |
|---------|------|---------|
| 登录（步骤 0-5） | 全部阻塞 | 检查账号密码和验证码模式 → 修复后重试 |
| 创建表单（步骤 2-3） | 无法创建 | 可能租户名已存在 → 换名或先手动清理 |
| 选项目（步骤 4-5） | 无法推进 | 项目不存在 → 改 `tenantData.projectName` |
| 删除（步骤 8-9） | 租户残留 | 先 `bash scripts/cleanup.sh` 再重试 |
| 搜索断言（步骤 7/10） | 部分断言失败 | 检查截图判断是搜索超时还是逻辑错误 |
