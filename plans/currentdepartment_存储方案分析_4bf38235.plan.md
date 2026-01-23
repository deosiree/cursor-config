---
name: currentDepartment 存储方案分析
overview: 分析 currentDepartment 的四种存储方案（Vuex Store、localStorage、按需导入、全局属性），并给出最适合的推荐方案
todos: []
---

# currentDepartment 存储方案分析

## 当前情况

- **使用频率**：在 10 个文件中使用 42 次
- **使用场景**：权限判断（`ops.has('needIP')`、`ops.has('dev')` 等）、条件渲染
- **变化频率**：登录时设置，之后基本不变（不需要响应式）
- **项目版本**：Vue 3.2.13

## 四种方案对比

### 1. Vuex Store（当前方案）⭐⭐⭐

**优点：**

- ✅ 已在项目中实现，改动最小
- ✅ 全局访问方便
- ✅ 自动持久化（通过 `vuex-persistedstate` 同步到 sessionStorage）
- ✅ 代码统一，易于维护

**缺点：**

- ❌ 创建了不必要的响应式代理（性能略差，但影响很小）
- ❌ 代码稍显冗长（`$store.state.currentDepartment`）

**适用场景：** 当前方案，如果性能不是瓶颈，可以继续使用

---

### 2. localStorage ⭐

**优点：**

- ✅ 持久化存储
- ✅ 不需要响应式

**缺点：**

- ❌ 需要手动序列化/反序列化（Set 类型需要特殊处理）
- ❌ 访问速度较慢（磁盘 I/O）
- ❌ 代码改动大（所有 42 处使用都要改）
- ❌ 无法在模板中直接使用（需要 computed 或 methods）
- ❌ 无法监听变化（虽然不需要，但灵活性差）

**适用场景：** 不推荐，改动成本高，性能反而更差

---

### 3. 按需导入 ⭐⭐

**优点：**

- ✅ 性能最好（无响应式开销）
- ✅ 不需要响应式

**缺点：**

- ❌ 无法根据用户动态设置（`currentDepartment` 是根据用户部门从 `commonParam.departmentMap` 中查找的）
- ❌ 每个组件都需要导入和计算逻辑
- ❌ 代码重复，维护困难
- ❌ 无法持久化（刷新后需要重新计算）

**适用场景：** 不推荐，无法满足动态设置需求

---

### 4. 全局属性（Vue 3）⭐⭐⭐⭐⭐

**优点：**

- ✅ 全局访问方便（`this.$currentDepartment` 或 `$currentDepartment`）
- ✅ 不需要响应式（性能好）
- ✅ 代码简洁
- ✅ 可以动态设置（在登录时设置）
- ✅ 可以配合 localStorage 实现持久化（如果需要）

**缺点：**

- ❌ 需要手动实现持久化（如果需要）
- ❌ 需要修改所有使用的地方（但改动相对简单）

**适用场景：** **最推荐**，最适合不需要响应式的全局数据

---

## 推荐方案：全局属性（Vue 3）

### 实现方式

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import commonParam from '@/constants/commonParam'

const app = createApp(App)

// 设置全局属性
app.config.globalProperties.$currentDepartment = null

// 在 store 的 mutation 中同步更新全局属性
// store/index.js - setData mutation
app.config.globalProperties.$currentDepartment = state.currentDepartment

app.use(store).use(router)
app.mount('#app')
```

### 使用方式

```vue
<!-- 模板中 -->
<component v-if="$currentDepartment && $currentDepartment.ops.has('dev')" />

<!-- 脚本中 -->
if (this.$currentDepartment?.ops.has('needIP')) {
  // ...
}
```

### 持久化方案（可选）

如果需要持久化，可以在设置时同步到 sessionStorage：

```javascript
// store/index.js - setData mutation
state.currentDepartment = commonParam.departmentMap[department]
app.config.globalProperties.$currentDepartment = state.currentDepartment
sessionStorage.setItem('currentDepartment', JSON.stringify({
  ...state.currentDepartment,
  ops: Array.from(state.currentDepartment.ops) // Set 转数组
}))
```

---

## 最终建议

**如果追求最佳性能且愿意重构：** 使用**全局属性**方案

- 性能最优
- 代码最简洁
- 需要修改 42 处使用（但改动简单）

**如果不想大改且当前性能可接受：** 继续使用**Vuex Store**方案

- 改动最小
- 已有持久化
- 性能影响很小（对于静态数据，响应式开销可忽略）

**不推荐：** localStorage 和按需导入方案