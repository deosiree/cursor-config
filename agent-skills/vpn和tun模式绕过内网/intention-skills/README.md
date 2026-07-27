# Intention Skills（判断与决策层）

本目录包含判断和决策类的 skills，负责分析问题、决策方案，不直接执行配置命令。

---

## Intention Skills 列表

### 1. 诊断-网络拓扑分析
**职责**：识别当前系统有几张网卡、哪张是内网、哪张是外网、是否有 TUN 虚拟接口。

**输入**：用户问题描述（可选）

**输出**：网络拓扑结构
```yaml
interfaces:
  - name: "以太网"
    type: "internal"
    ip: "10.17.77.153"
  - name: "WLAN"
    type: "external"
    ip: "172.20.10.5"
  - name: "FlClash"
    type: "tun"
    ip: "198.18.0.1"
```

**调用的 feature skills**：
- `执行-查询网络状态`

---

### 2. 分析-路由表与优先级
**职责**：分析当前路由表，识别 metric 冲突、缺失的静态路由、系统代理状态。

**输入**：网络拓扑 + 用户症状

**输出**：问题诊断报告
```yaml
issues:
  - type: "missing_static_route"
    severity: "high"
    fix: "添加静态路由"
  - type: "metric_conflict"
    severity: "medium"
    fix: "调整 WiFi metric"
```

**调用的 feature skills**：
- `执行-查询路由表`

---

### 3. 策略-配置方案决策
**职责**：根据问题诊断报告，决策需要执行哪些配置步骤、执行顺序。

**输入**：问题诊断报告

**输出**：配置决策清单
```yaml
steps:
  - step: 1
    action: "add_static_route"
    featureSkill: "执行-添加静态路由"
  - step: 2
    action: "adjust_wifi_metric"
    featureSkill: "执行-调整网卡跃点数优先级"
  - step: 3
    action: "configure_flclash"
    featureSkill: "执行-配置FlClash"
```

**调用的 feature skills**：
- 根据决策动态组合多个 feature skills

---

### 4. 验证-网络连通性测试
**职责**：执行内网 ping、外网 curl、浏览器访问测试，验证配置是否生效。

**输入**：测试目标列表（可选，有默认值）

**输出**：测试结果 + 故障排查建议（若失败）
```yaml
tests:
  - category: "internal"
    target: "10.17.196.39"
    result: "success"
  - category: "external"
    target: "www.google.com"
    result: "success"
```

**调用的 feature skills**：
- `执行-连通性测试`
- `故障排查-常见问题决策树`（若失败）

---

## Intention vs Feature 职责边界

| 类型 | 职责 | 特征 | 示例 |
|------|------|------|------|
| **Intention** | 判断、分析、决策、编排 | 不执行具体命令，组合调用 feature | "分析路由表，决定需要哪些配置" |
| **Feature** | 执行原子操作 | 执行具体命令，返回结构化结果 | "添加静态路由" |

---

## 调用流程

```
用户请求
    ↓
【Intention】诊断-网络拓扑分析
    ├→ 【Feature】执行-查询网络状态
    ↓
【Intention】分析-路由表与优先级
    ├→ 【Feature】执行-查询路由表
    ↓
【Intention】策略-配置方案决策
    ↓
【Feature】执行-添加静态路由
【Feature】执行-调整网卡跃点数优先级
【Feature】执行-配置FlClash
【Feature】执行-配置系统代理
【Feature】执行-重启服务
    ↓
【Intention】验证-网络连通性测试
    ├→ 【Feature】执行-连通性测试
    └→ 【Feature】故障排查-常见问题决策树（若失败）
```

---

## 设计原则

### 1. 单一职责
每个 intention skill 只负责一个判断/决策环节：
- 诊断 → 只识别网络拓扑
- 分析 → 只分析问题
- 决策 → 只决定配置方案
- 验证 → 只测试结果

### 2. 可组合
Intention skills 通过组合调用 feature skills 完成任务。

### 3. 声明式输出
输出是**描述性的**（"需要添加静态路由"），而不是**命令式的**（"route add ..."）。

### 4. 可扩展
新增 feature skill 不影响 intention skill 的逻辑。

---

## 使用示例

### 完整流程
```text
使用 $诊断-网络拓扑分析 识别网络结构
    ↓
使用 $分析-路由表与优先级 诊断问题
    ↓
使用 $策略-配置方案决策 生成配置计划
    ↓
按计划调用 feature skills 执行
    ↓
使用 $验证-网络连通性测试 验证结果
```

### 单独使用
```text
使用 $验证-网络连通性测试 测试当前配置是否正常
```
