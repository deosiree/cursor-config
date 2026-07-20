---
name: 封装npm依赖包
description: Nebula 跨仓把业务仓可复用 UI 抽进 @nebula/ui：边界判定、入库、examples、本地 link、发版、消费者升版。触发词：封装组件、抽组件进 nebula-ui、共享组件入库、@nebula/ui 升版、NeSecretInput 同类抽取。
---

# 封装npm依赖包

## 何时使用

- 多个业务仓（apex_dev / microfb / opsdeck）出现同一套可复用输入/展示组件
- 要把本地组件抽进 `nebula-ui`（`@nebula/ui`）再发版给其他仓用
- 已在库仓落地组件，需要本地 link 联调或 Artifactory 升版后替换消费者

## 何时不要使用

- 只改 nebula-ui 内部目录/build/examples、不涉及「是否该从业务仓抽」→ 用 [[../../vue-skills/npm依赖包项目/SKILL.md]]
- 纯业务壳（如绑定密码策略校验的 `PwdField`）→ 留在业务仓
- 登录壳、Qiankun 注册、seccenter API → 分别落 microfb / seccenter，不入库 UI 包

## Single Dispatch 路由表

| 场景 | dispatch 唯一 intention |
|---|---|
| 不确定能不能抽 / 业务壳边界 | [[路由-封装任务]] → [[分析-可抽离边界]] |
| 明确要入库并走完发版联调 | [[路由-封装任务]] → [[编排-组件入库发版]] |
| 已在库内有组件，只升版替换消费者 | [[路由-封装任务]] → [[编排-组件入库发版]]（跳过实现，从发版/替换起） |

**禁止**主 skill 自动链式 dispatch 多个 intention。库仓工程细节由编排节点按需调用 feature，不二次路由 intention。

## 输入契约

| 字段 | 必填 | 说明 |
|---|---|---|
| `sourceRepo` | 是 | 业务源仓路径（如 apex_dev） |
| `sourceComponentPath` | 是 | 待抽组件路径 |
| `libRepo` | 否 | 默认 `nebula-ui` |
| `componentName` | 是 | 目标名，如 `NeSecretInput`（`Ne` 前缀） |
| `consumers` | 否 | 需升版替换的仓列表 |
| `publishMode` | 否 | `link` \| `artifactory`，默认先 `link` |

🔴 **CHECKPOINT · STOP**：`sourceRepo` + `sourceComponentPath` + `componentName` 齐全后，输出「可抽 / 不可抽 / 部分可抽」结论，等人确认再写码。

## 机制摘要

```
业务仓本地组件
  → 分析边界（通用核 vs 业务壳）
  → nebula-ui 实现（对齐现有 Ne* 模式）
  → 导出 + version + CHANGELOG
  → examples 文档站
  → link 或 Artifactory 发版
  → 消费者删本地实现、升 @nebula/ui
```

跨仓 surface：实现在 `surface=nebula-ui`；同时改消费者 → `cross-mfe` 或双 surface，先问人。

🔴 **CHECKPOINT · STOP**：`publishMode=artifactory` 或 `consumers` 非空时，先列出将改仓库清单，等人回复「确认」后再执行发版/替换；禁止静默双仓提交。

## 反模式黑名单

- 把带网关/API/表单校验策略的业务壳整包塞进 `@nebula/ui`
- 跳过 [[对照-现有组件模式]] 另起一套目录/导出习惯
- 默认遮罩模式误用 Element Plus `show-password`（会强制 `type=password` 触发浏览器提示）
- 对 `#suffix` 模板根写 `v-if` 导致 clearable=false 时眼睛永不渲染
- 未确认就同时大改 apex + microfb + nebula-ui
- 擅自把会话改成 `Authorization: Bearer`

## 失败分支

