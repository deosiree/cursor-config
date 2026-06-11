# should-trigger

- 切换英文后侧栏 icon 显示不全，menu 好像还是 200px
- apex 已有 locale-layout，给 LeftLayout 加 sidebarWidth 四档，模板用 .md
- microfb 没有 locale-layout，要侧栏随语言变宽，参照 apex
- formLabel 也要改成 sm md lg xl 档位，和 queryField 一样消费 .md
- 侧栏宽度变了但折叠按钮位置不对，layout-sider 内部没撑满
- 给 locale-layout 新增一个布局维度，要用 Record LayoutSize 写法
- menu.scss 里 el-sub-menu__title width 200px 要去掉
- setupLocaleLayout 应该放在 i18n 后面怎么注册
