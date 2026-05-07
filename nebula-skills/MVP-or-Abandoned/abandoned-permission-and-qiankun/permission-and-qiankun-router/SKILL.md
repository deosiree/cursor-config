---
name: permission-and-qiankun-router
description: Use when 用户的问题落在权限管理、菜单管理、注册中心、qiankun 聚合、运行时守卫或左侧导航约束这组主题里，但还不确定应先用哪个子 skill。
---

# 权限与 qiankun 能力路由总入口

## Overview
本 skill 是 `.cursor/nebula-skills/permission-and-qiankun` 这组能力包的总入口。

它不直接替代其它 skill，而是先做三件事：
1. 判断当前问题属于哪条主线
2. 识别是否需要先应用通用约束 skill
3. 按顺序路由到正确的子 skill，而不是一上来同时乱用多条

## 先套用的通用约束
只要需求属于本目录主题，默认先套用这 3 条原则：

1. [fail-fast-single-write-point](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/fail-fast-single-write-point/SKILL.md)
2. [menu-tree-truth-source-discipline](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/menu-tree-truth-source-discipline/SKILL.md)
3. [menu-binding-type-matrix](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/menu-binding-type-matrix/SKILL.md)

如果当前问题不涉及菜单树、注册中心、运行时权限或 qiankun，同组 skill 不一定适用。

## 路由规则
### 1. 用户说“按租户管理那套，改另一个模块”
优先进入：
1. [tenant-permission-migrate](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/tenant-permission-migrate/SKILL.md)
2. [runtime-permission-guard-alignment](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/runtime-permission-guard-alignment/SKILL.md)
3. 需要看完整用户链路时再补 [permission-state-machine-chain](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/permission-state-machine-chain/SKILL.md)

### 2. 用户说“别的微服务也要接注册中心 / qiankun / 基座汇总”
优先进入：
1. [micro-app-binding-registry-aggregation](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/micro-app-binding-registry-aggregation/SKILL.md)
2. [frontend-registry-contract](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/frontend-registry-contract/SKILL.md)
3. [mf-host-child-registry-sync](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/mf-host-child-registry-sync/SKILL.md)

### 3. 用户说“菜单管理要重构交互 / 关联路由 / 关联权限标识”
优先进入：
1. [menu-type-binding-ux-refactor](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/menu-type-binding-ux-refactor/SKILL.md)
2. [menu-refresh-propagation](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/menu-refresh-propagation/SKILL.md)
3. 涉及用户权限链路时补 [permission-state-machine-chain](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/permission-state-machine-chain/SKILL.md)

### 4. 用户说“按钮权限不对 / v-confirmPerm 不生效 / gateway 还能发请求”
优先进入：
1. [runtime-permission-guard-alignment](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/runtime-permission-guard-alignment/SKILL.md)
2. [permission-state-machine-chain](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/permission-state-machine-chain/SKILL.md)
3. 如果是菜单修改后不生效，再补 [menu-refresh-propagation](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/menu-refresh-propagation/SKILL.md)

### 5. 用户说“左侧菜单树错了，功能项跑到导航里了”
优先进入：
1. [sidebar-page-leaf-enforcement](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/sidebar-page-leaf-enforcement/SKILL.md)
2. 如果怀疑菜单树绑定本身有问题，再补 [menu-tree-truth-source-discipline](f:/Documents/Repertory/Sieyuan/nebula/.cursor/nebula-skills/permission-and-qiankun/menu-tree-truth-source-discipline/SKILL.md)

## 链路业务逻辑（状态机）
### 1. 识别阶段
- 先判断用户问题更像“模块迁移 / qiankun 聚合 / 菜单 UX / 运行时权限 / 导航投影”中的哪一种。

### 2. 约束阶段
- 无论哪一种，都先应用通用约束：
  - 单一写点
  - 菜单树真相源
  - 类型矩阵

### 3. 主 skill 阶段
- 选择最匹配的一条主 skill 作为执行主线。

### 4. 辅助 skill 阶段
- 仅在主线覆盖不全时，补第二或第三条 skill。
- 不要一开始把整个目录的 skill 全部混用。

### 5. 实施阶段
- 先按主线梳理状态机，再读关键文件，再动代码。

## 推荐使用顺序
如果问题同时涉及多个主题，建议优先顺序如下：
1. 先确认通用约束是否被破坏
2. 再确认真相源和写点
3. 再处理菜单管理/注册中心/运行时逻辑
4. 最后处理导航或 UI 投影问题

## 常见错误
1. 一上来同时打开太多 skill，导致主线不清楚。
2. 明明是运行时权限问题，却先去改菜单弹窗。
3. 明明是 qiankun 聚合协议问题，却先去改本地页面组件。
4. 跳过通用约束 skill，直接补局部兼容逻辑。
