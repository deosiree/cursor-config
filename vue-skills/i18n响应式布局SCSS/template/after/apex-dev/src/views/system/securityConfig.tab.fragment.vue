<!-- GREEN：安全配置无 Tab 操作，绑 $localeLayout -->
<PageTabShell
  v-model="activeTab"
  :tabs="visibleSecurityTabItems"
  :show-tab-actions="false"
  :tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"
>
  <template #tabContent="{ tab }">...</template>
</PageTabShell>
