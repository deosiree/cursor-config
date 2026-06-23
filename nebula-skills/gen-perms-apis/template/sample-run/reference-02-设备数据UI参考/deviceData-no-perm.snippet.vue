<!-- 参考摘录：deviceData/index.vue v-else 分支（不改动原模块） -->
<el-card v-else shadow="hover" class="h-full w-full" style="width: 100%; height: 100%">
  <el-empty class="device-data-no-perm" :description="$t('暂无页面访问权限')" />
</el-card>
