下面给出基于你指定主题的「分批提交」计划（**对比基：仓库 apex_dev 当前分支 `HEAD`（`seccenter_v2`）**）：覆盖工作区内相对 `HEAD` 的未提交变更，共 **3** 批。以下**仅生成可复制命令**，不会执行任何 `git commit` / `git push`。

- **map_confidence**：`high`（见 `F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\commit-workflow-artifacts\20260401_menu_ui_stable_model_7e3fb91a\S6\map_confidence.yaml`）
- **未纳入批次**：`typecheck.log`（建议勿提交或加入 `.gitignore`）
- **分层提示**：业务层消费 **types 稳定模型**；**api 层**承载 HTTP 原始请求/响应类型；**gateway** 独占「响应体/G稳定模型/内部流转」与「内部流转/G稳定模型/请求体」的映射；本计划按 **types → gateway → 菜单 UI** 排序以降低交叉回滚成本。

## 实现（分批提交计划）

### apex_dev/1

**提交说明**

```text
feat(types): :memo: add menu API method typing surface
```

**能力映射**

> 默认细拆：每个批次只承载 **1 个主能力 tag**。

**主能力映射（可多条）**

- `types-stable-model`

**关联能力（可选）**

- 菜单网关方法契约与业务层 import 边界

**文件（每行一个）**

```text
src/types/menu-api-method.ts
```

**git commit命令**

```powershell
# === apex_dev / 批次 1 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(types): :memo: add menu API method typing surface

【元信息】
主题：菜单管理的UI交互；菜单管理的解耦；行数据中前端持久化与后端持久化的单轨和双轨；业务层消费稳定模型，只有网关层消费请求和响应所使用的原始模型，稳定模型来自types层，原始模型来自api层，网关层进行映射转换（http请求->响应体->稳定模型->前端内部流转；前端内部流转->稳定模型->请求体->http请求）
能力：types 层稳定模型（menu API method 相关契约面）

【摘要】
先落地 types 侧稳定契约，后续业务层与网关批次可对齐 import 边界。

定义：
改前：缺少与菜单网关方法枚举/约束相关的 types 集中出口；改后：新增 src/types/menu-api-method.ts，为业务层提供可引用的稳定类型面。

问题：
若稳定模型与 api 原始 DTO 同层混用，composable/组件易穿透直连 HTTP 形态，破坏分层。

解决：
本批仅纳入 types 文件，把「稳定契约」从 gateway/api 变更中隔离，便于独立审查。

价值：
业务层可假定 types 为单一事实源；gateway 批次再承担响应体/请求体与稳定模型互转。
'@ | Set-Content -Path ".git/commit-msg-apex_dev-1.txt" -Encoding utf8

$files = @(
  "src/types/menu-api-method.ts"
)
git add -- $files

git commit -F ".git/commit-msg-apex_dev-1.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### apex_dev/2

**提交说明**

```text
feat(gateway): :gear: remove legacy menu gateway and align user gateway
```

**能力映射**

> 默认细拆：每个批次只承载 **1 个主能力 tag**。

**主能力映射（可多条）**

- `frontend-gateway`

**关联能力（可选）**

- 删除 legacy 菜单网关入口

**文件（每行一个）**

```text
src/api/gateway/__tests__/device.gateway.test.ts
src/api/gateway/user.gateway.ts
src/gateways/system/menu/menu-legacy.gateway.ts
```

**git commit命令**

```powershell
# === apex_dev / 批次 2 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(gateway): :gear: remove legacy menu gateway and align user gateway

【元信息】
主题：菜单管理的UI交互；菜单管理的解耦；行数据中前端持久化与后端持久化的单轨和双轨；业务层消费稳定模型，只有网关层消费请求和响应所使用的原始模型，稳定模型来自types层，原始模型来自api层，网关层进行映射转换（http请求->响应体->稳定模型->前端内部流转；前端内部流转->稳定模型->请求体->http请求）
能力：gateway 层：删除 legacy menu 入口，收敛 user gateway 与设备网关测试

【摘要】
网关侧删除旧菜单 legacy 文件并同步相关调用与单测，符合「仅网关触碰 api 原始模型」。

定义：
改前：仍保留 menu-legacy.gateway 与当前迁移路径并存；user.gateway 与 device 网关测试仍对齐旧假设。改后：删除 legacy 文件并调整 gateway 实现与测试。

问题：
legacy 与新版映射并存时，审查难以判断真实调用链，易造成「业务层误用原始响应」的回退。

解决：
本批将 legacy 删除与 gateway 调整、device gateway 测试放在同一语义单元，保证网关边界闭合。

