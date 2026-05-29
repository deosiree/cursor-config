<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="78%"
    append-to-body
    :close-on-click-modal="false"
    draggable
    class="project-device-config-dialog min-width-dialog"
    @closed="handleClosed"
  >
    <div id="projectDeviceConfig" v-loading="loading" class="transfer-container">
      <customTransfer
        ref="transferRef"
        v-model="selectedDeviceKeys"
        :data="transferData"
        filterable
        :filter-method="filterDevice"
        :filter-placeholder="$t('请输入设备名称、设备描述、机器码')"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
        :format="transferFormat"
        class="full-height-transfer"
        :virtual-scroll="true"
      >
        <template #left-footer>
          <div class="transfer-header">
            <SpanByTipsFill class="header-item" :content="$t('设备名称')" tag="div" />
            <SpanByTipsFill class="header-item" :content="$t('设备描述')" tag="div" />
            <SpanByTipsFill class="header-item" :content="$t('机器码')" tag="div" />
          </div>
        </template>

        <template #right-footer>
          <div class="transfer-header">
            <SpanByTipsFill class="header-item" :content="$t('设备名称')" tag="div" />
            <SpanByTipsFill class="header-item" :content="$t('设备描述')" tag="div" />
            <SpanByTipsFill class="header-item" :content="$t('机器码')" tag="div" />
          </div>
        </template>

        <template #default="{ option }">
          <div class="transfer-item">
            <SpanByTipsFill class="transfer-item__desc" :content="option.device?.deviceName" />
            <SpanByTipsFill class="transfer-item__desc" :content="option.device?.deviceDesc" />
            <SpanByTipsFill class="transfer-item__desc" :content="option.device?.machineCode" />
          </div>
        </template>
      </customTransfer>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" size="small" @click="handleConfirm">{{ $t("确定") }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import customTransfer from "@/components/transfer/src/transfer.vue";
import type { TransferDataItem } from "@/components/transfer/src/transfer";
import SpanByTipsFill from "@/components/SpanByTips/SpanByTipsFill/index.vue";

interface ProjectDeviceOption {
  id: string;
  deviceName?: string;
  deviceDesc?: string;
  machineCode?: string;
}

interface DeviceTransferOption extends TransferDataItem {
  key: string;
  label: string;
  device: ProjectDeviceOption;
}

interface TransferPanelRef {
  query?: string;
}

interface TransferExpose {
  clearQuery?: (panel: "left" | "right") => void;
  leftPanel?: TransferPanelRef;
  rightPanel?: TransferPanelRef;
}

interface Props {
  visible?: boolean;
  tenantName?: string;
  projectName?: string;
  devices?: ProjectDeviceOption[];
  selectedDeviceIds?: string[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  tenantName: "",
  projectName: "",
  devices: () => [],
  selectedDeviceIds: () => [],
  loading: false,
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  confirm: [value: string[]];
}>();

const { t } = useI18n();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

/** 右侧已绑定本项目的设备 key（设备 id） */
const selectedDeviceKeys = ref<string[]>([]);
const transferRef = ref<TransferExpose | null>(null);

const dialogTitle = computed(() => {
  const projectName = props.projectName ? `【${props.projectName}】` : "";
  const tenantName = props.tenantName ? `【${props.tenantName}】` : "";
  return `${tenantName}${projectName}${props.projectName ? "配置设备" : "项目设备配置"}`;
});

const transferData = computed<DeviceTransferOption[]>(() =>
  (props.devices ?? []).map((device) => {
    const id = String(device.id ?? "");
    return {
      key: id,
      label: device.deviceName || device.deviceDesc || device.machineCode || id,
      device: {
        id,
        deviceName: device.deviceName ?? "",
        deviceDesc: device.deviceDesc ?? "",
        machineCode: device.machineCode ?? "",
      },
    };
  })
);

const transferTitles = computed<[string, string]>(() => [t("未绑定设备"), t("已绑定设备")]);

const transferButtonTexts = computed<[string, string]>(() => [t("解绑"), t("绑定")]);

const transferFormat = { noChecked: " ", hasChecked: " " };

/** 穿梭框过滤：设备名称、描述、机器码 */
function filterDevice(query: string, item: TransferDataItem): boolean {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  const row = (item as DeviceTransferOption).device;
  const fields = [row?.deviceName, row?.deviceDesc, row?.machineCode];
  return fields.some((field) => (field ?? "").toString().toLowerCase().includes(q));
}

function syncSelectionFromProps(): void {
  selectedDeviceKeys.value = Array.from(
    new Set((props.selectedDeviceIds ?? []).map(String).filter(Boolean))
  );
}

function handleConfirm(): void {
  emit("confirm", selectedDeviceKeys.value.map(String).filter(Boolean));
  dialogVisible.value = false;
}

function handleClosed(): void {
  selectedDeviceKeys.value = [];
  nextTick(() => {
    if (transferRef.value?.clearQuery) {
      transferRef.value.clearQuery("left");
      transferRef.value.clearQuery("right");
      return;
    }
    if (transferRef.value?.leftPanel) transferRef.value.leftPanel.query = "";
    if (transferRef.value?.rightPanel) transferRef.value.rightPanel.query = "";
  });
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    syncSelectionFromProps();
  },
  { immediate: true }
);

