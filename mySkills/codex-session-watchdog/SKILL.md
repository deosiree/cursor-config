---
name: codex-session-watchdog
description: Use when Codex 对话执行可能卡住或等待过长，需要监控会话活跃度与资源占用并通过系统通知提醒用户是否中断。
---

# 目标
在 Codex 长时间无回复或机器资源异常时，主动弹出系统通知，避免用户长时间空等。

## 执行步骤
1. 先定位会话心跳文件（优先日志或会话输出文件）。
2. 启动 `scripts/watchdog.ps1` 持续监控。
3. 命中告警条件后，发送 Windows Toast 通知并给出中断建议。
4. 记录触发原因（超时/CPU/内存），用于后续复盘。

## 告警条件（默认）
1. 会话心跳文件超过 12 分钟未更新。
2. 系统 CPU 连续 3 次采样高于 85%。
3. 目标进程总内存高于 3000 MB。

## 快速命令
```powershell
pwsh -File .cursor/mySkills/codex-session-watchdog/scripts/run-watchdog.ps1 \
  -MaxHeartbeatAgeMinutes 30 \
  -AutoStopOnIdleAlert \
  -IdleMinutes 12 \
  -CpuThresholdPercent 85 \
  -ProcessMemoryThresholdMB 3000 \
  -ProcessPattern "codex|node|pwsh"
```

## 自动触发（登录自启动）
```powershell
pwsh -File .cursor/mySkills/codex-session-watchdog/scripts/install-autostart.ps1 `
  -MaxHeartbeatAgeMinutes 30 `
  -AutoStopOnIdleAlert
```

立即触发一次（不等下次登录）：
```powershell
schtasks /run /tn CodexSessionWatchdog
```

卸载自动启动：
```powershell
pwsh -File .cursor/mySkills/codex-session-watchdog/scripts/uninstall-autostart.ps1
```

## 输出要求
1. 明确告警类型：`idle-timeout` / `high-cpu` / `high-memory`。
2. 给出建议动作：继续等待 / 中断重试 / 降载后重试。
3. 保留最近一次触发时间与阈值。

## 外部参考（公开实现）
1. `codex-monitor`（会话监控方向）：https://playbooks.com/skills/openclaw/skills/codex-monitor
2. `ClawGuard`（资源监控与告警方向）：https://github.com/aeon0199/ClawGuard