价值：
减少双轨网关入口；为菜单 UI 批次提供单一上游假设。
'@ | Set-Content -Path ".git/commit-msg-apex_dev-2.txt" -Encoding utf8

$files = @(
  "src/api/gateway/__tests__/device.gateway.test.ts",
  "src/api/gateway/user.gateway.ts",
  "src/gateways/system/menu/menu-legacy.gateway.ts"
)
git add -- $files

git commit -F ".git/commit-msg-apex_dev-2.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### apex_dev/3

**提交说明**

```text
feat(menu): :art: decouple menu panels and row persistence model
```

**能力映射**

> 默认细拆：每个批次只承载 **1 个主能力 tag**。

**主能力映射（可多条）**

- `menu-ui-decouple`

**关联能力（可选）**

- 行数据「单轨只读后持久」与「双轨本地编辑再提交」在 function-config-state / 表单提交中的分界

**文件（每行一个）**

```text
src/views/system/menu/__tests__/MenuTreePanelRenderer.test.ts
src/views/system/menu/__tests__/MenuTypeBindingDialog.test.ts
src/views/system/menu/__tests__/MenuTypeFormDialog.test.ts
src/views/system/menu/__tests__/MenuWorkspace.test.ts
src/views/system/menu/__tests__/SystemMenuPage.test.ts
src/views/system/menu/__tests__/function-config-state.test.ts
src/views/system/menu/__tests__/menu-type-binding.registry.test.ts
src/views/system/menu/__tests__/menu-type-form.config.test.ts
src/views/system/menu/__tests__/menu-type-form.submit.test.ts
src/views/system/menu/__tests__/menu-workspace.helpers.test.ts
src/views/system/menu/__tests__/setup.ts
src/views/system/menu/__tests__/useMenuTypeBindingDialog.test.ts
src/views/system/menu/__tests__/useMenuTypeBindingSummary.test.ts
src/views/system/menu/__tests__/useMenuTypeFormInitialization.test.ts
src/views/system/menu/__tests__/useMenuTypeSortSync.test.ts
src/views/system/menu/__tests__/useProjectOptions.test.ts
src/views/system/menu/__tests__/useRequiredRouteBinding.test.ts
src/views/system/menu/components/FunctionPanel.vue
src/views/system/menu/components/MenuImportDialog.vue
src/views/system/menu/components/MenuPanel.vue
src/views/system/menu/components/MenuRowActions.vue
src/views/system/menu/components/MenuTreePanelRenderer.vue
src/views/system/menu/components/MenuTypeBindingDialog.vue
src/views/system/menu/components/MenuTypeFormDialog.vue
src/views/system/menu/composables/useDirectoryRouteBindingMode.ts
src/views/system/menu/composables/useMenuTypeBindingDialog.ts
src/views/system/menu/composables/useMenuTypeBindingSummary.ts
src/views/system/menu/composables/useMenuTypeFormInitialization.ts
src/views/system/menu/composables/useMenuTypeFormViewState.ts
src/views/system/menu/composables/useMenuTypeSortSync.ts
src/views/system/menu/composables/useRequiredRouteBinding.ts
src/views/system/menu/index.vue
src/views/system/menu/model/binding/function-config-state.ts
src/views/system/menu/model/binding/menu-type-binding.columns.ts
src/views/system/menu/model/binding/menu-type-binding.registry.ts
src/views/system/menu/model/form/menu-type-form.helpers.ts
src/views/system/menu/model/form/menu-type-form.submit.ts
src/views/system/menu/model/useTreeDisplayNodes.ts
src/views/system/menu/utils/menu-tree-helpers.ts
```

**git commit命令**