watch(
  () => props.selectedDeviceIds,
  () => {
    if (props.visible) {
      syncSelectionFromProps();
    }
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
$transfer-cols: minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr);

.project-device-config-dialog {
  :deep(.el-dialog__body) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 16px 20px;
    overflow: hidden;
  }
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.full-height-transfer {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;

  :deep(.el-transfer) {
    display: flex;
    gap: 8px;
    align-items: stretch;
    width: 100%;
    height: 100%;
  }

  /* 面板根节点类名为 el-panel（非 el-transfer-panel） */
  :deep(.el-panel) {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    margin: 0;

    .el-panel__header {
      flex-shrink: 0;
      order: 1;
      --el-transfer-header-height: 40px;
    }

    .el-panel__filter {
      flex-shrink: 0;
      order: 2;
      --el-transfer-filter-height: 40px;

      .el-input {
        width: 100%;
      }
    }

    .el-panel__footer {
      flex-shrink: 0;
      order: 3;
      height: auto !important;
      min-height: 28px;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
      overflow-y: hidden;
      border-top: none;
      --el-transfer-footer-height: 28px;
    }

    .el-panel__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      order: 4;
      height: auto !important;
      min-height: 0;
      overflow: hidden;
    }

    .el-transfer-panel__list {
      display: flex;
      flex: 1;
      flex-direction: column;
      height: auto !important;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
      -webkit-user-select: text;
      -moz-user-select: text;
      user-select: text;

      > div {
        height: 100% !important;
        min-height: 0;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }
    }

    .el-transfer-panel__list.is-filterable {
      height: 100% !important;
      padding-top: 0;
    }

    .el-transfer-panel__item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 6px 8px 6px 0;
    }
  }

  :deep(.el-transfer__buttons) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 10px;

    .el-button {
      width: 84px;
      height: 32px;
      padding: 7px 12px;
      margin: 0;
      font-size: 13px;
      line-height: 1;

      + .el-button {
        margin-top: 12px;
      }
    }
  }
}

.transfer-header {
  display: grid;
  grid-template-columns: $transfer-cols;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 4px 12px 4px 22px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: #606266;
  background: #f5f7fa;

  .header-item {
    text-align: left;
  }
}

.transfer-item {
  display: grid;
  grid-template-columns: $transfer-cols;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-width: 0;
  font-size: 13px;
  line-height: 1.4;
  -webkit-user-select: text;
  -moz-user-select: text;
  user-select: text;

  .transfer-item__desc {
    color: var(--el-text-color-regular);
    text-align: left;
  }
}

// 限定在容器内（与 BindDeviceDialog #bindDevice 相同），确保 append-to-body 下样式命中
.transfer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;

  :deep(.el-panel__header) {
    padding-right: 15px;
    padding-bottom: 10px;
    // padding-left: 15px;
    margin: 0;
  }

  :deep(.el-panel__header .el-checkbox__label) {
    font-size: 16px !important;
    font-weight: 550;
  }

  :deep(.el-panel__filter) {
    box-sizing: border-box !important;
    padding-bottom: 15px !important;
  }

  :deep(.el-panel__footer) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-transfer__buttons) {
    width: 10% !important;
    min-width: 100px;

    .el-button:nth-child(2) {
      padding: 0 !important;
      margin: 10px !important;
    }
  }

  :deep(.el-panel) {
    width: 45% !important;
    min-width: 350px;
  }

  // 列表行：面板根为 el-panel，EP 的 .el-transfer-panel__item 规则挂不上，在此复刻
  :deep(.el-transfer-panel__item.el-checkbox) {
    position: relative;
    display: block !important;
    width: 100%;
    height: auto;
    min-height: 32px;
    padding: 6px 8px 6px 15px;
    margin-right: 0;

    .el-checkbox__input {
      position: absolute !important;
      top: 50% !important;
      left: 15px;
      margin: 0 !important;
      transform: translateY(-50%);
    }

    .el-checkbox__label {
      box-sizing: border-box;
      display: block !important;
      width: 100%;
      padding-left: 22px !important;
      overflow: hidden;
      line-height: 1.4;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      user-select: text !important;
    }
  }

  :deep(.el-transfer-panel__item) {
    padding-left: 0;
  }
}
</style>
