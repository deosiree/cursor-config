<!-- RED：菜单管理 Tab 宽写死 -->
<PageTabShell
  v-model="activeTabId"
  :tabs="displayTabs"
  :show-tab-actions="true"
  tab-label-max-width="4em"
>
  <template #tabLabelExtra="{ tab }">
    <el-button link icon="Setting" class="tab-config-btn" />
  </template>
</PageTabShell>