```powershell
# === apex_dev / 批次 3 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(menu): :art: decouple menu panels and row persistence model

【元信息】
主题：菜单管理的UI交互；菜单管理的解耦；行数据中前端持久化与后端持久化的单轨和双轨；业务层消费稳定模型，只有网关层消费请求和响应所使用的原始模型，稳定模型来自types层，原始模型来自api层，网关层进行映射转换（http请求->响应体->稳定模型->前端内部流转；前端内部流转->稳定模型->请求体->http请求）
能力：菜单管理 UI：面板/行操作/函数配置状态；单轨与双轨行数据编辑流

【摘要】
将菜单页拆为 MenuPanel/FunctionPanel/行操作等；function-config-state 承载行级编辑态与提交对齐后端持久化。

定义：
改前：树面板渲染与表单/绑定逻辑高度耦合，行级状态缺少独立模块；改后：引入面板与 function-config-state、useTreeDisplayNodes 等，删除 MenuTreePanelRenderer 组件及其用例。

问题：
UI 与数据持久化节奏绑死时，无法实现「只读后端行（单轨）」与「先本地改再提交（双轨）」的可视化边界。

解决：
本批集中调整 views/system/menu 下组件、composables、model 与测试，使交互拆分与类型/网关前置批次对齐。

价值：
菜单域可独立回归；行数据流可读性提升，便于后续只增强 gateway 映射而不改面板结构。
'@ | Set-Content -Path ".git/commit-msg-apex_dev-3.txt" -Encoding utf8

$files = @(
  "src/views/system/menu/__tests__/MenuTreePanelRenderer.test.ts",
  "src/views/system/menu/__tests__/MenuTypeBindingDialog.test.ts",
  "src/views/system/menu/__tests__/MenuTypeFormDialog.test.ts",
  "src/views/system/menu/__tests__/MenuWorkspace.test.ts",
  "src/views/system/menu/__tests__/SystemMenuPage.test.ts",
  "src/views/system/menu/__tests__/function-config-state.test.ts",
  "src/views/system/menu/__tests__/menu-type-binding.registry.test.ts",
  "src/views/system/menu/__tests__/menu-type-form.config.test.ts",
  "src/views/system/menu/__tests__/menu-type-form.submit.test.ts",
  "src/views/system/menu/__tests__/menu-workspace.helpers.test.ts",
  "src/views/system/menu/__tests__/setup.ts",
  "src/views/system/menu/__tests__/useMenuTypeBindingDialog.test.ts",
  "src/views/system/menu/__tests__/useMenuTypeBindingSummary.test.ts",
  "src/views/system/menu/__tests__/useMenuTypeFormInitialization.test.ts",
  "src/views/system/menu/__tests__/useMenuTypeSortSync.test.ts",
  "src/views/system/menu/__tests__/useProjectOptions.test.ts",
  "src/views/system/menu/__tests__/useRequiredRouteBinding.test.ts",
  "src/views/system/menu/components/FunctionPanel.vue",
  "src/views/system/menu/components/MenuImportDialog.vue",
  "src/views/system/menu/components/MenuPanel.vue",
  "src/views/system/menu/components/MenuRowActions.vue",
  "src/views/system/menu/components/MenuTreePanelRenderer.vue",
  "src/views/system/menu/components/MenuTypeBindingDialog.vue",
  "src/views/system/menu/components/MenuTypeFormDialog.vue",
  "src/views/system/menu/composables/useDirectoryRouteBindingMode.ts",
  "src/views/system/menu/composables/useMenuTypeBindingDialog.ts",
  "src/views/system/menu/composables/useMenuTypeBindingSummary.ts",
  "src/views/system/menu/composables/useMenuTypeFormInitialization.ts",
  "src/views/system/menu/composables/useMenuTypeFormViewState.ts",
  "src/views/system/menu/composables/useMenuTypeSortSync.ts",
  "src/views/system/menu/composables/useRequiredRouteBinding.ts",
  "src/views/system/menu/index.vue",
  "src/views/system/menu/model/binding/function-config-state.ts",
  "src/views/system/menu/model/binding/menu-type-binding.columns.ts",
  "src/views/system/menu/model/binding/menu-type-binding.registry.ts",
  "src/views/system/menu/model/form/menu-type-form.helpers.ts",
  "src/views/system/menu/model/form/menu-type-form.submit.ts",
  "src/views/system/menu/model/useTreeDisplayNodes.ts",
  "src/views/system/menu/utils/menu-tree-helpers.ts"
)
git add -- $files

git commit -F ".git/commit-msg-apex_dev-3.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

## 自检（类型 / 边界 / 错误处理）

1. 文件清单均为仓库内相对路径；含 `D` 状态的删除项已列入对应批次的 `git add`，以便暂存删除（批次 2：`menu-legacy.gateway.ts`；批次 3：`MenuTreePanelRenderer.vue` 与 `MenuTreePanelRenderer.test.ts`）。
2. 批次顺序为 **types → gateway → 菜单 UI**，与「稳定模型 / 原始模型 / 映射层 / 交互层」依赖方向一致。
3. `typecheck.log` 未纳入任一批次；若后续 `git add -A` 误报，请先清理或忽略该文件。
4. 本输出不执行 `git commit` / `git push`；`header-max-length=100`（`apex_dev/commitlint.config.cjs`）下当前 `header_full` 已自检长度合规。

---

**commands_publish（内部索引，PowerShell）**

- `shell_primary`: powershell
- `push_policy.mode`: dry-run-only（map_confidence=high，无 requires_user 冲突）
- `per_batch.selected_header`: 均选用 `header_full`