| 触发条件 | 一线修复 | 仍失败兜底 |
|---|---|---|
| 组件强依赖业务 store/API | 只抽展示/输入核，壳留业务仓 | 🛑 STOP：输出 `extractDecision.mode=none`，问人是否放弃入库 |
| 本地 link 解析不到 `@nebula/ui` | 查 `.pnpmfile.cjs` / workspace protocol | 改用 `file:../nebula-ui`，写入联调笔记后继续 |
| build 把 peer 打进 bundle | 查 vite `external` 与 peerDependencies | 对照 [[联调-本地link与peer]]；重建 dist 后再 link |
| 消费者升版后缺样式 | 确认 `import '@nebula/ui/style.css'` | 查 `package.json` exports `./style.css`；缺则先修库仓 exports |
| `#suffix` 根上 `v-if` 导致无眼睛 | 始终声明 `#suffix`，`v-if` 只挂图标 | 对照 [[references/NeSecretInput踩坑]] 复现表 |
| 用户要求密码策略壳一并入库 | 拒绝；引用反模式黑名单 | 🛑 STOP：只允许核入库，壳 path 列在 `stayInRepo` |
| `sourceComponentPath` 不存在 | 用 `rg`/`Glob` 按组件名反查 | 🛑 STOP：列入 `missingFacts`，禁止猜路径写码 |
| examples 页挂了但路由未注册 | 对照现有 `NeSecretInputDoc` 导航项补注册 | 先修 examples，再宣称编排完成 |
| 双仓实现 API 不一致 | 输出 diff 表，以「更通用」列为核 | 问人指定 SSOT 仓后再 [[分析-可抽离边界]] |

## 架构边界（防主文件膨胀）

主 `SKILL.md` 只保留：路由表、输入契约、失败表、检查点、验证命令、输出模板。  
实现步骤、Vite/peer、examples 细节 → 只在 feature-skills；跨仓「抽不抽」决策 → intention `分析-可抽离边界`。  
禁止把 `npm依赖包项目` 的库内 GREEN 全文复制进本文件。

**intention-skills**

- [[路由-封装任务]]
- [[分析-可抽离边界]]
- [[编排-组件入库发版]]

**feature-skills**

- [[对照-现有组件模式]]
- [[实现-薄壳双分支组件]]
- [[注册-导出与版本]]
- [[补齐-examples文档站]]
- [[联调-本地link与peer]]
- [[替换-消费者引用]]

**few-shot**

- [[assets/few-shot-example/NeSecretInput-入库]]

**references**

- [[references/封装检查清单]]
- [[references/跨仓surface决策]]
- [[references/NeSecretInput踩坑]]

## 验证要求（按序执行，全部通过才算完成）

在 `nebula-ui` 根目录：

1. `pnpm build`（exit 0；`dist/` 含新组件符号）
2. `pnpm run dev:examples`（浏览器打开对应 `*Doc` 页，空值+有值各测一次）

在每个 `consumers[]` 仓根目录（若本轮有替换）：

3. `pnpm type-check`（或该仓等价脚本）
4. `rg -n "GuardedSecretInput|旧本地路径" src` → 仅允许业务壳残留；核路径必须为 0 命中
5. 确认未新增 `Authorization: Bearer`（`rg -n "Authorization:\\s*Bearer" src` 无新增）

路径锚点（对照用，勿猜）：

- 库入口：`nebula-ui/src/index.ts`
- 组件目录：`nebula-ui/src/components/{componentName}/`
- examples：`nebula-ui/examples/pages/`、`nebula-ui/examples/demos/`
- apex 接入样例：`apex_dev/src/main.ts`（`app.use(NebulaUI)` + `@nebula/ui/style.css`）

## 每轮固定输出模板

完成路由或编排后，必须按下列字段回复（缺一则补齐后再结束）：

```yaml
surface: nebula-ui | cross-mfe | ...
dispatchedIntention: 路由后的唯一 intention
extractDecision: # 分析后必填；编排可引用
  mode: full | partial | none
  intoLib: []
  stayInRepo: []
orchestrationResult: # 编排后必填
  componentName: ""
  version: ""
  publishMode: link | artifactory
  consumersUpdated: []
  leftoverLocalRefs: []
checkpoint: # 需要人确认时非空
  question: ""
```

对照验收：`evals/expected-outputs.md`（三条 test-prompt 的字段级期望）。跑 eval 时逐条勾选，缺字段即 fail。

## 使用示例

```text
把 apex_dev 与 microfb 的 GuardedSecretInput 抽进 @nebula/ui，
业务壳 PwdField 留仓。使用 $封装npm依赖包：
- sourceRepo=apex_dev
- sourceComponentPath=.../GuardedSecretInput
- componentName=NeSecretInput
- publishMode=link
先分析边界，确认后再编排入库发版。
```
