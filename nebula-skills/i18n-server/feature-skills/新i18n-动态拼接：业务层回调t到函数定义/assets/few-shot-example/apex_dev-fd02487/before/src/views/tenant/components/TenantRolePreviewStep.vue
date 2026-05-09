<template>
  <div>
    <div class="role-cards-wrapper">
      <div
        v-for="role in defaultRoles"
        :key="role.roleName"
        class="role-card border border-[#e4e7ed] bg-white"
      >
        <div class="role-card-header">
          <span class="role-card-icon">{{ role.icon }}</span>
          <div class="role-card-title-wrapper">
            <span class="role-card-title">{{ role.roleName }}</span>
            <span class="role-card-tag text-[#e6a23c] bg-[#fdf6ec]">
              {{ role.tag }}
            </span>
          </div>
        </div>
        <div class="role-card-body">
          <p class="role-card-desc">{{ role.description }}</p>
          <p class="role-card-line">
            <span class="role-card-label">菜单权限：</span>
            <span class="role-card-value text-[#409eff]">
              {{ role.menuSummary }}
            </span>
          </p>
          <p class="role-card-line">
            <span class="role-card-label">设备权限：</span>
            <span class="role-card-value text-[#409eff]">
              {{ role.deviceSummary }}
            </span>
          </p>
        </div>
      </div>
    </div>
    <div class="role-cards-tip">
      角色为系统默认配置，租户创建完成后，可在「系统管理 &gt; 角色管理」中自定义新角色或调整权限。
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_TENANT_ROLES } from "@/constants/tenant";

const defaultRoles = DEFAULT_TENANT_ROLES;
</script>

<style scoped lang="scss">
.role-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  justify-content: center;
  max-height: 260px;
  padding: 4px 0;
  margin-top: 4px;
  overflow-y: auto;
}

.role-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 8px;
}

.role-card-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-card-icon {
  font-size: 20px;
}

.role-card-title-wrapper {
  display: flex;
  gap: 6px;
  align-items: center;
}

.role-card-title {
  font-size: 14px;
  font-weight: 500;
}

.role-card-tag {
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 10px;
}

.role-card-body {
  font-size: 12px;
}

.role-card-desc {
  margin-bottom: 4px;
}

.role-card-line {
  margin: 0;
}

.role-cards-tip {
  margin-top: 8px;
  font-size: 12px;
  text-align: left;
}
</style>
