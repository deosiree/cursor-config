---
name: npm依赖包项目
description: Vue3 组件库仓（以 nebula-ui / @nebula/ui 为样本）的目录约定、Vite lib 构建、peer、examples 站、宿主接入与 Artifactory 发版。触发词：nebula-ui、@nebula/ui、组件库项目、dev:examples、peerDependencies、Artifactory 发布。
---

# npm依赖包项目

## 何时使用

- 在 `nebula-ui`（或同构 Vue3+Element Plus 组件库）内新增/修改组件工程结构
- 配置 Vite 库模式、peer、exports、`dev:examples`
- 教宿主（如 apex_dev）如何 `app.use` / 按需 import / 引 `style.css`

## 何时不要使用

- 「该不该从业务仓抽、跨仓升版编排」→ 用 [[../../nebula-skills/封装npm依赖包/SKILL.md]]
- 改业务页面逻辑、登录、Qiankun、seccenter API
- 通用 npm 包但与 Vue 组件库无关（纯 utils 包另议）

## Single Dispatch 路由表

| 场景 | dispatch 唯一 intention |
|---|---|
| 不确定现状 / 缺 exports 地图 | [[路由-库仓任务]] → [[分析-库结构基线]] |
| 明确在库内落地新组件全流程 | [[路由-库仓任务]] → [[编排-新组件落地]] |
| 只改 build/peer/examples/发布之一 | [[路由-库仓任务]] → [[编排-新组件落地]]（裁剪步骤）或先基线 |

**禁止**自动链式多 intention。跨仓抽取问题转交 `封装npm依赖包`。

## 输入契约

| 字段 | 必填 | 说明 |
|---|---|---|
| `libRepo` | 否 | 默认 `nebula-ui` 绝对或相对路径 |
| `taskKind` | 是 | `newComponent` \| `buildPeer` \| `examples` \| `consume` \| `publish` |
| `componentName` | 条件 | `newComponent` 时必填 |
| `consumerRepo` | 条件 | `consume` 时必填（如 apex_dev） |

🔴 **CHECKPOINT · STOP**：`taskKind=publish` 时只输出命令与检查清单，**禁止**未经用户同意执行 `npm publish`。

🔴 **CHECKPOINT · STOP**：`taskKind=newComponent` 且将改 `src/index.ts` exports 时，先输出 `componentName` + 文件清单，等人确认命名（`Ne` 前缀）后再写文件。

## GREEN（主入口序号；细节在 intention/feature）

1. **路由**：进入 [[路由-库仓任务]]，输出唯一 `dispatchedIntention`（禁止链式）。
2. **若缺地图**：[[分析-库结构基线]] → 写出 `libBaseline`（version/components/exports/peers）。
3. **编排**：[[编排-新组件落地]] 按 `taskKind` 裁剪调用 feature（约定目录 / Vite peer / examples / 宿主接入 / 发布清单）。
4. **验收**：按「验证要求」命令逐条执行；对照 `evals/expected-outputs.md`。
5. **收尾**：填「每轮固定输出模板」；`executedPublish` 默认 `false`。

输入 → 输出：

| 步 | 输入 | 输出 |
|---|---|---|
| 1 | 用户描述 + `taskKind` | `dispatchedIntention` |
| 2 | `libRepo` | `libBaseline` |
| 3 | `componentName` / `consumerRepo` | `libOrchestration.touched` |
| 4 | 仓库可执行环境 | `buildOk` / 冒烟结论 |
| 5 | 上列产物 | 完整 YAML 回复 |

## 机制摘要（nebula-ui）

```
src/components/NeXxx/   → 实现
src/index.ts            → 插件注册 + named export
vite build (lib)        → dist + types + css
examples/ + dev:examples→ 文档站
publishConfig registry  → Artifactory @nebula scope
宿主 pnpm add + app.use + style.css
```

## 反模式黑名单

- 把 vue/element-plus 放进 `dependencies` 打进库包
- 忘记 `exports["./style.css"]` 导致宿主无样式
- examples 与组件 README 文案意图不一致
- 把「跨仓是否抽取」写进本 skill 流程冒充库内任务
- Runtime 绑死单一 IDE（措辞保持 runtime 中立）

## 失败分支

| 触发 | 一线 | 仍失败兜底 |
|---|---|---|
| dist 无新组件 | 查 index 导出与 dts 入口 | 对照 NeSecretInput 已导出条目逐项 diff |
| 宿主找不到模块 | 查 `.npmrc` @nebula registry | 临时 `file:` 本地包并记 `linkMethod` |
| examples 白屏 | 查 vue-router / vite.examples.config | 对照现有 `NeSecretInputDoc` 路由注册 |
| `taskKind=publish` 且用户未授权 | 只输出 checklist + 命令 | 🛑 STOP：`executedPublish` 必须为 false |
| 用户把「跨仓抽取」当成库内任务 | 转交 `封装npm依赖包` | 本 skill 不写业务仓删文件步骤 |

## 资源必读（dim 路径须可达）

执行前打开（相对本 skill 根目录）：

1. `references/nebula-ui拓扑.md`
2. `references/消费方checklist.md`
3. `evals/expected-outputs.md`
4. 样本：`assets/few-shot-example/apex-NeI18nInput消费/SKILL.md`（consume）或 `assets/few-shot-example/NeSecretInput-库内结构/SKILL.md`（newComponent）

缺文件 → 🛑 STOP：先补资源再继续，禁止凭记忆编造 Artifactory URL 或 peer 列表。

## 子 skill 索引

**intention-skills**

- [[路由-库仓任务]]
- [[分析-库结构基线]]
- [[编排-新组件落地]]

**feature-skills**

- [[约定-目录与命名导出]]
- [[配置-Vite库构建与peer]]
- [[搭建-examples演示站]]
- [[接入-宿主应用消费]]
- [[发布-Artifactory升版]]

**few-shot**

- [[assets/few-shot-example/NeSecretInput-库内结构]]
- [[assets/few-shot-example/apex-NeI18nInput消费]]

**references**

- [[references/nebula-ui拓扑]]
- [[references/消费方checklist]]

## 验证要求（按序执行）

库仓 `nebula-ui`：

1. `pnpm build`（exit 0）
2. 抽查 `dist/index.d.ts` 或 named export 含目标 `Ne*`
3. `pnpm run dev:examples` → 打开对应 Doc 页不白屏

宿主（`taskKind=consume` 时，以 apex 为对照）：

4. `package.json` 存在 `"@nebula/ui"`
5. `src/main.ts` 同时具备：`import NebulaUI from "@nebula/ui"`、`import "@nebula/ui/style.css"`、`app.use(NebulaUI…)`
6. 按需样例：`import { NeI18nInput } from "@nebula/ui"`（见 `apex_dev/src/views/system/auditConfig/components/AuditFormDialog.vue`）

peer 清单（宿主须已安装，勿写入库 `dependencies`）：`vue`、`element-plus`、`echarts`、`@vueuse/core`。

## 每轮固定输出模板

```yaml
taskKind: newComponent | buildPeer | examples | consume | publish
dispatchedIntention: ""
libBaseline: # 分析后
  packageName: "@nebula/ui"
  version: ""
  components: []
libOrchestration: # 编排后
  touched: []
  buildOk: false
  executedPublish: false
checkpoint: ""
```

对照验收：`evals/expected-outputs.md`。三条 test-prompt 缺字段即 fail；`taskKind=publish` 时 `executedPublish` 必须为 `false`。

## 使用示例

```text
使用 $npm依赖包项目，libRepo=nebula-ui，taskKind=newComponent，
componentName=NeFoo。先分析库结构基线再编排落地。
```
