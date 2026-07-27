---
name: 诊断-DNS配置
description: 检查 fake-ip 模式、fake-ip-filter 列表，判断是否存在 DNS 劫持
version: 1.0.0
tags: [诊断, DNS, fake-ip]
parent: vpn和tun模式绕过内网
---

# 目标

检查 VPN 的 DNS 配置，判断是否使用 fake-ip 模式，以及 fake-ip-filter 中是否包含本地地址。

## 执行逻辑

```python
def diagnose_dns_config(config_path):
    import yaml
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    dns = config.get('dns', {})
    enhanced_mode = dns.get('enhanced-mode', 'redir-host')
    fake_ip_filter = dns.get('fake-ip-filter', [])
    
    # 检查是否包含本地地址
    local_filters = ['localhost', '127.0.0.1', '*.local', '*.lan']
    has_local_filter = any(f in fake_ip_filter for f in local_filters)
    
    return {
        "enhancedMode": enhanced_mode,
        "fakeIpRange": dns.get('fake-ip-range', 'N/A'),
        "fakeIpFilter": fake_ip_filter,
        "hasLocalFilter": has_local_filter,
        "hasDnsHijack": enhanced_mode == 'fake-ip' and not has_local_filter
    }
```

## 输出格式

```json
{
  "enhancedMode": "fake-ip",
  "fakeIpRange": "28.0.0.1/8",
  "fakeIpFilter": ["*.lan", "*.localdomain", "*.local"],
  "hasLocalFilter": true,
  "hasDnsHijack": false,
  "analysis": "fake-ip 模式已开启，filter 中包含 *.local，本地地址不会被劫持"
}
```

## 判断标准

**存在 DNS 劫持的条件**：
1. `enhanced-mode: fake-ip`
2. `fake-ip-filter` 中**不包含**以下任一项：
   - `localhost`
   - `127.0.0.1`
   - `*.local`
   - `*.lan`

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
