---
name: shownotification
description: Use when nebula 项目中存在 ElMessage 与 showNotification 混用、需要统一通知入口、制定通知规范或执行通知迁移与验收时
---

# showNotification 统一通知规范

## 概述
本 skill 用于约束 nebula 项目的前端提示规范，目标是把业务提示统一收口到 `showNotification(message, { type, ...options })`。

核心原则：

- 业务代码只允许一个通知入口：`showNotification`
- `type` 必须放在第二个参数对象中定义
- 不允许在业务代码中直接使用 `ElMessage`

## 何时使用

在以下场景加载本 skill：

- 新增前端提示逻辑，准备弹出成功、失败、警告、信息提示
- 修改旧页面，发现 `ElMessage` 与 `showNotification` 混用
- 做代码治理，准备批量替换 `ElMessage`
- 做代码 review，需要判断通知调用是否符合项目规范
- 测试或联调反馈“使用了 ElMessage”类问题，需要按项目规范修正

以下场景通常不适用：

- `ElMessageBox` 这类确认框、阻断式交互
- 与通知无关的表单规则、字段校验本身
- 第三方库内部实现，且当前仓库无法控制

## 项目规范

### 唯一通知入口

项目内业务提示统一使用：

```ts
showNotification(message, {
  type: "warning",
  duration: 5500,
});
```

允许的 `type`：

- `"success"`
- `"info"`
- `"warning"`
- `"error"`

### 禁止项

以下写法在业务代码中视为违规：

```ts
ElMessage.success("保存成功");
ElMessage.warning("请选择文件");
ElMessage.error("请求失败");
ElMessage.info("已取消操作");
```

### 参数规则

- 第一参数只传消息内容 `message`
- 第二参数传展示配置，如 `type`、`duration`、`title`、`position`
- 不要把 `message` 再放进第二参数
- 不要为了兼容旧代码再新增第二套 message 封装

### 推荐写法

```ts
showNotification("保存成功", { type: "success" });
showNotification("请先选择文件", { type: "warning" });
showNotification("加载失败，请稍后重试", { type: "error" });
showNotification("已取消删除", { type: "info" });
```

## 替换规则

### 基础映射

- `ElMessage.success(msg)` -> `showNotification(msg, { type: "success" })`
- `ElMessage.info(msg)` -> `showNotification(msg, { type: "info" })`
- `ElMessage.warning(msg)` -> `showNotification(msg, { type: "warning" })`
- `ElMessage.error(msg)` -> `showNotification(msg, { type: "error" })`

### 带配置项的写法

把原来的展示配置平移到第二参数：

```ts
showNotification(message, {
  type: "warning",
  title: "提示",
  duration: 5500,
});
```

### import 收口

- 删除 `ElMessage` import
- 补充 `showNotification` import
- 优先统一从 `@/utils/notification` 或项目约定的统一出口导入

## 执行步骤

1. 先搜索业务代码中的 `ElMessage` 使用点
2. 按映射规则替换为 `showNotification`
3. 清理无用的 `ElMessage` import
4. 检查是否保留了原有 `type`、`duration`、`title`
5. 再次全局搜索，确认业务代码没有 `ElMessage` 残留

推荐搜索命令：

```powershell
rg -n "\bElMessage\b|ElMessage\.(success|warning|error|info)" src mock
```

## 验收标准

满足以下条件才算完成：

- `src/`、`mock/` 业务代码中无 `ElMessage` 调用残留
- 提示逻辑统一为 `showNotification(message, { type })`
- 原有文案未丢失
- 原有额外配置未丢失
- 未引入新的通知封装分支

注意：

- 类似 `src/types/auto-imports.d.ts` 的生成文件声明不属于业务调用残留
- 需要区分“类型声明存在”与“业务代码实际调用”

## 本次迁移方案摘要

本次会话确认的迁移策略如下：

- 将项目内业务代码中的 `ElMessage.success/info/warning/error` 全部替换为 `showNotification`
- 不保留兼容层，不新增别名入口
- `showNotification` 继续作为唯一通知封装
- 以搜索结果和专项测试作为验收依据

## 常见误区

- 误区：只有 `warning/error` 需要替换
  纠正：`success/info/warning/error` 都要统一

- 误区：`type` 可以继续写在第一个参数里
  纠正：`type` 必须放第二个参数对象

- 误区：只改调用，不清 import 也没关系
  纠正：无用 `ElMessage` import 也需要清理

- 误区：`auto-imports.d.ts` 里还有 `ElMessage` 声明就说明迁移失败
  纠正：生成类型声明不等于业务代码仍在调用
