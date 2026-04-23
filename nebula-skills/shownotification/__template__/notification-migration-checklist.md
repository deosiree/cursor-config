# 通知迁移检查清单

## 基本信息

- 任务名称：
- 目标模块：
- 执行人：
- 日期：

## 迁移目标

- 是否将业务通知统一到 `showNotification`
- 是否要求清零 `ElMessage` 业务调用
- 是否需要保留原有 `title`、`duration`、`position`

## 搜索范围

建议搜索目录：

- `src/`
- `mock/`

建议命令：

```powershell
rg -n "\bElMessage\b|ElMessage\.(success|warning|error|info)" src mock
```

## 替换映射

- `ElMessage.success(msg)` -> `showNotification(msg, { type: "success" })`
- `ElMessage.info(msg)` -> `showNotification(msg, { type: "info" })`
- `ElMessage.warning(msg)` -> `showNotification(msg, { type: "warning" })`
- `ElMessage.error(msg)` -> `showNotification(msg, { type: "error" })`

## 执行清单

- [ ] 已定位所有 `ElMessage` 业务调用点
- [ ] 已替换 `success`
- [ ] 已替换 `info`
- [ ] 已替换 `warning`
- [ ] 已替换 `error`
- [ ] 已清理 `ElMessage` import
- [ ] 已补充 `showNotification` import
- [ ] 已检查 `type` 位于第二参数
- [ ] 已检查原有文案未丢失
- [ ] 已检查原有展示配置未丢失

## 验收清单

- [ ] `src/` 与 `mock/` 中无 `ElMessage` 业务调用残留
- [ ] 不存在新增的通知封装分支
- [ ] 成功提示可正常触发
- [ ] 失败提示可正常触发
- [ ] 警告提示可正常触发
- [ ] 信息提示可正常触发

## 风险备注

- 是否存在自动生成文件中的 `ElMessage` 类型声明：
- 是否存在第三方依赖无法修改的调用：
- 是否存在需要人工回归的特殊弹窗/上传/表单场景：

## 回归记录

- 关键页面：
- 关键操作：
- 回归结果：
- 遗留问题：
