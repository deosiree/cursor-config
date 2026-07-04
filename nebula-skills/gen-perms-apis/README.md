# gen-perms-apis

## 定位

`gen-perms-apis` 是一个中文 agent skill 套件，覆盖权限点与 API 配置的完整生命周期：

```
分析现状 → 设计权限点 → 生成菜单补丁 → 改动源码 → 页面门控空态 → 端到端验证 → 运行时排障 → E2E自动化测试
```

父 agent `SKILL.md` 负责会话级路由、人工门禁与节点切换。真实执行能力分层下沉：

- `intention-skills/`：意图层（分析 / 策略 / 编排 / 迁移 / 路由 / E2E编排）
- `feature-skills/`：功能层（扫描 / 设计 / 补丁 / 合并 / 改码 / 验证 / 排障 / 导入 / 双会话E2E / CSV落盘）

## 输入契约

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `仓库路径` | 是 | — | 目标仓库绝对路径 |
| `目标结果` | 是 | — | 盘点 / 设计 / 补丁 / 改码 / 验证 / 排障 / E2E测试 |
| `targetRepo` | 否 | `apex_dev` | 源码改动目标仓库，默认仅改 apex_dev |
| `api契约` | 否 | `seccenter.swagger.json` | 默认 API 契约路径 |
| `补充契约路径` | 否 | `[]` | 补充契约文件列表 |
| `关注模块` | 否 | `[]` | 关注模块名或路由前缀 |
| `关注路由` | 否 | `[]` | 关注 routePath 列表 |
| `是否允许多轮人工确认` | 否 | `是` | 控制父 agent 是否在决策点提问 |

## 核心约束（全套件通用）

1. **targetRepo 默认 apex_dev**：每次只改一个仓库，不动 opsdeck
2. **复杂页 pagePerms 静态预算；简单页才 v-hasPerm**：列表页/多行 OpItem 用 `xxxPagePerms` + boolean props；仅 1–2 控点可用 `v-hasPerm`（见 `references/page-perms-static-budget.md`）
3. **菜单补丁 ID 必须回填**：`patch_children_add` 中 function 必须先查询/创建获取 ID
4. **菜单导入先 dry_run**：正式 `POST .../menu/project/import` 前先 `dry_run: true`
5. **API 反查三类硬链路**：业务层→gateway→api→契约 / 业务层→api→契约 / 子组件 emit→父组件→gateway/api→契约
6. **契约缺失时标记"待人工确认"**：不主观推断 description
7. **页面门控空态**：缺 pageGate perm 时 `PageNoPermission` 整页空态，禁止表格「暂无数据」冒充无权限
8. **路由作用域鉴权**：`RoutePermDict`（`route_path` + `params` + 权限标识）；`checkHasPerm` 真相源为当前路由 scope；禁止以 `userInfo.permsMap` 为排障主路径（见 `references/route-scope-auth-chain.md`）

## 套件结构

