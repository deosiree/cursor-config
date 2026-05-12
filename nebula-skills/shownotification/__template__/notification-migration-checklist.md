# 通知迁移检查清单

## 基本信息
- 任务名称：
- 目标模块：
- 执行人：
- 日期：

## 迁移目标
- 是否将普通业务通知统一到 `showNotification`
- 是否先识别仓库现成错误提示 helper，再将后端错误统一到已确认复用的 helper
- 是否要求清零 `ElMessage` 业务调用
- 是否要求后端错误展示 `[code]message`

## 搜索范围
建议目录：

- `src/`
- `mock/`

建议命令：

```powershell
rg -n "\bElMessage\b|ElMessage\.(success|warning|error|info)" src mock
```

```powershell
rg -n "showNotificationError\(|err\?\.error\?\.code|showNotification\(.*type:\s*\"error\"" src
```

```powershell
rg -n "handleApiError\(|showNotificationError\(|handleGatewayError\(" src
```

## 替换映射
- `ElMessage.success(msg)` -> `showNotification(msg, { type: "success" })`
- `ElMessage.info(msg)` -> `showNotification(msg, { type: "info" })`
- `ElMessage.warning(msg)` -> `showNotification(msg, { type: "warning" })`
- `ElMessage.error(msg)` -> `showNotification(msg, { type: "error" })`
- `catch (err) { showNotification("失败", { type: "error" }) }`
  -> `catch (err) { errorNotificationHelper(err, "失败") }`
- 手写 `[code]message` 拼接
  -> 委托给已确认复用的错误提示 helper

## 执行清单
- [ ] 已定位所有 `ElMessage` 业务调用点
- [ ] 已清理 `ElMessage` import
- [ ] 已补充 `showNotification` import
- [ ] 已确认仓库现成错误提示 helper，或已新增最小 helper
- [ ] 已将普通提示统一收口到 `showNotification`
- [ ] 已将后端错误统一收口到已确认复用的错误提示 helper
- [ ] 已检查后端错误展示 `[code]message`
- [ ] 已检查没有同一错误的重复弹窗链路
- [ ] 已检查原有文案未丢失
- [ ] 已检查原有展示配置未丢失

## 验收清单
- [ ] `src/` 与 `mock/` 中无 `ElMessage` 业务调用残留
- [ ] 后端错误统一通过已确认复用的错误提示 helper 处理
- [ ] 来自后端的报错能展示 `[code]message`
- [ ] 不存在手写 `[code]message` 拼接残留
- [ ] 成功提示可正常触发
- [ ] 失败提示可正常触发
- [ ] 警告提示可正常触发
- [ ] 同一错误不会重复弹窗

## 风险备注
- 是否存在 helper 层与调用方重复通知同一后端错误：
- 是否存在第三方依赖无法修改的调用：
- 是否存在需要人工回归的特殊上传 / 表单 / 登录场景：

## 回归记录
- 关键页面：
- 关键操作：
- 回归结果：
- 遗留问题：
