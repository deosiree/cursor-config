<template>
  <div class="group-device-tab">
    <el-alert v-if="loadError" type="error" :closable="false" show-icon class="device-tip">
      {{ loadError }}
    </el-alert>
    <div v-if="!loading && !transferData.length" class="device-list__state">
      {{ loadError ? "设备列表加载失败" : "暂无可选设备" }}
    </div>
    <div v-else v-loading="loading">
      <DeviceTransfer
        v-model="selectedDeviceKeys"
        :data="transferData"
        :columns="deviceColumns"
        host-height="min(400px, calc(480px - 48px))"
        filter-placeholder="搜索设备名称或编号"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeviceTransfer from "@/components/transfer/src/transfer_v2/DeviceTransfer.vue";
import type { DeviceTransferColumn } from "@/components/transfer/src/transfer_v2/device-transfer";
import type { TransferDataItem } from "@/components/transfer/src/transfer";
import DeviceGateway from "@/gateway/device/device.gateway";
import { mapBindDevicesToTabItems, type DeviceTabItem } from "@/types/device";

interface DeviceTransferOption extends TransferDataItem {
  key: string;
  label: string;
  device: DeviceTabItem;
}

interface Props {
  initialDeviceIds?: string[];
  /** 角色新建：默认全选全部可选设备 */
  defaultSelectAll?: boolean;
  /** 父级：编辑态拉详情与菜单树 */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialDeviceIds: () => [],
  defaultSelectAll: false,
  loading: false,
});

const emit = defineEmits<{
  (e: "update:deviceIds", ids: string[]): void;
}>();

const transferTitles: [string, string] = ["未绑定设备", "已绑定设备"];
const transferButtonTexts: [string, string] = ["移除", "添加"];

/** 两列：设备名称、设备编号 */
const deviceColumns: DeviceTransferColumn[] = [
  {
    label: "设备名称",
    getValue: (option) => (option as DeviceTransferOption).device?.name,
  },
  {
    label: "设备编号",
    getValue: (option) => (option as DeviceTransferOption).device?.code,
  },
];

const deviceItems = ref<DeviceTabItem[]>([]);
const transferData = ref<DeviceTransferOption[]>([]);
const selectedDeviceKeys = ref<string[]>([]);
const devicesLoading = ref(false);
const loading = computed(() => props.loading || devicesLoading.value);
const loadError = ref("");
let bindRequestSeq = 0;

watch(
  selectedDeviceKeys,
  (val) => {
    emit("update:deviceIds", val.map(String).filter(Boolean));
  },
  { deep: true }
);

/**
 * 将设备列表转为穿梭框数据源。
 * @param items 设备 Tab 行数据
 */
function buildTransferData(items: DeviceTabItem[]): void {
  transferData.value = items.map((device) => ({
    key: device.id,
    label: device.name || device.code || device.id,
    device,
  }));
}

/**
 * 编辑态回显 initialDeviceIds；新建且 defaultSelectAll 时全选。
 */
function resolveSelectedKeys(): string[] {
  if (props.defaultSelectAll) {
    return transferData.value.map((item) => item.key).filter(Boolean);
  }
  return Array.from(new Set(props.initialDeviceIds.map(String).filter(Boolean)));
}

/** 在列表就绪后，按 props 同步右侧已选 key */
function syncFromProps(): void {
  if (loadError.value || !transferData.value.length) return;
  selectedDeviceKeys.value = resolveSelectedKeys();
}

watch(
  () => [props.initialDeviceIds, props.defaultSelectAll] as const,
  () => {
    if (!transferData.value.length) return;
    syncFromProps();
  },
  { deep: true }
);

/** 全量加载 scope=1 下可选设备列表 */
async function loadDevices(): Promise<void> {
  const requestSeq = ++bindRequestSeq;
  devicesLoading.value = true;
  loadError.value = "";

  try {
    const res = await DeviceGateway.getBind(undefined, 1);

    if (requestSeq !== bindRequestSeq) return;

    const rows = res?.list ?? [];
    deviceItems.value = mapBindDevicesToTabItems(Array.isArray(rows) ? rows : []);
    buildTransferData(deviceItems.value);
  } catch {
    if (requestSeq !== bindRequestSeq) return;

    deviceItems.value = [];
    transferData.value = [];
    loadError.value = "设备列表加载失败，请稍后重试";
  } finally {
    if (requestSeq === bindRequestSeq) {
      devicesLoading.value = false;
      if (!loadError.value) {
        syncFromProps();
      }
    }
  }
}

onMounted(() => {
  void loadDevices();
});

defineExpose({
  loading,
  getDeviceIds: (): string[] => selectedDeviceKeys.value.map(String).filter(Boolean),
  hasLoadError: (): boolean => Boolean(loadError.value),
  reapplySelection: (): void => {
    syncFromProps();
  },
});
</script>

<style scoped lang="scss">
.group-device-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.device-tip {
  flex-shrink: 0;
}

.device-list__state {
  padding: 8px;
  font-size: 13px;
  line-height: 24px;
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}
</style>
