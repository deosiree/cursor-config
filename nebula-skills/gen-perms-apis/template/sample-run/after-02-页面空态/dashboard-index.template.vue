<!-- GREEN 快照：src/views/dashboard/index.vue 模板片段 -->
<template>
  <div class="dashboard-container">
    <template v-if="canViewDashboard">
      <div class="dashboard-grid">
        <!-- KPI + 图表 -->
      </div>
    </template>
    <PageNoPermission v-else />
  </div>
</template>

<script setup lang="ts">
const canViewDashboard = computed(() => checkHasPerm("sys:dashboard:view"));

const loadDashboardData = async () => {
  if (!canViewDashboard.value) return;
  // ...
};
</script>
