# Should Trigger

- 用户管理 OpenCLI 自动化 / E2E
- user0601 创建种子用户、邮箱激活、密码直设
- 批量删除用户、清理到 10 人、u0601_oc0601 残留
- 操作列只有编辑、OpItem perm、checkHasPerm 显示兜底
- sys:user:add 没有新增按钮
- opencli browser eval 用户列表
- 重置密码仍显示 / isVisible 菜单
- 用户管理页自动化测试脚本沉淀

# Should NOT Trigger

- 纯改 checkHasPerm 实现（走 apex_dev 代码 + 单测，不必 OpenCLI）
- 仅问 UserTable perm 字符串是否与 YAML 一致（静态读码即可）
- 租户管理 UX（用 opencli-ux-tenant）
- CSV 测试用例导出（用 输出csv的测试用例 skill）
- 无 nebula / 无 localhost 8080 的无关项目
