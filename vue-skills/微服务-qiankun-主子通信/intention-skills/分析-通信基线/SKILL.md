---
name: 分析-通信基线
description: RED 阶段分析 qiankun 主子通信现状：notifyMainApp、globalStateSideEffects、getAppProps。Use when 排查同步、通信基线、前人实现、Storage 写了不更新。
---

# 分析-通信基线

## 何时使用

- 不确定项目是否已有 notify / sideEffect 实现
- 排查「子应用改了数据，主应用 UI 不变」
- 区分该走子→主 notify 还是主→子 props

## 何时不要使用

- message 与双端改动方案已明确 → 直达 [[编排-扩展notification]]
- 纯样式、axios、与 qiankun 无关

## 输入契约

| 字段 | 说明 |
|---|---|
| `targetRepo` | 含主应用 + 子应用路径 |
| `symptom` | 如「Navbar 不更新」「tab 不高亮」 |
| `syncTarget` | 期望更新的 UI 位置 |

## 步骤清单（可执行 rg）

在 `targetRepo` 根目录执行：

```bash
# 1. 子应用 notify 封装与调用点
rg "notifyMainApp|setGlobalState" --glob "*.ts" --glob "*.vue"

# 2. 主应用 sideEffect 注册表
rg "globalStateSideEffects|hasChangedByTimestamp" --glob "**/qiankun/**"

# 3. 主应用 props 下发
rg "getAppProps|setMicroAppProps" --glob "**/qiankun/**"

# 4. 已有 message 常量
rg "profile_username_updated|station_change_fromChild|microgrid_station_change" .
```

### nebula 证据锚点

| 步骤 | 文件 | 行号参考 |
|---|---|---|
| 子应用 notify | `apex_dev/src/plugins/qiankun/actions.ts` | L48-58 |
| 主应用 sideEffects | `microfb/src/plugins/qiankun/actions.ts` | L87-93, L192-198 |
| props 下发 | `microfb/src/plugins/qiankun/apps.ts` | L110-137 |

## 输出格式（必须完整输出）

```markdown
## existingMessages[]
- profile_username_updated (子→主, patchStore) — microfb actions.ts
- station_change_fromChild (子→主, customEvent) — microfb actions.ts

## fieldMappingGap
- 已统一 username；若仍不同步，查 notify / sideEffect 是否注册

## notifyCallSites[]
- apex_dev/src/views/profile/index.vue — 有/无 notify

## recommendedPattern
- 子→主 notify + sideEffect patchStore
- 或：主→子 getAppProps（若 symptom 仅 mount 后不对）

## nextDispatch
- 编排-扩展notification | 实现-主应用下发子应用 | Human Loop
```

## 失败分支

| 搜不到 | 含义 | 下一步 |
|---|---|---|
| 无 `notifyMainApp` | 子应用未接入协议 | GREEN 需新建封装 + 业务调用 |
| 无 `globalStateSideEffects` | 主应用未消费 | GREEN 需新建 handler 数组 |
| message 已有但无 callSite | handler 在但子应用未 notify | 只补子应用调用 |
| callSite 有但 message 未注册 | notify 发出无消费 | 只补 handler 注册 |
| 仅有 getAppProps | 仅 mount 同步 | 运行时变更仍需 notify |

## 关联 feature

字段不一致 → 报告 `fieldMappingGap` 后，由用户 dispatch [[映射-跨应用字段对齐]]（本 skill **不**自动链式调用）。

## 使用示例

```text
子应用改了用户名主应用不更新，先 $分析-通信基线：
rg notifyMainApp → apex profile 无调用
rg profile_username_updated → microfb 已有 handler
结论：只补子应用 notify，nextDispatch=编排（跳过新建 handler）
```
