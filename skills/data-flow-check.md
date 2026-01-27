# 数据流问题排查清单 Skill

## Skill 目的

- 当你**遇到状态变化时序、异步操作、DOM 更新等数据流相关问题时**，帮助你：
  - 快速定位问题（状态变化时序不当、异步操作未等待、方法职责混淆等）
  - 追踪完整的数据流路径（从状态变化起点到最终效果）
  - 识别根因（watch 副作用、时序控制不当、测试用例不符合实际逻辑等）
  - 生成修复方案（响应式关闭模式、时序控制、方法职责分离等）
  - 修复测试用例（调整期望、使用实际业务逻辑、等待异步操作）

## 如何触发（对 Cursor 说）

- 推荐用法：
  - `@数据流问题排查 模态框切换时出现闪烁，帮我检查一下是不是时序控制问题`
  - `@数据流问题排查 测试用例失败了，期望的行为和实际代码逻辑不一致`
  - `@数据流问题排查 接口响应后立即关闭旧状态，但新状态还未渲染，应该怎么修复`
  - `@数据流问题排查 watch 中执行副作用导致问题，应该怎么重构`

> Skill 本身会**分析和定位问题，并给出修复建议**，如需真正修改代码，由你再明确下一个指令（例如"现在开始帮我修复这个问题"）。

## 分析步骤

### 1. 快速问题识别（只读）

- **检查问题类型**：
  - 状态变化时序问题：新状态已设置，但旧状态还未关闭
  - 异步操作时序问题：接口响应后立即执行操作，但 DOM 还未更新
  - 方法职责混淆问题：期望某个方法执行操作，但实际职责不同
  - Loading 状态管理问题：loading 状态提前关闭

- **检查 watch 中的副作用**：
  ```js
  // 检查是否有这样的代码
  watch: {
    validationVisible(newVal) {
      if (newVal) {
        this.internalVisible = false; // 副作用：立即关闭旧模态框
      }
    }
  }
  ```
  - 如果 watch 中直接修改其他状态：可能是时序控制问题
  - 如果关闭逻辑在 watch 中：应该移到业务逻辑方法中

- **检查异步操作时序**：
  ```js
  // 检查是否有这样的代码
  async handleValidation() {
    const result = await entryValidate_v2(...);
    this.validationVisible = true;
    this.internalVisible = false; // 问题：没有等待 DOM 更新
  }
  ```
  - 如果设置新状态后立即关闭旧状态：可能是时序控制问题
  - 如果缺少 `$nextTick`：应该添加等待 DOM 更新的步骤

- **检查测试用例**：
  ```js
  // 检查测试用例是否直接设置状态
  wrapper.vm.updateVisible = true;
  expect(wrapper.vm.validationVisible).toBe(false); // 问题：期望立即关闭
  ```
  - 如果测试用例直接设置状态：可能不符合实际业务逻辑
  - 如果测试用例期望立即关闭：应该等待异步操作完成

### 2. 数据流追踪（Data Flow Tracing）

- **状态变化路径追踪**：
  ```
  起点（接口响应/用户操作）
    ↓
  设置新状态（visible = true）
    ↓
  DOM 更新（异步）
    ↓
  $nextTick 回调（如果有）
    ↓
  关闭旧状态（visible = false）
    ↓
  关闭 loading 状态
  ```

- **检查每个步骤的时序**：
  - 接口响应后是否立即设置新状态？
  - 设置新状态后是否立即关闭旧状态？
  - 是否使用 `$nextTick` 等待 DOM 更新完成？
  - loading 状态是否在新模态框渲染完成后才关闭？

- **检查方法调用链**：
  ```js
  handleOK()
    ↓
  handleValidation() / handleBatchUpdate()
    ↓
  接口调用（异步）
    ↓
  设置新状态
    ↓
  $nextTick（等待 DOM 更新）
    ↓
  关闭旧状态
  ```

### 3. 根因定位（Root Cause Analysis）

- **常见根因类型**：

| 根因类型 | 典型代码模式 | 问题说明 |
|---------|------------|---------|
| **watch 中执行副作用** | `watch: { validationVisible(newVal) { if (newVal) this.internalVisible = false; } }` | watch 同步执行，但 DOM 更新是异步的 |
| **忽略异步操作时序** | `this.validationVisible = true; this.internalVisible = false;` | 没有等待 DOM 更新完成 |
| **测试用例不符合实际逻辑** | `wrapper.vm.updateVisible = true; expect(wrapper.vm.validationVisible).toBe(false);` | 直接设置状态，而不是通过业务方法触发 |
| **方法职责混淆** | 期望 `handleCloseInternal` 关闭所有模态框 | 实际只关闭主模态框 |

- **检查清单**：
  - [ ] watch 中是否有直接修改其他状态的逻辑？
  - [ ] 是否在设置新状态后立即关闭旧状态？
  - [ ] 是否缺少 `$nextTick` 等待步骤？
  - [ ] 测试用例是否直接设置状态，而不是调用业务方法？
  - [ ] 测试用例是否期望立即关闭的行为？
  - [ ] 方法职责是否清晰？

### 4. 修复方案生成（Solution Generation）

