# 本次 apex_dev 会话沉淀

## trans 与 t 的边界

- `trans()` 负责标记静态 key 或让抽取器识别
- `t()` 负责真正的运行时翻译
- 不能把 `trans()` 当成最终展示文案

## 纯 TS 常量定义点 + extract 抽不到

- 消费点 `$t(var)` 正确 ≠ 定义点已可被 extract 扫描
- side-effect `t(CONST.xxx)` 或 `buildXxxLabels(){ t(CONST) }` **无效**，见 `errors/side-effect-t-scan-伪extract.md`
- 诊断：`grep locale` 无 key + extract 新增 0 → 查定义点是否 `trans("字面量")`
- 正例：tenant / menu 的 `*-table-columns.ts`、`menu-row-actions.ts`；few-shot `apex_dev-menu-row-actions`

## formRules 最小收口

- 保留单文件、内联定义风格是可行的
- 真正的问题不是集中定义，而是静态导出数组会在模块加载时冻结文案
- 更稳的方案是导出 `createXxxRules(t)`，页面持有 `t`

## 动态文本与动态校验

- 动态文本不要在 util 层直接返回最终翻译字符串
- 动态校验器、确认密码规则、渠道提示等都应该接收回调 `t`
- `requiredRule(t("..."))` 比 `trans + t` 双层包裹更直接

## 基座清理边界

- `lang store`、`qiankun/actions.ts`、`utils/i18n.ts` 可以收成最小 i18n 接缝
- 非 i18n 的 qiankun 通信字段不要顺手改
- 类型桥接文件只有在 `moduleResolution` 和依赖导出都满足时才能删

## 退化策略

- 旧链路退化不等于全删
- 运行中的旧 runtime 必须下线
- 新方案入口、语言切换、locale 资产可以保留，给后续迁移复用
