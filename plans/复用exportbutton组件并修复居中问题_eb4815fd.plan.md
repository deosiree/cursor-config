---
name: 复用exportButton组件并修复居中问题
overview: 修改去重功能，改为复用 `src/components/Button/exportButton.vue` 组件，而不是 `src/components/export/index.vue`。同时修复模态框居中显示问题。
todos: []
---

# 复用exportButton组件并修复居中问题

## 目标

1. 将去重功能的导出改为复用 `src/components/Button/exportButton.vue` 组件
2. 修复导出模态框居中显示问题

## 当前问题

1. 当前使用的是 `src/components/export/index.vue`，需要改为 `exportButton.vue`
2. 模态框显示位置偏下，需要居中显示

## 实现方案

### 1. 替换导出组件

- 移除 `ExportModal`（`src/components/export/index.vue`）的导入和使用
- 添加 `ExportButton`（`src/components/Button/exportButton.vue`）组件
- 隐藏按钮，只显示模态框（通过 CSS 或条件渲染）

### 2. 修改导出逻辑

- `exportButton.vue` 默认调用后端接口 `entryExportByCondition`
- 对于去重场景，需要直接导出前端数据为 CSV
- 方案：通过 ref 获取组件实例，重写或拦截导出逻辑
- 或者：修改 `exportButton.vue` 支持自定义导出函数（通过 prop）

### 3. 修复居中问题

- `CustomModal` 已有 `centered` 属性，但可能不生效
- 检查是否需要额外的样式或配置
- 确保模态框在父容器中间显示

## 具体修改

### 文件：`src/views/fileManage/filterExcel.vue`

#### 1. 替换组件导入

```javascript
// 移除
import ExportModal from "@/components/export/index.vue";

// 添加
import ExportButton from "@/components/Button/exportButton.vue";
```



#### 2. 替换模板中的组件

```vue
<!-- 移除 -->
<ExportModal ... />

<!-- 添加 -->
<ExportButton 
  ref="exportButtonRef"
  :dataSource="deduplicatedDataSource" 
  :fieldOptions_="entryParams.exportFields" 
  size="middle" 
  buttonTitle="导出去重数据"
  :defaultStatusCheck="false"
  style="display: none;"
  @afterClose="handleExportAfterClose"
/>
```



#### 3. 修改去重完成后的逻辑

- 在 `executeDeduplicateExport` 中，通过 ref 调用 `showExportModal` 方法
- 需要拦截或重写导出逻辑，使用自定义的 CSV 导出方法

#### 4. 处理导出逻辑

- 方案A：修改 `exportButton.vue` 添加 `customExport` prop，支持自定义导出函数
- 方案B：在父组件中监听导出事件，拦截并执行自定义导出
- 方案C：直接修改 `exportButton.vue` 的导出逻辑，检测到是去重场景时使用前端数据

### 文件：`src/components/Button/exportButton.vue`（如果需要）

#### 添加自定义导出支持

- 添加 `customExport` prop（函数类型）
- 在 `handleOK` 中，如果提供了 `customExport`，调用它而不是后端接口