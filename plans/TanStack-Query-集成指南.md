# TanStack Query 集成指南

## 为什么适合本项目？

### 当前痛点
1. **大量样板代码**：每个组件都需要手动管理 `loading`、`error`、`data` 状态
2. **重复请求**：没有缓存机制，相同数据会被重复请求
3. **状态同步困难**：数据更新后需要手动刷新多个组件
4. **错误处理分散**：每个组件都要单独处理错误

### TanStack Query 的优势
1. **自动状态管理**：自动管理 `isLoading`、`isError`、`data`、`error`
2. **智能缓存**：自动缓存数据，减少重复请求
3. **自动重新获取**：窗口聚焦、网络重连时自动刷新
4. **乐观更新**：支持乐观更新，提升用户体验
5. **开发速度**：减少 50-70% 的数据获取相关代码

## 安装

```bash
pnpm add @tanstack/vue-query
```

## 基础集成

### 1. 在 main.ts 中配置

```typescript
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        // 默认缓存时间：5分钟
        staleTime: 5 * 60 * 1000,
        // 默认垃圾回收时间：10分钟
        gcTime: 10 * 60 * 1000,
        // 失败重试次数
        retry: 1,
        // 窗口聚焦时重新获取
        refetchOnWindowFocus: true,
      },
    },
  },
})
```

### 2. 创建 Query Client 工具函数

创建 `src/composables/useQueryClient.ts`：

```typescript
import { useQueryClient } from '@tanstack/vue-query'

export function useAppQueryClient() {
  const queryClient = useQueryClient()
  
  // 清除所有缓存
  const clearAllCache = () => {
    queryClient.clear()
  }
  
  // 使特定查询失效并重新获取
  const invalidateQueries = (queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey })
  }
  
  return {
    queryClient,
    clearAllCache,
    invalidateQueries,
  }
}
```

## 使用示例

### 示例 1：替换现有的数据获取逻辑

**之前（手动管理）：**
```vue
<script setup>
const loading = ref(false)
const data = ref([])
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await DeviceAPI.get(queryParams)
    data.value = res.list
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

**之后（使用 TanStack Query）：**
```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'
import DeviceAPI from '@/api/device.api'

const queryParams = reactive({ page: 1, pageSize: 10 })

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['devices', queryParams],
  queryFn: () => DeviceAPI.get(queryParams),
  select: (res) => res.list, // 自动提取 list
})
</script>
```

### 示例 2：分页查询

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'
import DeviceAPI from '@/api/device.api'

const pagination = reactive({ page: 1, pageSize: 10 })

const { data, isLoading } = useQuery({
  queryKey: ['devices', pagination],
  queryFn: () => DeviceAPI.get(pagination),
  select: (res) => ({
    list: res.list,
    total: res.total,
  }),
})

// 切换页码时自动重新获取
watch(() => pagination.page, () => {
  // queryKey 变化会自动触发重新获取
})
</script>
```

### 示例 3：Mutation（创建/更新/删除）

```vue
<script setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import TenantAPI from '@/api/system/tenant.api'

const queryClient = useQueryClient()

// 创建租户
const createMutation = useMutation({
  mutationFn: (formData: TenantForm) => TenantAPI.create(formData),
  onSuccess: () => {
    // 成功后使租户列表查询失效，自动重新获取
    queryClient.invalidateQueries({ queryKey: ['tenants'] })
    ElMessage.success('创建成功')
  },
  onError: (error) => {
    ElMessage.error(error.message || '创建失败')
  },
})

// 使用
const handleSubmit = (formData: TenantForm) => {
  createMutation.mutate(formData)
}
</script>

<template>
  <el-button 
    :loading="createMutation.isPending" 
    @click="handleSubmit(formData)"
  >
    提交
  </el-button>
</template>
```

### 示例 4：依赖查询

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

// 先获取租户信息
const { data: tenant } = useQuery({
  queryKey: ['tenant', tenantId],
  queryFn: () => TenantAPI.getTenantConfig(tenantId),
  enabled: !!tenantId, // 只有 tenantId 存在时才查询
})

// 依赖租户信息获取菜单
const { data: menus } = useQuery({
  queryKey: ['menus', tenant.value?.menuVersionNo],
  queryFn: () => MenuAPI.getByVersion(tenant.value.menuVersionNo),
  enabled: !!tenant.value?.menuVersionNo, // 依赖查询
})
</script>
```

## 与现有 Axios 拦截器兼容

TanStack Query 完全兼容现有的 Axios 配置，无需修改 `request.ts`。

## 迁移建议

### 优先级 1：高频使用的数据获取
- 租户列表
- 设备列表
- 菜单数据
- 字典数据

### 优先级 2：表单提交
- 创建/更新租户
- 设备操作
- 配置保存

### 优先级 3：复杂查询
- 数据搜索
- 报表数据
- 统计信息

## 性能优化建议

1. **合理设置 staleTime**：不常变化的数据设置更长的 staleTime
2. **使用 select 提取数据**：减少不必要的响应式转换
3. **启用 keepPreviousData**：分页切换时保持上一页数据，避免闪烁
4. **使用 prefetchQuery**：预加载可能需要的数据

## 注意事项

1. **Query Key 设计**：使用数组形式，包含所有影响数据的参数
2. **避免在 Query Key 中使用对象**：使用 `toValue()` 或展开对象属性
3. **Mutation 的乐观更新**：对于重要操作，建议使用乐观更新提升体验

## 参考资源

- [TanStack Query Vue 文档](https://tanstack.com/query/latest/docs/vue/overview)
- [Vue Query 示例](https://tanstack.com/query/latest/docs/vue/examples/vue/basic)
