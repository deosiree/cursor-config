---
name: 新建-hook
description: 当目标仓库尚无 layouts/composables/useLoading.ts 时，从 template/mvp 落地全屏 loading composable；可选附领域 hook 骨架注释。
---

# 新建-hook

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **`useLoading` 基础设施**，不改业务页数据流（完成后委派 **应用-hook**）。

## 何时使用

- 无 `src/layouts/composables/useLoading.ts`
- 需从 opsdeck 等同款迁入 `ElLoading.service` 封装
- 新仓库 / 新子应用从零接入全屏 loading

## 何时不要使用

- `useLoading` 已存在 → [`../应用-hook/SKILL.md`](../应用-hook/SKILL.md)
- 仅需表格 `v-loading` → 不走本 skill

## 规范样本

| 样本 | 路径 | 来源 commit |
|------|------|-------------|
| useLoading MVP | [`template/mvp/src/layouts/composables/useLoading.ts`](../../template/mvp/src/layouts/composables/useLoading.ts) | `3a98909` |
| opsdeck 参照 | `nebula/opsdeck/src/views/projectManage/index.vue`（仓库根相对路径） | 列表查询 `startLoading/stopLoading` 范式 |
| 领域 hook 骨架 | [`template/mvp/.../usePageData.skeleton.ts`](../../template/mvp/src/views/_shared/usePageData.skeleton.ts) | 泛化拷贝起点 |

## RED：新增前核对

1. 目标路径是否为 `src/layouts/composables/useLoading.ts`（与 apex/opsdeck 一致）
2. 项目是否已安装 `element-plus`（`ElLoading.service`）
3. **勿**在本步骤顺带改业务页 inline load 逻辑

## CHECKPOINT · STOP

| 触发条件 | 必须动作 |
|----------|----------|
| 目标仓已有 `useLoading.ts` | **停止新建**，改走 [`应用-hook`](../应用-hook/SKILL.md) |
| 用户要的是表格局部 loading | **停止**，用 `v-loading` |

## GREEN：落地步骤

### 1. 复制 composable

从 [`template/mvp/src/layouts/composables/useLoading.ts`](../../template/mvp/src/layouts/composables/useLoading.ts) 对齐到目标仓库 `src/layouts/composables/useLoading.ts`。

| 导出 | 说明 |
|------|------|
| `useLoading(delay?)` | 默认 `delay=500` ms |
| `startLoading(text?)` | 延迟后显示全屏遮罩；重复调用被 guard |
| `stopLoading()` | 未显示则 cancel timer；已显示则 `close()` |

### 2. delay 选型（写入领域 hook 时）

| 场景 | 调用 | 原因 |
|------|------|------|
| 列表/批量查询 | `useLoading()` | 500ms 内完成则不显示，防闪烁 |
| 路由进入详情/个人中心 | `useLoading(0)` | 一点击进入即遮罩，避免闪占位 |

详见 [`references/useLoading-api.md`](../../references/useLoading-api.md)。

### 3. 最小调用范式

```ts
import { useLoading } from "@/layouts/composables/useLoading";

const { startLoading, stopLoading } = useLoading();

async function fetchList() {
  try {
    startLoading();
    await api.getList();
  } finally {
    stopLoading();
  }
}
```

列表页范式参照 **nebula 单仓根目录** 下 `opsdeck/src/views/projectManage/index.vue`（`useLoading()` 默认 delay，页面内 try/finally）。

### 4. 领域 hook 骨架（可选，不在此步绑定 gateway）

从 [`template/mvp/.../usePageData.skeleton.ts`](../../template/mvp/src/views/_shared/usePageData.skeleton.ts) 拷贝；应用-hook 阶段替换 gateway/类型/命名。形态选型见 [`page-archetypes.md`](../../references/page-archetypes.md)。

### 5. 验证

- 临时页或现有页：`startLoading()` → 全屏遮罩出现；`stopLoading()` → 关闭
- 快请求（&lt;500ms）+ 默认 delay：遮罩不出现（timer 被 cancel）
- `useLoading(0)`：调用后即时遮罩

## 失败 fallback

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| 遮罩不出现 | 检查 `element-plus` 样式是否加载 | 对照 mvp 全文 diff |
| 遮罩关不掉 | 确认 `finally` 中 `stopLoading()` | 查是否多实例重复 `startLoading` |
| 列表页 loading 闪一下 | 改用默认 `useLoading()` 勿用 `0` | 读 delay 表 |

## REFACTOR

完成后 **必须** 委派 [`应用-hook`](../应用-hook/SKILL.md) 改造具体业务页。

## 验收

- [ ] `useLoading.ts` 路径与 apex/opsdeck 一致
- [ ] `startLoading/stopLoading` 成对、快请求可 cancel timer
- [ ] 未在本步骤修改业务页数据流（除可选验证用临时代码）

## 延伸阅读

- API：[`references/useLoading-api.md`](../../references/useLoading-api.md)
- 形态：[`page-archetypes.md`](../../references/page-archetypes.md)
- 应用：[`应用-hook/SKILL.md`](../应用-hook/SKILL.md)
