<!-- RED 快照：src/views/dashboard/index.vue 改造前 -->
<template>
  <div class="dashboard-container">
    <template v-if="canViewDashboard">
      <div class="dashboard-grid">
        <!-- KPI + 图表 -->
      </div>
    </template>
    <!-- 反模式：裸 el-empty，无 el-card 包裹与居中布局 -->
    <el-empty v-else :description="t('暂无权限查看首页')" />
  </div>
</template>

<script setup lang="ts">
import { checkHasPerm } from "@/directive/permission";

const canViewDashboard = computed(() => checkHasPerm("sys:dashboard:view"));

const loadDashboardData = async () => {
  if (!canViewDashboard.value) return;
  // ...
};
</script>
