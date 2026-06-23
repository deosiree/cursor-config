<!-- RED 快照：src/views/tenant/index.vue 改造前（空态嵌套在列表 card 内） -->
<template>
  <div class="app-container tenant-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <template v-if="canQuery">
        <BaseListToolbar :title="$t('租户列表')">
          <!-- filters / actions：v-hasPerm 控制单按钮 -->
        </BaseListToolbar>
        <div class="tenant-list-page__body">
          <TenantTable :data="pageData" :loading="loading" />
        </div>
        <div class="tenant-list-page__pagination">
          <Pagination @pagination="fetchData" />
        </div>
      </template>
      <!-- 反模式：空态嵌在同一 el-card，且无独立白卡片容器 -->
      <el-empty v-else class="tenant-no-perm" :description="$t('暂无页面访问权限')" />
    </el-card>
    <SinglePaneDialog v-model="createDialog.visible" />
  </div>
</template>

<script setup lang="ts">
/** fetchData 守卫（保留正确做法，但 UI 仍可能误导） */
const canQuery = computed(() => checkHasPerm("sys:tenant:query"));

async function fetchData() {
  if (!canQuery.value) {
    pageData.value = [];
    total.value = 0;
    return;
  }
  // ...
}
</script>

<!-- 更早的 RED：仅 fetchData 清空 + 无 v-else → el-table 显示「暂无数据」 -->
