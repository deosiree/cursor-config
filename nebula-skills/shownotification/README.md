# showNotification 通知规范说明

## 背景

nebula 项目历史上同时存在两套前端提示方式：

- `ElMessage`
- `showNotification`

这种混用会带来几个问题：

- 业务代码存在两套入口，规范不统一
- 后续想统一视觉、位置、时长时，维护成本高
- 测试与代码 review 难以形成明确标准
- 新代码容易沿用旧习惯继续扩散 `ElMessage`

因此项目约定将业务提示统一收敛到 `showNotification(message, { type, ...options })`。

## 目标

本规范的目标不是单纯替换 API 名称，而是建立一套稳定、可执行、可验收的项目内通知约束：

- 业务提示统一走 `showNotification`
- `type` 在第二个参数对象中定义
- 不允许在业务代码中直接使用 `ElMessage`
- 后续任何通知治理都以这一规范为基线

## 统一写法

标准写法：

```ts
showNotification(message, {
  type: "warning",
  duration: 5500,
});
```

常见示例：

```ts
showNotification("保存成功", { type: "success" });
showNotification("已取消删除", { type: "info" });
showNotification("请先选择文件", { type: "warning" });
showNotification("请求失败，请稍后重试", { type: "error" });
```

## 禁止写法

业务代码中禁止直接写：

```ts
ElMessage.success("保存成功");
ElMessage.info("已取消");
ElMessage.warning("请先选择文件");
ElMessage.error("请求失败");
```

## 参数约定

### 第一参数

第一参数只放消息内容：

```ts
showNotification("导入完成", { type: "success" });
```

### 第二参数

第二参数只放展示相关配置：

- `type`
- `duration`
- `title`
- `position`

例如：

```ts
showNotification("规则名称不能为空", {
  title: "提示",
  type: "warning",
  duration: 5500,
});
```

## 本次迁移方案总结

这次会话沉淀出的迁移方案是：

1. 将业务代码中的 `ElMessage.success/info/warning/error` 全量替换为 `showNotification`
2. 保持原有提示文案不变
3. 保持原有额外展示配置不丢失
4. 清理 `ElMessage` import
5. 通过全局搜索和专项测试验证业务代码无残留

映射关系如下：

- `ElMessage.success(msg)` -> `showNotification(msg, { type: "success" })`
- `ElMessage.info(msg)` -> `showNotification(msg, { type: "info" })`
- `ElMessage.warning(msg)` -> `showNotification(msg, { type: "warning" })`
- `ElMessage.error(msg)` -> `showNotification(msg, { type: "error" })`

## 推荐执行流程

1. 搜索 `ElMessage` 残留点
2. 按统一映射逐个替换
3. 清理 import
4. 回归关键交互场景
5. 再次搜索确认无业务残留

推荐搜索命令：

```powershell
rg -n "\bElMessage\b|ElMessage\.(success|warning|error|info)" src mock
```

## 验收建议

至少检查以下内容：

- 搜索结果中不再出现业务代码 `ElMessage` 调用
- `showNotification` 的 `type` 都位于第二参数
- 文案没有被替换错
- 成功、失败、取消、校验提示都仍然可触发

注意：

- 自动生成的类型文件如 `src/types/auto-imports.d.ts` 可能仍有 `ElMessage` 声明
- 这类声明不代表业务代码仍在实际调用

## 模板说明

本目录下的 `__template__/notification-migration-checklist.md` 提供了一套通知治理模板，可用于：

- 发起新的通知规范治理
- 记录本次替换范围
- 做迁移验收留痕
- 为后续类似治理复用
