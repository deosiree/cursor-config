---
name: 修复-侧栏菜单SCSS撑满
description: 当侧栏容器已绑 $localeLayout.sidebarWidth.md 但 el-menu 仍 200px、icon 裁切或折叠按钮不随宽度右移时使用。
---

# 修复-侧栏菜单 SCSS 撑满

父级 agent：[`../../SKILL.md`](../../SKILL.md)。解决 **容器变宽、内部布局仍缩窄** 类问题。

## 何时使用

- 切换语言后侧栏外框变宽，menu/icon/折叠区仍像 200px
- `menu.scss` 存在 `width: 200px !important` 于 `.el-sub-menu__title`
- apex LeftLayout 仅改 inline width，未设 `el-menu { width: 100% }`

## 何时不要使用

- 尚未绑定 `$localeLayout` → 先走扩展或新建插件
- 纯表单 `formLabel.md` 问题（与侧栏 SCSS 无关）

## 规范样本

| 仓库 | before | after |
|------|--------|-------|
| microfb menu | [`template/before/microfb/.../menu.sidebar-lock.fragment.scss`](../../template/before/microfb/src/styles/custom/menu.sidebar-lock.fragment.scss) | [`template/after/microfb/.../menu.sidebar.fragment.scss`](../../template/after/microfb/src/styles/custom/menu.sidebar.fragment.scss) |
| apex LeftLayout | before 无 deep menu 规则 | [`template/after/apex-dev/.../LeftLayout.sidebar.fragment.vue`](../../template/after/apex-dev/src/layouts/views/LeftLayout.sidebar.fragment.vue) scoped 段 |

## RED：定位

1. DevTools 看 `.layout-sider` / `.layout__sidebar` 宽度是否已为 preset 值
2. 看 `.el-menu` / `.el-sub-menu__title` computed width 是否仍为 200px
3. 查全局 SCSS 中 `200px !important`（microfb [`menu.scss`](../../template/before/microfb/src/styles/custom/menu.sidebar-lock.fragment.scss)）

## GREEN：修复清单

### microfb（`.layout-sider` 全局 SCSS）

在 `src/styles/custom/menu.scss`：

```scss
.layout-sider {
  .el-menu:not(.el-menu--collapse, .el-menu--horizontal) {
    width: 100% !important;

    .el-sub-menu__title,
    .el-menu-item {
      min-width: 0;

      .menu-icon,
      .icon-item {
        flex-shrink: 0;
      }

      .menu-title,
      .menu-title1 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .el-sub-menu__title {
      padding-right: calc(var(--el-menu-base-level-padding) + var(--el-menu-icon-width));
    }
  }
}
```

**删除** `.el-sub-menu__title { width: 200px !important; }`。

### microfb App.vue

- 侧栏容器去掉展开态 `width: 200px` SCSS
- `:deep(.el-scrollbar) { flex: 1 }` 可选
- **保留** `&--collapsed { width: 58px }`

### apex（`.layout__sidebar` scoped）

在 `LeftLayout.vue`：

```scss
.layout-sidebar {
  display: flex;
  flex-direction: column;

  :deep(.el-scrollbar) { flex: 1; }

  :deep(.el-menu:not(.el-menu--collapse)) {
    width: 100% !important;

    .el-sub-menu__title,
    .el-menu-item { min-width: 0; }

    .menu-icon { flex-shrink: 0; }

    .el-sub-menu__title > span,
    .el-menu-item > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
```

## 验收

- [ ] en-US 下 icon 完整、折叠按钮与 menu 左缘对齐方式与 zh-CN 一致
- [ ] 长英文标题 ellipsis，不挤掉 icon
- [ ] 折叠态不受影响

## 使用示例

```text
microfb 切英文后侧栏 260px 但 menu 仍 200px，修 menu.scss 撑满。
```
