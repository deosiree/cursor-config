# 代码重构最佳实践规则

## 1. 代码组织优化

### 原则
将相关的方法按功能分组，使用清晰的分组注释标识，提高代码的可读性和可维护性。

### 实践方法

#### 1.1 方法分组
将 `methods` 对象中的方法按功能模块分组，每个分组使用注释标识：

```javascript
methods: {
  // ==================== 分组名称 ====================
  // 方法1
  method1() { },
  // 方法2
  method2() { },

  // ==================== 另一个分组 ====================
  // 方法3
  method3() { },
}
```

#### 1.2 常见分组类型
- **模态框控制**：处理模态框的打开、关闭、重置等操作
- **文件上传相关**：处理文件上传、移除、选择等操作
- **文件验证相关**：处理文件格式、扩展名等验证逻辑
- **表单提交和业务逻辑**：处理表单提交、数据校验、API调用等核心业务
- **下载相关**：处理各种文件下载功能
- **用户偏好和UI辅助**：处理用户偏好设置、UI辅助功能等

#### 1.3 分组顺序建议
1. 生命周期和初始化相关
2. UI交互控制（模态框、表单等）
3. 数据操作（上传、验证、处理）
4. 业务逻辑（API调用、数据处理）
5. 辅助功能（工具方法、用户偏好等）

### 示例

```javascript
methods: {
  // ==================== 模态框控制 ====================
  handleButtonClick() { },
  handleClose() { },
  resetForm() { },

  // ==================== 文件上传相关 ====================
  handleFileUpload() { },
  removeFile() { },

  // ==================== 文件验证相关 ====================
  validateFileExtension() { },
  validateBackFillFile() { },

  // ==================== 表单提交和业务逻辑 ====================
  handleOK() { },
  handleValidation() { },
  handleBatchUpdate() { },

  // ==================== 下载相关 ====================
  downloadFailedEntriesByLang() { },
  downloadAttachment() { },

  // ==================== 用户偏好和UI辅助 ====================
  queryBackfillFieldsPreference() { },
  selectAllBackfillFields() { },
}
```

---

## 2. 提取重复逻辑为辅助方法

### 原则
识别代码中的重复模式，提取为可复用的辅助方法，减少代码重复，提高可维护性。

### 实践方法

#### 2.1 识别重复模式
查找以下重复模式：
- **相同的数据提取逻辑**：多次从同一数据源提取不同字段
- **相同的验证逻辑**：多次执行相同的验证步骤
- **相同的错误处理**：重复的错误处理和提示逻辑
- **相同的数据转换**：多次执行相同的数据转换操作

#### 2.2 提取辅助方法
将重复逻辑提取为通用辅助方法，遵循以下原则：

1. **方法命名清晰**：使用描述性的方法名，清楚表达方法的功能
2. **参数化设计**：通过参数传递差异化的部分，使方法具有通用性
3. **单一职责**：每个辅助方法只负责一个明确的功能
4. **返回值统一**：统一返回值的格式，便于调用方处理

#### 2.3 重构步骤

1. **识别重复代码**：找到两处或以上相似的代码块
2. **分析差异点**：确定哪些部分是变化的，哪些是相同的
3. **设计方法签名**：设计参数来传递变化的部分
4. **提取方法**：创建辅助方法，将重复逻辑移入其中
5. **替换调用**：用新方法替换所有重复的代码块
6. **测试验证**：确保重构后功能正常

### 示例

#### 重构前（重复代码）
```javascript
// 方法1：下载失败词条
downloadFailedEntriesByLang(lang) {
  const failedInfos = (this.detailsByLang[lang] && this.detailsByLang[lang].failedEntryInfos) || [];
  if (failedInfos.length === 0) {
    message.warning(`没有${lang}的失败词条数据可导出`);
    return;
  }
  // ... 后续处理
}

// 方法2：下载异常信息
downloadExceptionInfosByLang(lang) {
  const exceptionVos = (this.detailsByLang[lang] && this.detailsByLang[lang].exceptionVos) || [];
  if (exceptionVos.length === 0) {
    message.warning(`没有${lang}的异常信息可下载`);
    return;
  }
  // ... 后续处理
}
```

#### 重构后（提取辅助方法）
```javascript
// 辅助方法：提取数据并验证
extractDataByLang(lang, fieldName, emptyMessage) {
  const data = (this.detailsByLang[lang] && this.detailsByLang[lang][fieldName]) || [];
  if (data.length === 0) {
    message.warning(emptyMessage);
    return null;
  }
  return data;
}

// 方法1：使用辅助方法
downloadFailedEntriesByLang(lang) {
  const failedInfos = this.extractDataByLang(lang, 'failedEntryInfos', `没有${lang}的失败词条数据可导出`);
  if (!failedInfos) return;
  // ... 后续处理
}

// 方法2：使用辅助方法
downloadExceptionInfosByLang(lang) {
  const exceptionVos = this.extractDataByLang(lang, 'exceptionVos', `没有${lang}的异常信息可下载`);
  if (!exceptionVos) return;
  // ... 后续处理
}
```

### 辅助方法命名建议

- **数据提取**：`extractXxx`, `getXxx`, `fetchXxx`
- **数据验证**：`validateXxx`, `checkXxx`, `verifyXxx`
- **数据转换**：`transformXxx`, `convertXxx`, `formatXxx`
- **数据处理**：`processXxx`, `handleXxx`, `prepareXxx`

---

## 3. 应用场景

### 何时进行代码组织优化
- 当 `methods` 对象中的方法数量较多（>10个）时
- 当方法之间有明显功能分组时
- 当代码可读性下降，难以快速定位方法时

### 何时提取重复逻辑
- 当发现两处或以上相似的代码块时
- 当修改一处逻辑需要同步修改多处时
- 当代码重复度较高，影响可维护性时

---

## 4. 注意事项

1. **不要过度抽象**：避免为了提取而提取，确保提取的方法确实有复用价值
2. **保持方法内聚性**：相关的方法应该放在同一分组中
3. **注释要准确**：分组注释应该准确反映该组方法的功能
4. **遵循现有规范**：如果项目已有代码组织规范，应遵循项目规范

---

## 5. 检查清单

### 代码组织检查
- [ ] 方法是否按功能分组？
- [ ] 每个分组是否有清晰的注释标识？
- [ ] 相关方法是否放在同一分组？
- [ ] 分组顺序是否合理？

### 重复逻辑检查
- [ ] 是否存在重复的数据提取逻辑？
- [ ] 是否存在重复的验证逻辑？
- [ ] 是否存在重复的错误处理？
- [ ] 是否已提取为可复用的辅助方法？
