---
name: 策略-选择传输协议
description: 根据部署场景，决定 MCP Server 使用 HTTP / SSE / stdio 传输
---

# 策略-选择传输协议

## 职责

根据用户场景，选择最合适的 MCP 传输协议。

## 决策树

```
用户需要远程访问？
  ├─ 是 → 需要浏览器 SSE 推送？
  │   ├─ 是 → SSE（单向推送，适合状态监控）
  │   └─ 否 → HTTP（Streamable HTTP，双向，stateless，最通用）
  └─ 否 → AI Agent 与本机在同一进程？
      ├─ 是 → stdio（零网络开销，性能最佳）
      └─ 否 → HTTP（本地回环 127.0.0.1，简单可靠）
```

## 各协议对比

| 特性 | stdio | HTTP (streamable-http) | SSE |
|------|-------|------------------------|-----|
| 远程访问 | ❌ 仅本地 | ✅ 任意主机 | ✅ 任意主机 |
| 启动复杂度 | 极低 | 低 | 中 |
| 性能 | 最高 | 高 | 中 |
| 适用场景 | 本机 Agent 调用 | 远程 Agent / 多客户端 | 监控/推送场景 |
| 端口占用 | 无 | 需要（默认 8000） | 需要 |
| 防火墙要求 | 无 | 放行端口 | 放行端口 |
| MCP Client 连接方式 | command + args | url + type=http | url + type=sse |

## 推荐配置

- **本地 Agent（Reasonix / OpenCode / Claude Code）** → stdio 或 HTTP
- **局域网远程访问（Hermes / 其他机器）** → HTTP
- **互联网暴露** → HTTP + 反向代理（Nginx） + HTTPS
