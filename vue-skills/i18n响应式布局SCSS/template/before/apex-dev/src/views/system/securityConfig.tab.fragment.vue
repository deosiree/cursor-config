<!-- RED：安全配置 Tab 宽写死 200px，且 showTabActions 默认 true（多余 chrome） -->
<PageTabShell
  v-model="activeTab"
  :tabs="visibleSecurityTabItems"
  tab-label-max-width="200px"
>
  <template #tabContent="{ tab }">...</template>
</PageTabShell>
