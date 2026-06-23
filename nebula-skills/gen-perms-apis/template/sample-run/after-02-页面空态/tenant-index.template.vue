<!-- GREEN 快照：src/views/tenant/index.vue 模板片段 -->
<template>
  <div class="app-container tenant-manage">
    <el-card v-if="canQuery" shadow="hover" class="bg-white bottom-container data-table h-full">
      <BaseListToolbar :title="$t('租户列表')">
        <!-- filters / actions -->
      </BaseListToolbar>
      <div class="tenant-list-page__body">
        <TenantTable :data="pageData" :loading="loading" />
      </div>
      <div class="tenant-list-page__pagination">
        <Pagination @pagination="fetchData" />
      </div>
    </el-card>
    <PageNoPermission v-else />
    <!-- 弹窗保持在分支外 -->
    <SinglePaneDialog v-model="createDialog.visible" />
  </div>
</template>

<script setup lang="ts">
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
