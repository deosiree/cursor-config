---
name: 修复-fake-ip过滤
description: 在 fake-ip-filter 中添加本地地址和内网域名，防止 DNS 劫持
version: 1.0.0
tags: [修复, DNS, fake-ip-filter]
parent: vpn和tun模式绕过内网
---

# 目标

修改 VPN 配置文件的 `fake-ip-filter` 列表，添加本地地址和内网域名，防止被解析成虚假 IP。

## 何时使用

- 诊断结果显示：DNS 劫持问题
- 使用 `enhanced-mode: fake-ip`
- `fake-ip-filter` 中缺少本地地址

## ⚠️ 注意

此方法**只解决 DNS 劫持**，不解决路由劫持。如果同时存在路由劫持，推荐直接使用 [[../修复-TUN路由排除]]。

## 配置修改

在 `dns` 部分的 `fake-ip-filter` 中添加：

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 28.0.0.1/8
  fake-ip-filter:
    # ========== 本地地址（必须） ==========
    - 'localhost'
    - '127.0.0.1'
    - '*.local'
    - '*.lan'
    - '*.localdomain'
    
    # ========== 内网域名（按需添加） ==========
    - '+.yourdomain.com'    # 替换成你的内网域名
    - 't-cloud.lanniu.top'  # 示例：真实案例中的域名
    
    # ========== 原有配置保留 ==========
    - '*.example'
    - '*.invalid'
    # ... 其他原有过滤规则
```

## 执行步骤

```python
def add_fake_ip_filter(config_path, custom_domains=[]):
    import yaml
    
    # 读取配置
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    # 确保 dns 配置存在
    if 'dns' not in config:
        config['dns'] = {}
    
    # 获取或创建 fake-ip-filter
    filter_list = config['dns'].get('fake-ip-filter', [])
    
    # 添加标准本地地址
    standard_filters = [
        'localhost',
        '127.0.0.1',
        '*.local',
        '*.lan',
        '*.localdomain'
    ]
    
    for f in standard_filters + custom_domains:
        if f not in filter_list:
            filter_list.append(f)
    
    config['dns']['fake-ip-filter'] = filter_list
    
    # 写回配置
    with open(config_path, 'w', encoding='utf-8') as f:
        yaml.dump(config, f, allow_unicode=True, default_flow_style=False)
    
    return {
        "added": len(standard_filters + custom_domains),
        "total": len(filter_list)
    }
```

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
