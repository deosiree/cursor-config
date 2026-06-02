# should-trigger — 应该触发本 skill 的场景

## TC1~TC4 全流程校验

```text
用户: "帮我测一下角色弹窗的 Tab 校验"
→ 触发全流程 TC1~TC4 → bash run-e2e.sh --profile local
```

## 仅特定 Tab 测试

```text
用户: "验证角色表单不填名称确定时会报错"
→ 触发：识别为 Tab 校验场景 → role-tab-validation.sh
```

## 弹窗交互验证

```text
用户: "确认角色新增后弹窗能正常关闭"
→ 触发 TC3 → role-tab-validation.sh 覆盖
```

## 与源码协同排查

```text
用户: "角色管理弹窗 Tab 切换有问题，跑一下 TC1"
→ 触发 useTabValidation 相关问题 → bash run-e2e.sh
```

## 使用 --skip-login

```text
用户: "我已经登录了，只跑角色 Tab 校验"
→ 触发 → bash role-tab-validation.sh --profile local --skip-login
```
