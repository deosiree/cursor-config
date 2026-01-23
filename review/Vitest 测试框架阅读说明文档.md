# Vitest 测试框架阅读说明文档

## 目录

1. [基础概念](#基础概念)
2. [测试结构（describe, it, expect）](#测试结构describe-it-expect)
3. [生命周期钩子](#生命周期钩子)
4. [vi.mock 详解（重点）](#vimock-详解重点)
5. [Mock 函数（vi.fn）](#mock-函数vifn)
6. [模拟多种响应体情况](#模拟多种响应体情况)
7. [Vue 组件测试](#vue-组件测试)
8. [异步测试](#异步测试)
9. [常用断言方法](#常用断言方法)
10. [清理和重置](#清理和重置)
11. [实际案例解析](#实际案例解析)

---

## 基础概念

### 什么是单元测试

单元测试是对代码中最小可测试单元（通常是函数或组件）进行测试的方法。它的目的是：

- **验证功能正确性**：确保代码按预期工作
- **防止回归**：修改代码后确保原有功能不受影响
- **文档作用**：测试代码本身就是最好的使用示例
- **提高代码质量**：编写测试会促使你写出更可测试、更清晰的代码

### Vitest 简介

Vitest 是一个基于 Vite 的快速单元测试框架，具有以下特点：

- **快速**：利用 Vite 的快速 HMR（热模块替换）
- **兼容 Jest API**：如果你熟悉 Jest，可以无缝迁移
- **TypeScript 支持**：开箱即用的 TypeScript 支持
- **Vue 支持**：与 Vue Test Utils 完美集成

### 测试文件的基本结构

一个典型的测试文件结构如下：

```javascript
// 1. 导入测试工具和要测试的模块
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

// 2. Mock 依赖（如果需要）
vi.mock('@/utils/someUtils', () => ({
  someFunction: vi.fn()
}))

// 3. 编写测试用例
describe('组件名称或功能模块', () => {
  it('应该完成某个功能', () => {
    // 测试代码
    expect(1 + 1).toBe(2)
  })
})
```

---

## 测试结构（describe, it, expect）

### describe - 测试套件

`describe` 用于将相关的测试用例组织在一起，形成一个测试套件。

**语法：**
```javascript
describe('描述信息', () => {
  // 测试用例
})
```

**作用：**
- 组织测试：将相关的测试用例分组
- 提供上下文：描述信息说明了这组测试的目的
- 可以嵌套：`describe` 内部可以再嵌套 `describe`

**示例：**
```javascript
describe('FloatingToolBox - 悬浮工具仓组件', () => {
  describe('组件渲染', () => {
    // 关于组件渲染的测试
  })
  
  describe('单击和双击功能', () => {
    // 关于点击功能的测试
  })
})
```

### it / test - 测试用例

`it` 和 `test` 是等价的，用于定义一个具体的测试用例。

**语法：**
```javascript
it('测试描述', () => {
  // 测试代码
})

// 或者
test('测试描述', () => {
  // 测试代码
})
```

**测试描述应该：**
- 清晰说明测试的目的
- 使用"应该"、"能够"等词语，例如："应该渲染悬浮按钮"
- 描述期望的行为，而不是实现细节

**示例：**
```javascript
it('应该渲染悬浮按钮', () => {
  const wrapper = mount(FloatingToolBox)
  expect(wrapper.find('.floating-button').exists()).toBe(true)
})
```

### expect - 断言

`expect` 用于对值进行断言，验证是否符合预期。

**基本语法：**
```javascript
expect(实际值).toBe(期望值)
expect(实际值).toEqual(期望值)
```

**工作原理：**
1. `expect()` 接收一个实际值
2. 返回一个"匹配器"对象
3. 调用匹配器方法（如 `toBe`、`toEqual`）进行断言
4. 如果断言失败，测试会报错

**示例：**
```javascript
expect(2 + 2).toBe(4)                    // 严格相等
expect({ a: 1 }).toEqual({ a: 1 })        // 深度相等
expect('hello').toContain('ell')          // 包含
expect(true).toBeTruthy()                 // 真值
```

---

## 生命周期钩子

生命周期钩子用于在测试的不同阶段执行设置和清理工作。

### beforeEach - 每个测试前执行

在每个测试用例**之前**执行，用于设置测试环境。

**使用场景：**
- 创建测试数据
- 重置 mock 函数
- 设置全局状态

**示例：**
```javascript
describe('组件测试', () => {
  let wrapper
  
  beforeEach(() => {
    // 每个测试前都会执行
    wrapper = mount(MyComponent, {
      props: { title: '测试标题' }
    })
  })
  
  it('测试1', () => {
    // wrapper 已经准备好了
  })
  
  it('测试2', () => {
    // wrapper 会重新创建
  })
})
```

### afterEach - 每个测试后执行

在每个测试用例**之后**执行，用于清理工作。

**使用场景：**
- 卸载组件
- 清理 DOM
- 重置 mock 状态

**示例：**
```javascript
describe('组件测试', () => {
  let wrapper
  
  afterEach(() => {
    // 每个测试后都会执行
    if (wrapper) {
      wrapper.unmount()  // 卸载组件
    }
    vi.clearAllMocks()   // 清除所有 mock
    document.body.innerHTML = ''  // 清理 DOM
  })
})
```

### beforeAll / afterAll - 所有测试前后执行

在整个测试套件的**开始前**和**结束后**执行，只执行一次。

**使用场景：**
- 初始化数据库连接
- 设置全局配置
- 清理全局资源

**示例：**
```javascript
describe('API 测试', () => {
  let apiClient
  
  beforeAll(() => {
    // 只在所有测试开始前执行一次
    apiClient = createApiClient()
  })
  
  afterAll(() => {
    // 只在所有测试结束后执行一次
    apiClient.close()
  })
})
```

**执行顺序：**
```
beforeAll
  → beforeEach → it('测试1') → afterEach
  → beforeEach → it('测试2') → afterEach
afterAll
```

---

## vi.mock 详解（重点）

`vi.mock` 是 Vitest 中最重要的功能之一，用于模拟（Mock）模块。当你测试一个模块时，如果它依赖其他模块（如 API 调用、工具函数等），你可以用 `vi.mock` 替换这些依赖，从而：

- **隔离测试**：不依赖外部服务
- **控制行为**：让依赖返回你期望的值
- **提高速度**：避免真实的网络请求或复杂计算

### vi.mock 的参数

`vi.mock` 接受两个参数：

```javascript
vi.mock(模块路径, 工厂函数)
```

#### 第一个参数：模块路径（字符串）

这是要 mock 的模块的路径，通常是：

- **相对路径**：`'./utils/helper'`
- **绝对路径**：`'@/utils/helper'`（需要配置别名）
- **npm 包**：`'axios'`、`'ant-design-vue'`

**重要提示：**
- 路径必须与 `import` 语句中的路径**完全一致**
- 如果使用别名（如 `@/`），确保 `vitest.config.js` 中配置了相同的别名

**示例：**
```javascript
// 如果代码中这样导入：
import { getLanguage } from '@/http/api/translate'

// 那么 mock 时路径必须一致：
vi.mock('@/http/api/translate', () => {
  // mock 实现
})
```

#### 第二个参数：工厂函数（可选）

工厂函数返回 mock 的实现。如果不提供，Vitest 会自动 mock 该模块。

**工厂函数的形式：**
```javascript
vi.mock('模块路径', () => {
  // 返回一个对象，模拟模块的导出
  return {
    // 命名导出
    functionName: vi.fn(),
    // 默认导出
    default: {}
  }
})
```

### 返回值类型说明

#### 1. 普通对象

当模块导出普通对象时：

```javascript
// 原始模块：@/utils/notificationUtils.js
export const closeAllNotifications = () => { /* ... */ }

// Mock 实现：
vi.mock('@/utils/notificationUtils', () => ({
  closeAllNotifications: vi.fn()  // 返回一个 mock 函数
}))
```

**说明：**
- 返回的对象结构应该与原始模块的导出结构一致
- 使用 `vi.fn()` 创建 mock 函数

#### 2. 函数（同步）

当模块导出同步函数时：

```javascript
// 原始模块：@/utils/domUtils.js
export const setModalAriaHidden = (element) => { /* ... */ }

// Mock 实现：
vi.mock('@/utils/domUtils', () => ({
  setModalAriaHidden: vi.fn()  // 默认什么都不做
}))
```

#### 3. 异步函数（Promise）

当模块导出异步函数（返回 Promise）时，需要让 mock 函数返回 Promise：

```javascript
// 原始模块：@/http/api/translate.js
export const getLanguage = async () => {
  const response = await fetch('/api/languages')
  return response.json()
}

// Mock 实现 - 方式1：使用 Promise.resolve
vi.mock('@/http/api/translate', () => ({
  getLanguage: vi.fn(() => Promise.resolve({
    data: {
      list: [
        { name: '英文', code: 'english' },
        { name: '俄文', code: 'russian' }
      ]
    }
  }))
}))

// Mock 实现 - 方式2：使用 async 函数
vi.mock('@/http/api/translate', () => ({
  getLanguage: vi.fn(async () => ({
    data: {
      list: [
        { name: '英文', code: 'english' }
      ]
    }
  }))
}))
```

**关键点：**
- 使用 `Promise.resolve()` 或 `async` 函数返回 Promise
- 返回的数据结构应该与真实 API 返回的结构一致

#### 4. 多个导出

当模块有多个导出时：

```javascript
// 原始模块：@/http/api/workbench.js
export const getI18nAdress = async () => { /* ... */ }
export const getBranches = async () => { /* ... */ }
export const gitPush = async () => { /* ... */ }

// Mock 实现：
vi.mock('@/http/api/workbench.js', () => ({
  getI18nAdress: vi.fn(() => Promise.resolve({
    data: { list: [{ ip: '192.168.1.1' }] }
  })),
  getBranches: vi.fn(() => Promise.resolve({
    data: { list: ['main', 'develop'] }
  })),
  gitPush: vi.fn(() => Promise.resolve({}))
}))
```

#### 5. 默认导出

当模块使用默认导出时：

```javascript
// 原始模块：@/utils/helper.js
export default {
  helper: () => {}
}

// Mock 实现：
vi.mock('@/utils/helper.js', () => ({
  default: {
    helper: vi.fn()
  }
}))
```

#### 6. 混合导出（默认导出 + 命名导出）

```javascript
// 原始模块
export default class MyClass {}
export const helper = () => {}

// Mock 实现：
vi.mock('模块路径', () => ({
  default: class MockClass {},
  helper: vi.fn()
}))
```

#### 7. 第三方库（如 ant-design-vue）

```javascript
// Mock ant-design-vue 的 message 和 notification
vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),  // message.success() 是一个函数
    error: vi.fn(),
    warning: vi.fn()
  },
  notification: {
    success: vi.fn(),
    error: vi.fn()
  }
}))
```

### 实际示例解析

让我们看一个项目中的实际例子：

```javascript
// 来自 FloatingToolBox.test.js

// Mock 1: 简单的工具函数
vi.mock('@/utils/notificationUtils', () => ({
  closeAllNotifications: vi.fn()  // 创建一个什么都不做的函数
}))

// Mock 2: API 调用（返回 Promise）
vi.mock('@/http/api/translate', () => ({
  getLanguage: vi.fn(() => Promise.resolve({
    data: {
      list: [
        { name: '英文', code: 'english' },
        { name: '俄文', code: 'russian' }
      ]
    }
  }))
}))

// Mock 3: 多个 API 函数
vi.mock('@/http/api/workbench.js', () => ({
  getI18nAdress: vi.fn(() => Promise.resolve({
    data: { list: [{ ip: '192.168.1.1' }] }
  })),
  getBranches: vi.fn(() => Promise.resolve({
    data: { list: ['main', 'develop'] }
  })),
  gitPush: vi.fn(() => Promise.resolve({}))
}))

// Mock 4: 第三方库
vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))
```

**在测试中使用：**

```javascript
it('应该获取语种列表', async () => {
  // 动态导入 mock 的函数
  const { getLanguage } = await import('@/http/api/translate')
  
  // 挂载组件（组件内部会调用 getLanguage）
  wrapper = mount(FloatingToolBox)
  
  // 等待异步操作完成
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 验证 getLanguage 被调用了
  expect(getLanguage).toHaveBeenCalled()
})
```

### vi.mock 的注意事项

1. **提升（Hoisting）**：`vi.mock` 会被提升到文件顶部执行，无论你写在哪里
2. **路径必须匹配**：mock 路径必须与 import 路径完全一致
3. **自动 Mock**：如果不提供工厂函数，Vitest 会自动 mock 所有导出
4. **作用域**：mock 在整个测试文件中有效

---

## Mock 函数（vi.fn）

`vi.fn()` 用于创建一个 mock 函数，可以：

- 记录函数调用情况（被调用了多少次、传入了什么参数）
- 控制函数返回值
- 替换真实函数

### 创建 Mock 函数

```javascript
const mockFn = vi.fn()
```

### 设置返回值

#### mockReturnValue - 同步返回值

```javascript
const mockFn = vi.fn()
mockFn.mockReturnValue(42)

console.log(mockFn())  // 42
console.log(mockFn())  // 42（每次调用都返回 42）
```

**示例：**
```javascript
const getItem = vi.fn()
getItem.mockReturnValue('{"x": 100, "y": 200}')

localStorage.getItem('position')  // 返回字符串
```

#### mockResolvedValue - Promise 成功值

用于模拟异步函数成功的情况：

```javascript
const fetchData = vi.fn()
fetchData.mockResolvedValue({ data: 'success' })

// 使用
const result = await fetchData()  // { data: 'success' }
```

**实际示例：**
```javascript
vi.mock('@/http/api/translate', () => ({
  getLanguage: vi.fn(() => Promise.resolve({
    data: { list: [] }
  }))
  // 或者
  // getLanguage: vi.fn().mockResolvedValue({ data: { list: [] } })
}))
```

#### mockRejectedValue - Promise 失败值

用于模拟异步函数失败的情况：

```javascript
const fetchData = vi.fn()
fetchData.mockRejectedValue(new Error('网络错误'))

// 使用
try {
  await fetchData()
} catch (error) {
  console.log(error.message)  // '网络错误'
}
```

**实际示例：**
```javascript
it('应该处理API错误', async () => {
  const { getLanguage } = await import('@/http/api/translate')
  
  // 让这次调用返回错误
  getLanguage.mockRejectedValueOnce(new Error('API Error'))
  
  // 测试错误处理逻辑
  wrapper = mount(FloatingToolBox)
  // ...
})
```

#### mockImplementation - 自定义实现

当需要更复杂的逻辑时：

```javascript
const mockFn = vi.fn()
mockFn.mockImplementation((arg) => {
  if (arg === 'a') return 1
  if (arg === 'b') return 2
  return 0
})

console.log(mockFn('a'))  // 1
console.log(mockFn('b'))  // 2
```

### 检查调用情况

#### toHaveBeenCalled - 是否被调用

```javascript
const mockFn = vi.fn()

mockFn()
expect(mockFn).toHaveBeenCalled()  // ✅ 通过

const anotherFn = vi.fn()
expect(anotherFn).toHaveBeenCalled()  // ❌ 失败（没有被调用）
```

#### toHaveBeenCalledWith - 检查调用参数

```javascript
const mockFn = vi.fn()

mockFn('hello', 123)
expect(mockFn).toHaveBeenCalledWith('hello', 123)  // ✅ 通过
expect(mockFn).toHaveBeenCalledWith('world')       // ❌ 失败
```

**实际示例：**
```javascript
it('应该调用 getLanguage', async () => {
  const { getLanguage } = await import('@/http/api/translate')
  
  wrapper = mount(FloatingToolBox)
  await nextTick()
  
  expect(getLanguage).toHaveBeenCalled()  // 检查是否被调用
})
```

#### toHaveBeenCalledTimes - 检查调用次数

```javascript
const mockFn = vi.fn()

mockFn()
mockFn()
mockFn()

expect(mockFn).toHaveBeenCalledTimes(3)  // ✅ 通过
expect(mockFn).toHaveBeenCalledTimes(2)  // ❌ 失败
```

**实际示例：**
```javascript
it('应该为每个语言调用一次 API', async () => {
  const translateTypes = ['zh', 'en', 'fr']
  const { entryImportExcle } = await import('@/http/api/entryManage')
  
  await entryBatchImportExcel(translateTypes, formData)
  
  expect(entryImportExcle).toHaveBeenCalledTimes(3)  // 调用了 3 次
})
```

### 链式调用（Once 方法）

有时候需要让函数在不同调用时返回不同的值：

```javascript
const mockFn = vi.fn()
  .mockResolvedValueOnce('第一次调用')
  .mockResolvedValueOnce('第二次调用')
  .mockResolvedValue('后续调用都返回这个')

await mockFn()  // '第一次调用'
await mockFn()  // '第二次调用'
await mockFn()  // '后续调用都返回这个'
await mockFn()  // '后续调用都返回这个'
```

**实际示例：**
```javascript
it('应该处理部分语言导入失败的情况', async () => {
  entryImportExcle
    .mockResolvedValueOnce({ code: 200 })           // 第一次调用成功
    .mockRejectedValueOnce({ message: '文件格式错误' })  // 第二次调用失败
    .mockResolvedValueOnce({ code: 200 })           // 第三次调用成功
  
  const result = await entryBatchImportExcel(['zh', 'en', 'fr'], formData)
  
  expect(result.success).toEqual(['zh', 'fr'])  // en 失败了
  expect(result.failed.get('文件格式错误')).toEqual(['en'])
})
```

---

## 模拟多种响应体情况

在实际测试中，同一个 API 可能需要返回不同的响应体来测试各种场景。Vitest 提供了多种方式来实现这个需求。

### 方法1：使用 mockResolvedValueOnce 链式调用（推荐）

**适用场景：** 同一个函数会被多次调用，每次调用需要返回不同的响应。

**语法：**
```javascript
mockFn
  .mockResolvedValueOnce(第一次调用的返回值)
  .mockResolvedValueOnce(第二次调用的返回值)
  .mockResolvedValueOnce(第三次调用的返回值)
```

**示例：**

```javascript
it('应该处理部分语言导入失败的情况', async () => {
  const { entryImportExcle } = await import('@/http/api/entryManage')
  
  // 链式调用，每次调用返回不同的响应
  entryImportExcle
    .mockResolvedValueOnce({ code: 200 })                    // 第一次调用：成功
    .mockRejectedValueOnce({ message: '文件格式错误' })      // 第二次调用：失败
    .mockResolvedValueOnce({ code: 200 })                    // 第三次调用：成功
  
  const result = await entryBatchImportExcel(['zh', 'en', 'fr'], formData)
  
  expect(result.success).toEqual(['zh', 'fr'])  // en 失败了
  expect(result.failed.get('文件格式错误')).toEqual(['en'])
})
```

**说明：**
- `mockResolvedValueOnce` 只对**下一次调用**生效
- 调用顺序必须与链式调用的顺序一致
- 如果调用次数超过链式调用的次数，最后一次的值会被重复使用

### 方法2：在测试中动态设置 mockReturnValue

**适用场景：** 不同测试用例需要不同的响应，但每个测试用例内部调用多次时返回相同值。

**示例：**

```javascript
describe('API 测试', () => {
  let apiFunction
  
  beforeEach(async () => {
    const module = await import('@/http/api/data')
    apiFunction = module.getData
  })
  
  it('应该处理成功响应', async () => {
    // 在这个测试中，所有调用都返回成功响应
    apiFunction.mockResolvedValue({
      code: 200,
      data: { list: [1, 2, 3] }
    })
    
    const result = await apiFunction()
    expect(result.code).toBe(200)
  })
  
  it('应该处理失败响应', async () => {
    // 在这个测试中，所有调用都返回失败响应
    apiFunction.mockRejectedValue({
      code: 500,
      message: '服务器错误'
    })
    
    try {
      await apiFunction()
    } catch (error) {
      expect(error.code).toBe(500)
    }
  })
})
```

### 方法3：使用 mockImplementation 根据参数返回不同响应

**适用场景：** 需要根据传入的参数返回不同的响应。

**示例：**

```javascript
it('应该根据参数返回不同的响应', async () => {
  const { getData } = await import('@/http/api/data')
  
  // 根据参数返回不同的响应
  getData.mockImplementation((params) => {
    if (params.type === 'success') {
      return Promise.resolve({ code: 200, data: '成功' })
    } else if (params.type === 'error') {
      return Promise.reject({ code: 500, message: '错误' })
    } else {
      return Promise.resolve({ code: 201, data: '部分成功' })
    }
  })
  
  const result1 = await getData({ type: 'success' })
  expect(result1.code).toBe(200)
  
  const result2 = await getData({ type: 'other' })
  expect(result2.code).toBe(201)
})
```

### 方法4：在 beforeEach 中重置并设置默认值

**适用场景：** 大部分测试使用相同的响应，少数测试需要特殊响应。

**示例：**

```javascript
describe('API 测试', () => {
  let apiFunction
  
  beforeEach(async () => {
    const module = await import('@/http/api/data')
    apiFunction = module.getData
    
    // 设置默认响应（大部分测试使用）
    apiFunction.mockResolvedValue({
      code: 200,
      data: { list: [] }
    })
  })
  
  it('默认情况应该返回空列表', async () => {
    const result = await apiFunction()
    expect(result.data.list).toEqual([])
  })
  
  it('特殊情况应该返回错误', async () => {
    // 覆盖默认值，只在这个测试中生效
    apiFunction.mockRejectedValueOnce({
      code: 500,
      message: '特殊错误'
    })
    
    try {
      await apiFunction()
    } catch (error) {
      expect(error.code).toBe(500)
    }
  })
})
```

### 方法5：模拟复杂的响应体结构

**适用场景：** API 响应体结构复杂，包含多种字段组合。

**示例：**

```javascript
it('应该处理包含 failedEntryInfos 的响应', async () => {
  const { entryImportExcle } = await import('@/http/api/entryManage')
  
  // 模拟复杂的错误响应结构
  entryImportExcle.mockRejectedValueOnce({
    response: {
      data: {
        code: 201,
        data: {
          globalMessage: '更新词条翻译时部分词条更新后存在警告和异常信息',
          failedEntryInfos: [
            {
              id: '1',
              entry: '测试词条1',
              english: 'test entry 1'
            },
            {
              entryInfoVO: {
                entryInfoEntitie: [
                  { id: '2', entry: '测试词条2', english: 'test entry 2' }
                ]
              }
            }
          ],
          exceptionVos: []
        }
      }
    }
  })
  
  const result = await entryBatchImportExcel(['zh'], formData)
  
  expect(result.code).toBe(201)
  expect(result.failedEntryInfos).toHaveLength(2)
  expect(result.globalMessage).toBe('更新词条翻译时部分词条更新后存在警告和异常信息')
})
```

### 方法6：组合使用多种响应类型

**适用场景：** 同一个测试中需要测试成功、失败、部分成功等多种情况。

**示例：**

```javascript
it('应该处理多种响应情况', async () => {
  const { entryImportExcle } = await import('@/http/api/entryManage')
  
  entryImportExcle
    .mockResolvedValueOnce({ code: 200 })                    // 成功
    .mockRejectedValueOnce({ message: '文件格式错误' })      // 失败（简单错误）
    .mockRejectedValueOnce({                                 // 失败（复杂错误）
      response: {
        data: {
          code: 201,
          data: {
            globalMessage: '部分失败',
            failedEntryInfos: [{ id: '1', entry: '词条1' }],
            exceptionVos: []
          }
        }
      }
    })
    .mockResolvedValueOnce({ code: 200 })                    // 成功
  
  const result = await entryBatchImportExcel(['zh', 'en', 'fr', 'de'], formData)
  
  expect(result.success).toEqual(['zh', 'de'])
  expect(result.failed.get('文件格式错误')).toEqual(['en'])
  expect(result.failedEntryInfos).toHaveLength(1)
})
```

### 实际项目案例

以下是一个完整的实际案例，展示了如何处理多种响应体情况：

```javascript
describe('entryBatchImportExcel - 批量导入', () => {
  let entryImportExcle
  
  beforeEach(async () => {
    const module = await import('@/http/api/entryManage')
    entryImportExcle = module.entryImportExcle
    vi.clearAllMocks()
  })
  
  // 案例1：全部成功
  it('应该成功导入所有语言', async () => {
    entryImportExcle.mockResolvedValue({ code: 200 })
    
    const result = await entryBatchImportExcel(['zh', 'en'], formData)
    
    expect(result.code).toBe(200)
    expect(result.success).toEqual(['zh', 'en'])
  })
  
  // 案例2：部分成功，部分失败
  it('应该处理部分语言导入失败的情况', async () => {
    entryImportExcle
      .mockResolvedValueOnce({ code: 200 })           // zh 成功
      .mockRejectedValueOnce({ message: '文件格式错误' })  // en 失败
      .mockResolvedValueOnce({ code: 200 })           // fr 成功
    
    const result = await entryBatchImportExcel(['zh', 'en', 'fr'], formData)
    
    expect(result.code).toBe(201)
    expect(result.success).toEqual(['zh', 'fr'])
    expect(result.failed.get('文件格式错误')).toEqual(['en'])
  })
  
  // 案例3：全部失败，但错误消息不同
  it('应该处理多个语言使用不同错误消息的情况', async () => {
    entryImportExcle
      .mockRejectedValueOnce({ message: '文件格式错误' })
      .mockRejectedValueOnce({ message: '网络错误' })
      .mockRejectedValueOnce({ data: { message: '服务器错误' } })
    
    const result = await entryBatchImportExcel(['zh', 'en', 'fr'], formData)
    
    expect(result.failed.get('文件格式错误')).toEqual(['zh'])
    expect(result.failed.get('网络错误')).toEqual(['en'])
    expect(result.failed.get('服务器错误')).toEqual(['fr'])
  })
  
  // 案例4：复杂响应结构（code=201 且包含详细错误信息）
  it('应该处理 code=201 且包含 failedEntryInfos 的情况', async () => {
    const mockFailedEntryInfos = [
      { id: '1', entry: '测试词条1', english: 'test entry 1' },
      {
        entryInfoVO: {
          entryInfoEntitie: [
            { id: '2', entry: '测试词条2', english: 'test entry 2' }
          ]
        }
      }
    ]
    
    entryImportExcle.mockRejectedValueOnce({
      response: {
        data: {
          code: 201,
          data: {
            globalMessage: '更新词条翻译时部分词条更新后存在警告和异常信息',
            failedEntryInfos: mockFailedEntryInfos,
            exceptionVos: []
          }
        }
      }
    })
    
    const result = await entryBatchImportExcel(['zh'], formData)
    
    expect(result.code).toBe(201)
    expect(result.failedEntryInfos).toEqual(mockFailedEntryInfos)
    expect(result.globalMessage).toBe('更新词条翻译时部分词条更新后存在警告和异常信息')
  })
})
```

### 注意事项

1. **调用顺序很重要**：使用 `mockResolvedValueOnce` 时，函数调用顺序必须与链式调用的顺序一致
2. **清理状态**：在 `beforeEach` 中使用 `vi.clearAllMocks()` 清除之前的调用记录
3. **动态导入**：使用 `await import()` 动态导入 mock 的函数，确保 mock 已生效
4. **响应结构一致性**：Mock 的响应结构应该与真实 API 的响应结构保持一致
5. **错误对象结构**：注意错误可能在不同位置（`error.message`、`error.data.message`、`error.response.data.message`）

### 选择哪种方法？

- **方法1（链式调用）**：适合同一个函数被多次调用，每次返回不同值
- **方法2（动态设置）**：适合不同测试用例需要不同响应
- **方法3（根据参数）**：适合需要根据参数返回不同响应
- **方法4（默认值）**：适合大部分测试使用相同响应
- **方法5（复杂结构）**：适合响应体结构复杂的情况
- **方法6（组合使用）**：适合需要测试多种场景的复杂情况

---

## Vue 组件测试

使用 `@vue/test-utils` 来测试 Vue 组件。

### mount - 挂载组件

`mount` 用于挂载组件到测试环境中：

```javascript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

const wrapper = mount(MyComponent)
```

**配置选项：**

```javascript
const wrapper = mount(MyComponent, {
  // Props
  props: {
    title: '测试标题',
    count: 10
  },
  
  // 全局配置
  global: {
    // 存根子组件
    stubs: {
      'ChildComponent': true,  // 简单存根
      'AnotherComponent': {    // 自定义存根
        template: '<div><slot></slot></div>',
        props: ['title']
      }
    },
    
    // Mock 全局属性
    mocks: {
      $store: {
        state: { user: { name: 'test' } }
      },
      $router: {
        push: vi.fn()
      }
    }
  }
})
```

### stubs - 存根子组件

存根（Stub）用于替换子组件，避免测试时渲染复杂的子组件：

```javascript
// 方式1：简单存根（替换为空的 div）
stubs: {
  'ChildComponent': true,
  'a-button': true
}

// 方式2：自定义存根
stubs: {
  'GitCommitButton': {
    template: '<button><slot></slot></button>',
    props: ['size', 'buttonTitle']
  }
}
```

**实际示例：**
```javascript
wrapper = mount(FloatingToolBox, {
  global: {
    stubs: {
      GitCommitButton: true,        // 简单存根
      'a-button': true,             // Ant Design 组件
      'a-form': true,
      'CustomModal': true,
      'BackFillModal': true
    }
  }
})
```

### mocks - 模拟全局属性

用于模拟 Vue 的全局属性，如 `$store`、`$router`：

```javascript
mocks: {
  $store: {
    state: {
      user: {
        department: 'default',
        userName: 'testUser'
      }
    },
    commit: vi.fn(),
    dispatch: vi.fn()
  }
}
```

### props - 传递 Props

```javascript
wrapper = mount(MyComponent, {
  props: {
    title: '测试标题',
    count: 10,
    visible: true
  }
})
```

### wrapper.vm - 访问组件实例

通过 `wrapper.vm` 可以访问组件的实例，包括：

- 数据属性
- 计算属性
- 方法

```javascript
// 访问数据
expect(wrapper.vm.panelVisible).toBe(false)

// 调用方法
wrapper.vm.handleClick()

// 修改数据
wrapper.vm.panelVisible = true
```

**实际示例：**
```javascript
it('双击应该显示工具面板', async () => {
  const button = wrapper.find('.floating-button')
  await button.trigger('dblclick')
  await nextTick()
  
  // 通过 wrapper.vm 访问组件的数据
  expect(wrapper.vm.panelVisible).toBe(true)
})
```

### wrapper.find - 查找元素

用于在组件中查找元素：

```javascript
// 通过选择器查找
const button = wrapper.find('.floating-button')
const form = wrapper.find('form')

// 通过组件查找
const child = wrapper.findComponent(ChildComponent)

// 查找所有匹配的元素
const buttons = wrapper.findAll('button')
```

**常用方法：**

```javascript
const element = wrapper.find('.button')

element.exists()        // 检查元素是否存在
element.text()          // 获取文本内容
element.html()          // 获取 HTML
element.attributes()    // 获取属性
element.classes()      // 获取类名
element.trigger('click')  // 触发事件
```

**实际示例：**
```javascript
it('应该渲染悬浮按钮', () => {
  wrapper = mount(FloatingToolBox)
  
  const button = wrapper.find('.floating-button')
  expect(button.exists()).toBe(true)  // 按钮存在
})

it('点击关闭应该关闭面板', async () => {
  const closeButton = wrapper.findAll('button').find(btn => btn.text() === '关闭')
  
  if (closeButton) {
    await closeButton.trigger('click')
    await nextTick()
    
    expect(wrapper.vm.panelVisible).toBe(false)
  }
})
```

### trigger - 触发事件

```javascript
// 触发点击事件
await button.trigger('click')

// 触发双击事件
await button.trigger('dblclick')

// 触发输入事件
await input.trigger('input', { target: { value: 'test' } })

// 触发键盘事件
await input.trigger('keydown.enter')
```

---

## 异步测试

Vue 组件和现代 JavaScript 代码中大量使用异步操作，测试时需要正确处理。

### async/await 的使用

测试异步代码时，测试函数应该是 `async`：

```javascript
it('应该获取数据', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})
```

### nextTick - 等待 Vue 更新

Vue 的更新是异步的，需要等待 DOM 更新完成：

```javascript
import { nextTick } from 'vue'

it('应该更新 DOM', async () => {
  wrapper.vm.count = 10
  await nextTick()  // 等待 Vue 更新 DOM
  
  expect(wrapper.find('.count').text()).toBe('10')
})
```

**实际示例：**
```javascript
it('双击应该显示工具面板', async () => {
  const button = wrapper.find('.floating-button')
  await button.trigger('dblclick')
  await nextTick()  // 等待 Vue 处理事件和更新 DOM
  
  expect(wrapper.vm.panelVisible).toBe(true)
})
```

### setTimeout - 处理定时器

当代码中有定时器时，需要等待定时器执行：

```javascript
it('应该延迟执行', async () => {
  wrapper.vm.startTimer()  // 内部有 setTimeout(200ms)
  
  // 等待定时器执行
  await new Promise(resolve => setTimeout(resolve, 250))
  await nextTick()
  
  expect(wrapper.vm.result).toBe('done')
})
```

**实际示例：**
```javascript
it('单击应该关闭所有notification', async () => {
  const { closeAllNotifications } = await import('@/utils/notificationUtils')
  const button = wrapper.find('.floating-button')
  
  await button.trigger('click')
  
  // 等待定时器执行（200ms）
  await new Promise(resolve => setTimeout(resolve, 250))
  await nextTick()
  
  expect(closeAllNotifications).toHaveBeenCalled()
})
```

### Promise 的处理

测试 Promise 时，确保使用 `await`：

```javascript
it('应该处理 API 调用', async () => {
  const { getLanguage } = await import('@/http/api/translate')
  
  wrapper = mount(FloatingToolBox)
  
  // 等待组件挂载和 API 调用
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  expect(getLanguage).toHaveBeenCalled()
})
```

### 错误处理测试

测试错误情况时，可以使用 `try-catch` 或让错误自然抛出：

```javascript
it('应该处理 API 错误', async () => {
  const { getLanguage } = await import('@/http/api/translate')
  getLanguage.mockRejectedValueOnce(new Error('API Error'))
  
  // 捕获 console.error 避免测试输出错误
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  wrapper = mount(FloatingToolBox)
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 组件应该仍然可以正常渲染
  expect(wrapper.find('.floating-button').exists()).toBe(true)
  
  consoleErrorSpy.mockRestore()
})
```

---

## 常用断言方法

### toBe - 严格相等（===）

用于基本类型和引用比较：

```javascript
expect(1 + 1).toBe(2)
expect('hello').toBe('hello')
expect(true).toBe(true)
expect(undefined).toBe(undefined)

// 注意：对象使用 toBe 会比较引用
const obj = { a: 1 }
expect(obj).toBe(obj)  // ✅
expect({ a: 1 }).toBe({ a: 1 })  // ❌（不同对象）
```

### toEqual - 深度相等

用于对象和数组的深度比较：

```javascript
expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 })
expect([1, 2, 3]).toEqual([1, 2, 3])
expect({ a: { b: 1 } }).toEqual({ a: { b: 1 } })
```

**实际示例：**
```javascript
expect(result).toEqual({
  code: 200,
  success: ['zh', 'en'],
  failed: new Map()
})
```

### toBeTruthy / toBeFalsy - 真值/假值

检查值是否为真值或假值：

```javascript
expect(1).toBeTruthy()
expect('hello').toBeTruthy()
expect(true).toBeTruthy()

expect(0).toBeFalsy()
expect('').toBeFalsy()
expect(false).toBeFalsy()
expect(null).toBeFalsy()
expect(undefined).toBeFalsy()
```

### toContain - 包含

检查数组或字符串是否包含某个值：

```javascript
expect([1, 2, 3]).toContain(2)
expect('hello world').toContain('world')
expect(['a', 'b', 'c']).toContain('b')
```

### toMatch - 正则匹配

使用正则表达式匹配字符串：

```javascript
expect('hello world').toMatch(/world/)
expect('test@example.com').toMatch(/^[\w-]+@[\w-]+\.[\w-]+$/)
```

### toThrow - 抛出错误

检查函数是否抛出错误：

```javascript
expect(() => {
  throw new Error('错误')
}).toThrow()

expect(() => {
  throw new Error('错误')
}).toThrow('错误')  // 检查错误消息
```

### 否定断言

所有断言都可以使用 `.not` 进行否定：

```javascript
expect(1 + 1).not.toBe(3)
expect([1, 2, 3]).not.toContain(4)
expect(wrapper.find('.hidden')).not.toBe(true)
```

**实际示例：**
```javascript
it('应该正确区分单击和双击', async () => {
  // ...
  
  // 双击应该取消单击的定时器，因此不会调用 closeAllNotifications
  expect(closeAllNotifications).not.toHaveBeenCalled()
})
```

---

## 清理和重置

测试之间需要清理状态，避免测试相互影响。

### vi.clearAllMocks - 清除所有 mock

清除所有 mock 函数的调用记录，但**保留**实现：

```javascript
afterEach(() => {
  vi.clearAllMocks()  // 清除所有 mock 的调用记录
})
```

**效果：**
- 清除调用记录（`toHaveBeenCalled` 会返回 false）
- **保留**返回值设置（`mockReturnValue` 仍然有效）

### mockRestore - 恢复原始实现

恢复 mock 函数到原始实现（如果之前有的话）：

```javascript
const originalFn = someFunction
const mockFn = vi.fn()
someFunction = mockFn

// 测试...

mockFn.mockRestore()  // 恢复为 originalFn
```

### mockReset - 重置 mock

重置 mock 函数，清除调用记录和实现：

```javascript
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn()

mockFn.mockReset()  // 清除调用记录和返回值设置
```

### 清理 DOM

```javascript
afterEach(() => {
  if (wrapper) {
    wrapper.unmount()  // 卸载组件
  }
  document.body.innerHTML = ''  // 清理 DOM
})
```

### 清理全局状态

```javascript
afterEach(() => {
  // 清理 localStorage
  localStorage.clear()
  
  // 清理全局变量
  global.someGlobalVar = undefined
  
  // 恢复原型方法
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
})
```

**实际示例：**
```javascript
describe('组件测试', () => {
  let wrapper
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })
})
```

---

## 实际案例解析

让我们完整解析一个项目中的测试文件，理解每个部分的作用。

### 案例：FloatingToolBox.test.js

```javascript
/**
 * FloatingToolBox 组件测试
 */

// 1. 导入测试工具
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FloatingToolBox from '@/components/FloatingToolBox/index.vue'
import { nextTick } from 'vue'

// 2. Mock 依赖模块
// ============================================

// Mock 1: 工具函数
vi.mock('@/utils/notificationUtils', () => ({
  closeAllNotifications: vi.fn()  // 创建一个什么都不做的函数
}))

// Mock 2: API 调用（异步）
vi.mock('@/http/api/translate', () => ({
  getLanguage: vi.fn(() => Promise.resolve({
    data: {
      list: [
        { name: '英文', code: 'english' },
        { name: '俄文', code: 'russian' }
      ]
    }
  }))
}))

// Mock 3: 多个 API 函数
vi.mock('@/http/api/workbench.js', () => ({
  getI18nAdress: vi.fn(() => Promise.resolve({
    data: { list: [{ ip: '192.168.1.1' }] }
  })),
  getBranches: vi.fn(() => Promise.resolve({
    data: { list: ['main', 'develop'] }
  })),
  gitPush: vi.fn(() => Promise.resolve({}))
}))

// Mock 4: 第三方库
vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// 3. 测试套件
// ============================================
describe('FloatingToolBox - 悬浮工具仓组件', () => {
  let wrapper
  let localStorageMock

  // 4. 生命周期钩子
  // ============================================
  
  beforeEach(() => {
    // 每个测试前执行：设置测试环境
    
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    global.localStorage = localStorageMock

    // Mock DOM API
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 150,
      bottom: 150,
      width: 50,
      height: 50
    }))

    // Mock window 尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })
  })

  afterEach(() => {
    // 每个测试后执行：清理工作
    if (wrapper) {
      wrapper.unmount()  // 卸载组件
    }
    vi.clearAllMocks()   // 清除所有 mock 的调用记录
    document.body.innerHTML = ''  // 清理 DOM
  })

  // 5. 测试用例组
  // ============================================
  
  describe('组件渲染', () => {
    it('应该渲染悬浮按钮', () => {
      // 挂载组件
      wrapper = mount(FloatingToolBox, {
        global: {
          // Mock Vuex store
          mocks: {
            $store: {
              state: {
                user: {
                  department: 'default',
                  userName: 'testUser'
                }
              }
            }
          },
          // 存根子组件（不渲染真实组件）
          stubs: {
            GitCommitButton: true,
            'a-button': true,
            'a-form': true,
            'CustomModal': true
          }
        }
      })

      // 断言：按钮应该存在
      expect(wrapper.find('.floating-button').exists()).toBe(true)
    })
  })

  describe('单击和双击功能', () => {
    beforeEach(() => {
      // 这个 beforeEach 只在这个 describe 内有效
      wrapper = mount(FloatingToolBox, {
        global: {
          mocks: { $store: { state: { user: {} } } },
          stubs: { 'a-button': true, 'CustomModal': true }
        }
      })
    })

    it('单击应该关闭所有notification', async () => {
      // 动态导入 mock 的函数
      const { closeAllNotifications } = await import('@/utils/notificationUtils')
      const button = wrapper.find('.floating-button')
      
      // 触发点击事件
      await button.trigger('click')
      
      // 等待定时器执行（组件内部有 200ms 延迟）
      await new Promise(resolve => setTimeout(resolve, 250))
      await nextTick()  // 等待 Vue 更新

      // 断言：应该调用了 closeAllNotifications
      expect(closeAllNotifications).toHaveBeenCalled()
      // 断言：单击不会影响面板显示状态
      expect(wrapper.vm.panelVisible).toBe(false)
    })

    it('双击应该显示工具面板', async () => {
      const button = wrapper.find('.floating-button')
      
      // 触发双击事件
      await button.trigger('dblclick')
      await nextTick()

      // 断言：面板应该显示
      expect(wrapper.vm.panelVisible).toBe(true)
    })
  })

  describe('数据获取', () => {
    it('应该获取语种列表', async () => {
      // 动态导入 mock 的 API 函数
      const { getLanguage } = await import('@/http/api/translate')
      
      wrapper = mount(FloatingToolBox, {
        global: {
          mocks: { $store: { state: { user: {} } } },
          stubs: { 'a-button': true }
        }
      })

      // 等待组件挂载和 API 调用完成
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 断言：API 应该被调用
      expect(getLanguage).toHaveBeenCalled()
      // 断言：组件应该获取到数据
      expect(wrapper.vm.translateTypes.length).toBeGreaterThan(0)
    })

    it('应该处理API错误', async () => {
      const { getLanguage } = await import('@/http/api/translate')
      
      // 让这次调用返回错误
      getLanguage.mockRejectedValueOnce(new Error('API Error'))
      
      // 捕获 console.error 避免测试输出错误
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(FloatingToolBox, {
        global: {
          mocks: { $store: { state: { user: {} } } },
          stubs: { 'a-button': true }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 断言：组件应该仍然可以正常渲染（错误处理正常）
      expect(wrapper.find('.floating-button').exists()).toBe(true)
      
      // 恢复 console.error
      consoleErrorSpy.mockRestore()
    })
  })
})
```

### 关键点总结

1. **Mock 在文件顶部**：所有 `vi.mock` 都在文件顶部，即使写在后面也会被提升
2. **beforeEach 设置环境**：每个测试前准备测试环境（mock DOM API、localStorage 等）
3. **afterEach 清理**：每个测试后清理（卸载组件、清除 mock、清理 DOM）
4. **动态导入 mock**：在测试中通过 `await import()` 获取 mock 的函数
5. **异步处理**：使用 `async/await`、`nextTick`、`setTimeout` 处理异步操作
6. **断言验证**：使用 `expect` 验证期望的行为

---

## 常见问题

### Q1: vi.mock 不生效？

**可能原因：**
- 路径不匹配：检查 mock 路径是否与 import 路径完全一致
- 别名问题：确保 `vitest.config.js` 中配置了路径别名
- 提升问题：`vi.mock` 会被提升，但工厂函数中的代码不会

**解决方案：**
```javascript
// ❌ 错误：路径不一致
import { fn } from '@/utils/helper'
vi.mock('./utils/helper')  // 路径不匹配

// ✅ 正确：路径一致
import { fn } from '@/utils/helper'
vi.mock('@/utils/helper')
```

### Q2: Mock 函数没有被调用？

**可能原因：**
- 组件没有实际调用该函数
- 异步操作还没完成
- Mock 设置不正确

**解决方案：**
```javascript
it('应该调用函数', async () => {
  const { someFunction } = await import('@/utils/helper')
  
  wrapper = mount(Component)
  
  // 等待异步操作完成
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  expect(someFunction).toHaveBeenCalled()
})
```

### Q3: 如何测试组件的方法？

**解决方案：**
```javascript
// 通过 wrapper.vm 访问组件实例
wrapper.vm.someMethod()

// 或者直接调用
const result = wrapper.vm.calculate(1, 2)
expect(result).toBe(3)
```

### Q4: 如何测试事件触发？

**解决方案：**
```javascript
// 触发事件
await button.trigger('click')
await nextTick()

// 验证结果
expect(wrapper.vm.someData).toBe(expectedValue)
```

### Q5: 如何测试异步 API 调用？

**解决方案：**
```javascript
// 1. Mock API
vi.mock('@/http/api/data', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}))

// 2. 在测试中使用
it('应该获取数据', async () => {
  const { fetchData } = await import('@/http/api/data')
  
  wrapper = mount(Component)
  
  // 等待异步完成
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  expect(fetchData).toHaveBeenCalled()
  expect(wrapper.vm.data).toBe('test')
})
```

---

## 总结

### 测试编写流程

1. **导入依赖**：导入测试工具和要测试的模块
2. **Mock 依赖**：使用 `vi.mock` 模拟外部依赖
3. **设置环境**：在 `beforeEach` 中准备测试环境
4. **编写测试**：使用 `it` 编写测试用例
5. **清理**：在 `afterEach` 中清理状态

### 核心概念记忆

- **vi.mock(路径, 工厂函数)**：模拟模块
- **vi.fn()**：创建 mock 函数
- **mockReturnValue / mockResolvedValue**：设置返回值
- **toHaveBeenCalled**：检查是否被调用
- **mount(组件, 选项)**：挂载 Vue 组件
- **wrapper.vm**：访问组件实例
- **wrapper.find(选择器)**：查找元素
- **await nextTick()**：等待 Vue 更新

### 最佳实践

1. **一个测试一个断言**：每个测试只验证一个行为
2. **清晰的测试描述**：测试描述应该说明期望的行为
3. **隔离测试**：每个测试应该独立，不依赖其他测试
4. **Mock 外部依赖**：避免真实的网络请求、文件操作等
5. **清理状态**：测试后清理，避免测试相互影响

---

## 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Jest 文档](https://jestjs.io/)（API 与 Vitest 类似）

---

**祝你测试愉快！** 🎉