```
gen-perms-apis/
├── SKILL.md                              # 父 agent：会话路由 + 人工门禁 + 节点切换
├── README.md                             # 本文件
├── intention-skills/
│   ├── 分析-perms-apis现状/SKILL.md       # 源码扫描 + API 反查（公共前置能力）
│   ├── 策略-设计权限点/SKILL.md            # 权限粒度决策 + 豁免判断 + hidden page
│   ├── 编排-权限点配置全流程/SKILL.md      # 多阶段方案矩阵 + 改动面评估
│   ├── 迁移-源码改动落地/SKILL.md          # 集中式改码策略 + 最小 diff
│   ├── 编排-权限E2E测试/SKILL.md           # OpenCLI 双会话 E2E 编排
│   ├── 策略-页面权限空态/SKILL.md          # 整页门控 vs 操作级、view/query 裁决
│   ├── 编排-页面无权限空态落地/SKILL.md    # PageNoPermission 单专题编排
│   ├── 编排-新模块权限配置/SKILL.md          # 路由作用域：route_path + params + perm
│   └── 路由-选择功能子skill/SKILL.md       # 单步功能路由
├── feature-skills/
│   ├── 扫描源码权限点与API/SKILL.md        # 原 gen-perms-apis 核心逻辑
│   ├── 盘点-页面权限空态反模式/SKILL.md    # 暂无数据冒充无权限扫描
│   ├── 判定-页面门控权限点/SKILL.md        # pageGate perm + computed 命名
│   ├── 接入-PageNoPermission空态/SKILL.md  # 组件 + 页面兄弟分支改造
│   ├── 设计权限点与API映射/SKILL.md        # perm 命名 + 豁免表 + 跨模块归属
│   ├── 生成菜单树权限补丁/SKILL.md         # 增量 YAML 补丁 + ID 回填
│   ├── 合并权限点到菜单树/SKILL.md         # 补丁与已有树合并
│   ├── 源码集中式权限改动/SKILL.md         # pagePerms 静态预算 + boolean props
│   ├── OpenCLI端到端验证/SKILL.md          # SSH + OpenCLI 权限验收
│   ├── 权限运行时排障/SKILL.md             # isOwner / computed 缓存 / 登录时序
│   ├── 菜单树导入验证/SKILL.md             # dry_run → 正式导入 + 角色模板
│   ├── OpenCLI双会话权限验证/SKILL.md       # admin 配置 + test 用户验证（通用底座）
│   ├── 双会话OpenCLI环境初始化/SKILL.md     # profile 预检 + 双 session 登录
│   ├── 角色菜单权限树快速配置/SKILL.md     # 角色弹窗内搜索树+功能项勾选
│   ├── 菜单管理功能项依赖链验证/SKILL.md   # 菜单 8 场景 E2E（node 脚本 + scenarios/）
│   └── 权限测试结果落盘CSV/SKILL.md         # 薄包装 → 委托外部 skill 生成 CSV
├── template/                              # 人类可读模板与样本
│   ├── route-component-perm-api-output.md
│   ├── boundary-file-example.md
│   ├── perm-design-output.md
│   ├── menu-patch-yaml-output.md
│   ├── centralized-diff-output.md
│   └── sample-run/
│       ├── before-01-需求输入.md           # few-shot：用户原始需求
│       ├── after-01-完整执行链路.md        # few-shot：完整产物
│       ├── mvp-01-最小闭环.md              # few-shot：最小可复现路径
│       ├── snapshot-01-关键决策.md         # few-shot：关键决策节点
│       ├── before-04-租户权限重复鉴权.md   # RED：v-hasPerm 撒点 + OpItem 二次鉴权
│       ├── after-04-页面级静态pagePerms.md # GREEN：tenantPagePerms 模式
│       ├── snapshot-04-pagePerms决策.md    # 何时 pagePerms vs v-hasPerm
│       ├── before-02-页面空态/             # RED：.vue/.scss 源码快照
│       ├── after-02-页面空态/              # GREEN：PageNoPermission + 页面改造
│       └── reference-02-设备数据UI参考/    # UI 基准（只读）
├── assets/                                # agent 轻量素材
│   ├── few-shot-example/
│   ├── frontmatter-template.yaml
│   └── skill-output-checklist.md
├── references/                            # 长说明与规则文件
│   ├── default-project-boundary.md
│   ├── doc-architecture.md
│   ├── api-contract-resolution.md
│   ├── api-backtrace-rules.md
│   ├── evidence-rules.md
│   ├── implementation-plan.md
│   ├── template-tuning-notes.md
│   ├── writing-skills-core.md
│   ├── perm-design-rules.md               # 权限设计规则
│   ├── menu-yaml-spec.md                  # 菜单 YAML 字段规范
│   ├── centralized-diff-rules.md          # 集中式改动规则
│   ├── page-perms-static-budget.md        # pagePerms 静态鉴权（复杂页默认）
│   ├── page-no-permission-pattern.md      # 页面空态架构与放置
│   ├── page-no-permission-anti-patterns.md # 空态反模式清单
│   ├── perm-runtime-debugging.md          # 运行时排障规则
│   └── route-scope-auth-chain.md          # RoutePermDict 鉴权链路（权威）
└── evals/
    ├── evals.json
    └── test-prompts.json
```

## 使用示例

```text
使用 $梳理权限点与apis 扫描 apex_dev，
先帮我盘点所有路由的权限点和 API 现状。
```

```text
已有盘点文档，帮我设计首页、租户管理、安全配置的新权限点。
```

```text
给我全流程方案：从分析现状到菜单补丁、源码改动、端到端验证。
```

```text
权限设计已确认，帮我按集中式原则改 apex_dev 源码。
```

```text
我要对 sys:dashboard:view、sys:tenant:query 做 E2E 测试，
admin 配置"权限测试角色"，13813815913 验证，结果落盘 CSV。
```

```text
直接用菜单管理跑一遍 E2E 测试，8 个场景全过一遍。
```

```text
租户无 query 时别显示暂无数据，接入 PageNoPermission，UI 参照设备数据。
```

```text
帮我在新模块 /Apex/foo 按路由作用域方案配置权限点。
```

```text
同 route_path 两个 page 怎么配权限？按钮有 perm 但不显示。
```

## 模板与素材入口

- `[[template/route-component-perm-api-output.md]]`
- `[[template/boundary-file-example.md]]`
- `[[template/sample-run/mvp-01-最小闭环.md]]`
- `[[template/sample-run/after-01-完整执行链路.md]]`
- `[[assets/few-shot-example]]`
- `[[references/default-project-boundary.md]]`
- `[[references/api-backtrace-rules.md]]`
- `[[references/perm-design-rules.md]]`
- `[[references/centralized-diff-rules.md]]`
- `[[references/page-perms-static-budget.md]]`
- `[[references/page-no-permission-pattern.md]]`
- `[[references/page-no-permission-anti-patterns.md]]`
- `[[references/perm-runtime-debugging.md]]`
- `[[references/route-scope-auth-chain.md]]`
- `[[template/new-module-perm-config-checklist.md]]`
