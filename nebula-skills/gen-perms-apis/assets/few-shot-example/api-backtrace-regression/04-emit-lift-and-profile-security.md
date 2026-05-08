# 04 子组件抬升与页面补强记录

## 用户补充

用户指出 `/Apex/system/securityConfig` 已知有权限点绑定，初版没有找到。`/Apex/profile` 同样找得不全，漏掉修改密码、修改信息、修改邮箱、修改手机号。

## 修正链路：安全配置

```text
/Apex/system/securityConfig
-> LoginPolicyCard / PasswordPolicyCard / SessionPolicyCard
-> emit、update:*、表单状态或 props 回调
-> src/views/system/securityConfig/index.vue
-> useSecurityConfigPage
-> ConfigGateway / SessionConfigGateway
-> ConfigV2API / SessionConfigV2API
-> docs/api/seccenter.swagger.json
```

## 修正结论：安全配置

- 子组件没有直接 import api，不代表没有后端 API。
- 权限点查找要从子组件抬升到父组件保存动作。
- 父组件调用组合式函数时，还要继续追组合式函数返回方法。
- gateway 方法内部如果再包映射函数，也要继续追到 api。

## 修正链路：个人中心

```text
/Apex/profile
-> profile/index.vue 及弹窗/表单子组件
-> 修改资料 / 修改密码 / 修改邮箱 / 修改手机号
-> 父页面提交方法或组合式函数
-> UserGateway / AuthGateway
-> UserV2API / AuthV2API
-> docs/api/seccenter.swagger.json
```

## 修正结论：个人中心

`/Apex/profile` 至少要覆盖以下功能：

- 修改个人信息
- 修改密码
- 修改邮箱
- 修改手机号

## 需要沉淀的规则

- 权限点查找不只看顶层页面模板，也要看业务子孙组件。
- 子组件通过事件、props、`v-model` 抬升的操作要归属回父路由页面。
- 组合式函数是业务层的一部分，不是反查终点。
- 只有完成子组件抬升链路后，才允许申请人工确认是否无后端 API。
