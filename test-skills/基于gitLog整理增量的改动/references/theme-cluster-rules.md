# 主题聚类规则

## 原则

- `cluster_key` 返回**主题 id**（如 `租户-创建流程`），不拼域名前缀
- 每个主题 → 一个 `Pxxx` 问题根
- **禁止**按域名 mega 合并（见 `assets/.../before/RED-baseline.md`）

## 子问题

仅 `configs/nebula-huiyan.theme-groups.json` 中两组：

- `route-auth`：守卫 vs 读侧
- `secret-input`：组件 vs 依赖升级

其余主题：**问题 → 提交**（同主题多 commit 写在「差分同题说明」）

## 配置 SSOT

- `configs/nebula-huiyan.theme-rules.json` — themeTitle + clusterRules（正则顺序敏感）
- `configs/nebula-huiyan.theme-groups.json` — 子问题组

## 验收

对照 `assets/few-shot-example/nebula-0707-0807/after/acceptance.md`
