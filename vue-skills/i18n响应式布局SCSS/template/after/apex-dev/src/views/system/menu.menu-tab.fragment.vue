<!-- GREEN：菜单管理 Tab 宽随语言 -->
<PageTabShell
  v-model="activeTabId"
  :tabs="displayTabs"
  :show-tab-actions="true"
  :tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"
>
  <template #tabLabelExtra="{ tab }">
    <el-button link icon="Setting" class="tab-config-btn" />
  </template>
</PageTabShell>
