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
    <div v-loading="loading">
      <DeviceTransfer
        ref="transferRef"
        v-model="selectedDeviceKeys"
        :data="transferData"
        :columns="deviceColumns"
        host-height="500px"
        :filter-placeholder="$t('请输入设备名称、设备描述、机器码')"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
      />
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
import DeviceTransfer from "@/components/transfer/src/transfer_v2/DeviceTransfer.vue";
import type { DeviceTransferColumn } from "@/components/transfer/src/transfer_v2/device-transfer";
import type { TransferDataItem } from "@/components/transfer/src/transfer";

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

/** 三列：名称、描述、机器码（过滤由 DeviceTransfer 按 columns 默认实现） */
const deviceColumns = computed<DeviceTransferColumn[]>(() => [
  {
    label: t("设备名称"),
    getValue: (option) => (option as DeviceTransferOption).device?.deviceName,
  },
  {
    label: t("设备描述"),
    getValue: (option) => (option as DeviceTransferOption).device?.deviceDesc,
  },
  {
    label: t("机器码"),
    getValue: (option) => (option as DeviceTransferOption).device?.machineCode,
  },
]);

const transferTitles = computed<[string, string]>(() => [t("未绑定设备"), t("已绑定设备")]);

const transferButtonTexts = computed<[string, string]>(() => [t("解绑"), t("绑定")]);

/** 从 props 同步已选设备 id 到穿梭框右侧 */
function syncSelectionFromProps(): void {
  selectedDeviceKeys.value = Array.from(
    new Set((props.selectedDeviceIds ?? []).map(String).filter(Boolean))
  );
}

function handleConfirm(): void {
  emit("confirm", selectedDeviceKeys.value.map(String).filter(Boolean));
  dialogVisible.value = false;
}

/** 关闭后清空选中与搜索框 */
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
</style>
