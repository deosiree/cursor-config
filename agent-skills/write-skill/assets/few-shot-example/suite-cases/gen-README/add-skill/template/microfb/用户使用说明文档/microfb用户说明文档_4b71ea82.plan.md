---
name: microfb用户说明文档
overview: 在 `microfb/docs/mvp/说明文档/` 新增一份基于 microfb 基座源码真实能力的《用户使用说明》，章节按“源码功能边界”组织；“报表浏览工具”仅作为写作风格参考而非功能主章节。
todos:
  - id: draft-outline
    content: 按基座源码能力重建《用户使用说明书》章节大纲（去除报表主章节）
    status: pending
  - id: write-core-chapters
    content: 完成登录认证、菜单导航、子应用访问、异常处理四个核心章节
    status: pending
  - id: cross-check-existing-docs
    content: 与现有状态链路/说明文档进行事实一致性校对
    status: pending
  - id: update-readme-index
    content: 更新 docs/mvp/README.md 索引并补充文档入口
    status: pending
isProject: false
---

# microfb 用户使用说明文档计划

## 目标与默认范围

- 目标：新增一份面向业务用户/实施人员的“可直接上手”的使用说明书。
- 默认范围（本次）：MVP 核心场景（登录认证、首页与菜单导航、子应用访问、登出与常见异常处理）。
- 结构依据：严格按 `microfb/src` 当前可见功能组织，不引入基座未实现的业务功能章节。
- 参考风格：借鉴“报表浏览工具”文档的说明书体例（章节化 + 操作步骤 + 预期结果 + 注意事项），不复制其业务章节。

## 文档落点

- 新增主文档：[microfb/docs/mvp/说明文档/用户使用说明书_MVP版.md](microfb/docs/mvp/说明文档/用户使用说明书_MVP版.md)
- 更新索引：[microfb/docs/mvp/README.md](microfb/docs/microfb/README.md)

## 文档结构（MVP）

- 第1章 文档说明（适用对象、使用环境、术语约定）
- 第2章 登录与认证（登录入口、验证码/MFA分支、登录成功判定）
- 第3章 首页与菜单导航（首页落点、菜单层级、权限可见性）
- 第4章 子应用访问与切换（Apex/Opsdeck 入口、挂载失败时处理）
- 第5章 退出登录与会话清理（登出后行为、切换账号注意事项）
- 第6章 常见问题与处理（白屏、404、无权限、菜单未刷新）
- 附录：术语与文档索引（关联现有状态链路/说明文档）

## 内容来源与对齐策略

- 使用现有 MVP 文档作为事实来源，避免与实现偏离：
  - [microfb/docs/mvp/状态链路/页面显示链路_登录-路由-守卫-组件.md](页面显示链路_登录-路由-守卫-组件.md)
  - [microfb/docs/mvp/状态链路/菜单存储链路.md](菜单存储链路.md)
  - [microfb/docs/mvp/状态链路/子应用注册链路_qiankun启动与Apex自动降级.md](子应用注册链路_qiankun启动与Apex自动降级.md)
  - [microfb/docs/mvp/状态链路/子应用Props同步链路_menuVersion驱动.md](子应用Props同步链路_menuVersion驱动.md)
  - [microfb/docs/mvp/说明文档/联调验收脚本_手工回归最小步骤.md](联调验收脚本_手工回归最小步骤.md)
  - [microfb/docs/mvp/说明文档/常见故障排障手册_白屏404子应用挂载失败串权.md](常见故障排障手册_白屏404子应用挂载失败串权.md)
  - [microfb/docs/mvp/说明文档/菜单模型与动态路由生成说明.md](菜单模型与动态路由生成说明.md)

## 写作规范（执行时遵循）

- 面向用户语言：少内部实现术语，多“操作动作 + 结果”。
- 每节固定模板：目的、前置条件、步骤、结果、注意事项。
- 不写“报表导出/打印/高级筛选”等基座源码未体现的能力，避免超范围承诺。

## 验收标准

- 用户可在不看源码情况下完成核心操作。
- 章节目录清晰，单节可独立阅读。
- `README.md` 已包含该文档入口。
- 与基座源码真实能力一致（不出现“报表浏览工具”作为主体功能章节）。
- 与现有技术文档无矛盾描述（抽样交叉校对）。

