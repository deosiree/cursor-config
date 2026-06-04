---
name: 诊断与清理
description: 测试失败后诊断根因、清理残留弹窗和搜索框，恢复页面到可重试状态。
---

# 核心任务

测试执行失败后，分析失败现场，清理浏览器状态，使环境可重试。

## 何时触发

- 从 `intention-skills/诊断失败原因` 路由进入
- 用户说"跑失败了，帮我看看"或"帮我清理一下"

## 输入 / 前置条件

- `screenshots/die-*.png` 和 `die-*.txt` 文件
- 测试执行的标准输出
- 使用的 profile 名

## 诊断操作

```bash
# 查看最近的失败现场
ls -lt screenshots/ | head -5

# 读取失败日志
cat screenshots/die-最新时间戳.txt

# 查看当前浏览器状态
opencli browser nebula-ux state
opencli browser nebula-ux get url
```

## 清理操作

```bash
cd opencli-ux-tenant

# 关闭残留弹窗、清除搜索框
bash scripts/cleanup.sh --profile <profile>

# 自检确认环境正常
bash run-e2e.sh --check --profile <profile>
```

## 输出

- `rootCause` — 根因（配置/网络/验证码/项目缺失/租户已存在/超时/其他）
- `screenshotPath` — 关联截图路径（如 `screenshots/die-20260520-143022.png`）
- `logSnippet` — 关键错误日志片段
- `fixDescription` — 修复建议
- `fixCommand` — 具体修复命令（如有）
- `cleaned` — 是否已清理（true/false）
- `readyToRetry` — 是否可以重试（true/false）

## 退出码

| 退出码 | 含义 |
|--------|------|
| `0` | 诊断完成，已清理，可重试 |
| `1` | 诊断完成但无法自动清理（需人工介入） |
| `2` | 诊断失败（screenshots/ 为空，无法诊断） |

## 边界

- 只负责诊断和清理，不重试执行（重试应由用户发起或路由回 `执行全流程`）
- 如果 screenshots/ 为空，说明失败在脚本启动阶段（opencli 未就绪）
