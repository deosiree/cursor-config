# mvp-03：新模块权限配置最小闭环

> 基于 commit `1851a7dd` 路由作用域方案的最短可验证路径。  
> 对应 write-skill「真实历史样本型模板 — 写 mvp」。

## 最小可复现路径

```
用户：帮我在新模块 /Apex/foo 配置权限点
  → 1. 编排-新模块权限配置
  → 2. 分析-perms-apis现状（仅 /Apex/foo）
  → 3. 策略-设计权限点（产出三件套：routePath + paramsDecision + functionPermList）
  → 4. 生成菜单树权限补丁（YAML + id 回填）
  → 5. 菜单树导入验证（dry_run → 正式）
  → 6. 迁移-源码改动落地（v-hasPerm + pageGate）
  → 7. 权限运行时排障（RoutePermDict.getScope 验证）
```

## 为什么这是最小闭环

- **包含**路由作用域三件套（旧 mvp-01 无此步骤）
- **跳过**全流程多方案比较（不需要 `编排-权限点配置全流程`）
- **跳过** E2E CSV 落盘（可后续补）
- **包含**菜单导入（否则 routeProjectMap 无节点，allowed 恒空）

## 关键输入输出

| 步骤 | 输入 | 输出 |
|------|------|------|
| 分析 | 仓库 + `/Apex/foo` | 盘点文档 |
| 设计 | 盘点 + params 裁决 | 三件套 + perm→API 表 |
| 补丁 | 设计方案 | YAML（含 route_path + function code） |
| 导入 | YAML | dry_run OK + 正式导入 |
| 改码 | 设计方案 | v-hasPerm + PageNoPermission |
| 验证 | 已导入 + 已改码 | getScope/getAllowed 截图或日志 |

## 最小触发示例

```text
使用 $梳理权限点与apis，帮我在新模块 /Apex/foo 按路由作用域方案配置权限，
从分析到菜单导入可验证即可，暂不做 E2E CSV。
```

预期执行序列：

1. `编排-新模块权限配置`
2. `分析-perms-apis现状` → `扫描源码权限点与API`（focus `/Apex/foo`）
3. `策略-设计权限点`（强制 `routePathParamsPlan`）
4. `生成菜单树权限补丁`
5. `菜单树导入验证`
6. `迁移-源码改动落地`
7. `权限运行时排障`（确认 `ambiguous=false`）

## 不可跳过的门禁

- 三件套未产出 → 不进入补丁
- function id 未回填 → 不提交补丁
- 菜单未正式导入 → 不宣称「权限已生效」
- 排障仍查 permsMap → 视为未通过路由作用域验收

## 与 mvp-01 的差异

| mvp-01（2026-06-03） | mvp-03（2026-07-03） |
|---------------------|---------------------|
| 7 模块批量 | 单新模块 |
| 无 route params | 强制 paramsDecision |
| 跳过改码 | 包含集中式改码 |
| permsMap 时代 | RoutePermDict 时代 |
| 编排入口：全流程 / 分步 | 编排入口：`编排-新模块权限配置` |