- **响应式关闭模式**：
  ```js
  // 正确的模式
  async handleValidation() {
    const result = await entryValidate_v2(...);
    // 1. 接口响应后，先设置新状态
    this.validationVisible = true;
    // 2. 使用 $nextTick 等待 DOM 更新完成
    this.$nextTick(() => {
      // 3. 在 $nextTick 回调中关闭旧状态
      this.internalVisible = false;
    });
  }
  ```

- **Loading 状态管理**：
  ```js
  // 正确的模式
  async handleOK() {
    this.loading = true;
    try {
      await this.handleValidation();
      // 等待新模态框渲染完成后再关闭 loading
      this.$nextTick(() => {
        this.loading = false;
      });
    } catch (error) {
      // 错误处理：确保 loading 被正确关闭
      this.loading = false;
      throw error;
    }
  }
  ```

- **移除 watch 中的副作用**：
  ```js
  // 修改前
  watch: {
    validationVisible(newVal) {
      if (newVal) {
        setModalAriaHidden(this, document);
        this.internalVisible = false; // 副作用：应该移除
      }
    }
  }

  // 修改后
  watch: {
    validationVisible(newVal) {
      if (newVal) {
        setModalAriaHidden(this, document);
        // 移除副作用，关闭逻辑移到业务方法中
      }
    }
  }
  ```

- **修复测试用例**：
  ```js
  // 修改前
  wrapper.vm.updateVisible = true;
  await nextTick();
  expect(wrapper.vm.validationVisible).toBe(false);

  // 修改后
  const { entryBatchImportExcel_V1_5 } = await import('@/utils/excelUtils');
  entryBatchImportExcel_V1_5.mockResolvedValueOnce({
    code: 201,
    msgBylang: [...]
  });
  wrapper.vm.formModel.backfillFields = ['english'];
  wrapper.vm.formModel.backFillFile = new File(['test'], 'test.csv');
  
  await wrapper.vm.handleBatchUpdate(); // 使用实际业务方法
  await nextTick();
  await nextTick(); // 等待额外的 $nextTick
  expect(wrapper.vm.validationVisible).toBe(false);
  ```

### 5. 验证与预防（Verification & Prevention）

- **功能验证**：
  - [ ] 模态框切换是否流畅？
  - [ ] 是否还有视觉闪烁？
  - [ ] loading 状态是否正确管理？

- **测试验证**：
  - [ ] 所有测试用例是否通过？
  - [ ] 测试用例是否覆盖实际业务场景？
  - [ ] 测试用例是否等待异步操作完成？

- **代码审查**：
  - [ ] 是否遵循响应式关闭模式？
  - [ ] 方法职责是否清晰？
  - [ ] 是否避免了在 watch 中执行副作用？

- **预防措施**：
  - 统一时序控制模式：接口响应 → 设置新状态 → $nextTick → 关闭旧状态
  - 明确方法职责：在代码注释中说明方法的职责
  - 测试覆盖实际场景：测试应该模拟实际的业务场景（接口调用）

## 输出要求

- **问题定位**：
  - 给出问题类型（状态变化时序问题 / 异步操作时序问题 / 方法职责混淆问题等）
  - 给出具体检查命令和预期结果
  - 给出可能的原因分析

- **修复建议**：
  - 给出响应式关闭模式的具体实现方案
  - 给出时序控制的正确做法（使用 `$nextTick`）
  - 给出测试用例的修复建议（使用实际业务逻辑、等待异步操作）

- **如需真正修改代码**：
  - 由你再明确下一个指令（例如"现在开始帮我修复这个问题"）
  - 或直接说"实现"，我会按建议方案自动修改代码

## 相关文件

- 排查清单：`.cursor/skills/todolist/数据流问题排查清单.md`
- 易错清单：`.cursor/skills/todolist/数据流问题易错清单.md`
- 组件实现示例：`src/components/Button/fileManage/backFill/modal_v1.5.vue`
- 测试示例：`tests/unit/components/BackFillModal_v1.5.test.js`

## 实际案例

### 案例：模态框响应式关闭重构

**问题描述**：
- 模态框切换时出现视觉闪烁，新模态框还未渲染完成，旧模态框就已经关闭
- 测试用例失败，期望的行为与实际代码逻辑不一致

**问题类型**：
- 状态变化时序问题：在 watch 中立即执行副作用
- 测试用例不符合实际业务逻辑：直接设置状态，而不是通过业务方法触发

**修复方案**：
1. 移除 watch 中的关闭逻辑，只保留必要的响应逻辑（如 `setModalAriaHidden`）
2. 在业务逻辑方法中实现响应式关闭：
   - 接口响应后，先设置新状态
   - 使用 `$nextTick` 等待 DOM 更新完成
   - 在 `$nextTick` 回调中关闭旧状态
3. 管理 loading 状态：
   - 接口调用期间保持 loading
   - 在新模态框渲染完成后关闭 loading
   - 错误处理时确保 loading 被正确关闭
4. 修复测试用例：
   - 调整测试期望，等待异步操作完成
   - 使用实际业务逻辑方法触发状态变化
   - 区分方法职责，调用正确的方法

**修复效果**：
- 模态框切换流畅，无视觉闪烁
- 所有测试用例通过
- 代码逻辑清晰，方法职责明确
