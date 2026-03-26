# Apex Menu Management UI/UX Summary

## 任务目标
- 重构 `apex_dev/src/views/system/menu` 为“顶部 root tab + 条件双栏工作区”的菜单管理页。
- 当前阶段目标是 UI/UX 交互与视觉收敛，已通过，可进入真实业务开发。

## 当前状态
- UI/UX 交互已跑通。
- 视觉方向已明显回归 `apex_dev/.worktrees/develop/src/views/system/menu/index.vue`。
- 当前代码可继续开发真实动作链路、搜索过滤、编辑/删除/更新API 等业务能力。

## 关键决策
- 顶部 root tab 代表顶级目录。
- 左栏显示 root 以下的 `directory / menu / page` 树，不显示 `function`。
- 只有选中 `page` 时，右栏功能项配置显示。
- 右栏标题显示完整树路径，如 `功能项配置 / 安全管理 / 用户管理`。
- `redirect` 视为冗余，不再纳入新模型。
- `perm` 在 UI 上统一命名为 `API权限`。
- 分栏中缝默认几乎不可见，仅保留极细 hit area，hover 才淡入出现。

## 关键实现逻辑
- `index.vue`
  - 顶部工具栏、root tab rail、root tab 设置浮层菜单。
  - 当前 root / 当前节点 / 布局 reset token 管理。
  - 右侧标题通过祖先路径拼接生成。
- `MenuWorkspace.vue`
  - 单栏 / 双栏 / 左折叠 / 右折叠。
  - 中缝支持拖拽改宽。
  - 中缝视觉已弱化为 hover 才显现。
- `MenuTreePanelRenderer.vue`
  - 树表渲染。
  - 目录/菜单支持展开折叠。
  - 名称列支持 icon。
  - 表格已处理横向滚动和单元格截断，避免列重叠。
- `menu-tree-helpers.ts`
  - 左栏树过滤。
  - 右栏功能项获取。
  - 页面可见性判断。
  - 节点祖先路径生成。

## 主要文件
- `apex_dev/src/views/system/menu/index.vue`
- `apex_dev/src/views/system/menu/components/MenuWorkspace.vue`
- `apex_dev/src/views/system/menu/components/MenuTreePanelRenderer.vue`
- `apex_dev/src/views/system/menu/components/MenuRowActionButtons.vue`
- `apex_dev/src/views/system/menu/components/menu-tree-helpers.ts`
- `apex_dev/src/views/system/menu/__tests__/SystemMenuPage.test.ts`
- `apex_dev/src/views/system/menu/__tests__/MenuWorkspace.test.ts`
- `apex_dev/src/views/system/menu/__tests__/MenuTreePanelRenderer.test.ts`
- `apex_dev/src/views/system/menu/__tests__/menu-workspace.helpers.test.ts`
- `apex_dev/src/views/system/menu/__tests__/FunctionItemFormDialog.test.ts`

## 测试状态
- 菜单相关测试当前全绿。
- 最近一次验证命令：
  - `pnpm -C apex_dev test:unit -- src/views/system/menu/__tests__/menu-workspace.helpers.test.ts src/views/system/menu/__tests__/MenuWorkspace.test.ts src/views/system/menu/__tests__/MenuTreePanelRenderer.test.ts src/views/system/menu/__tests__/SystemMenuPage.test.ts src/views/system/menu/__tests__/FunctionItemFormDialog.test.ts`
- 最近一次结果：
  - `5 passed`, `23 passed`

## 下一步待办
- 接顶部搜索的真实过滤逻辑。
- 接 root tab 的编辑/删除真实动作。
- 接左栏菜单/页面的新增、编辑、删除、更新API。
- 接右栏功能项的新增、编辑、删除、批量更新API。
- 清理旧 `PermissionConfigDialog` 的剩余依赖路径。

## 外部参考与采纳点
- Cloudscape split view pattern
  - https://cloudscape.design/patterns/resource-management/view/split-view/
  - 采纳点：分隔中轴弱化、拖拽能力保留、折叠控制附着在分隔区。
  - 未采纳点：未完全照搬其大面积 split panel 外观，因为项目需继续贴近 `develop` 后台风格。
- Microsoft progressive disclosure guidance
  - https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-progressive-disclosure-controls
  - 采纳点：次级控件弱化展示、hover 时再增强显著性。
  - 未采纳点：未使用额外文字标签，保持更紧凑的后台管理页密度。

