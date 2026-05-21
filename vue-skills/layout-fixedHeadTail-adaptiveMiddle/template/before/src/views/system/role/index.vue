<template>
  <div class="app-container role-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <!-- 角色列表 -->
      <RoleIndex />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import RoleIndex from "./components/role/index.vue";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});
</script>

<style lang="scss" scoped>
.h-full {
  width: 100%;
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.role-manage {
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100% !important;
    overflow: hidden;
  }
}

.bottom-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}
</style>
