<template>
  <div class="group-device-tab">
    <el-alert v-if="loadError" type="error" :closable="false" show-icon class="device-tip">
      {{ loadError }}
    </el-alert>
    <div v-if="!loading && !transferData.length" class="device-list__state">
      {{ loadError ? "设备列表加载失败" : "暂无可选设备" }}
    </div>
    <div v-else v-loading="loading" class="device-transfer-container">
      <customTransfer
        v-model="selectedDeviceKeys"
        :data="transferData"
        filterable
        :filter-method="filterDevice"
        filter-placeholder="搜索设备名称或编号"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
        :format="transferFormat"
        :validate-event="false"
        class="device-transfer"
        :virtual-scroll="false"
      >
        <template #left-footer>
          <div class="transfer-header">
            <div class="header-item">设备名称</div>
            <div class="header-item">设备编号</div>
          </div>
        </template>
        <template #right-footer>
          <div class="transfer-header">
            <div class="header-item">设备名称</div>
            <div class="header-item">设备编号</div>
          </div>
        </template>
        <template #default="{ option }">
          <div class="transfer-item">
            <div class="transfer-item__desc" :title="option.device?.name">
              {{ option.device?.name || "-" }}
            </div>
            <div class="transfer-item__desc" :title="option.device?.code">
              {{ option.device?.code || "-" }}
            </div>
          </div>
        </template>
      </customTransfer>
    </div>
  </div>
</template>

<script setup lang="ts">
import customTransfer from "@/components/transfer/src/transfer.vue";
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
/** 隐藏面板头「已选/总数」；须 truthy 字符串（空串会回退为 0/N） */
const transferFormat = { noChecked: " ", hasChecked: " " };

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
 * 构建穿梭框数据
 * @param items 设备列表
 * @returns 穿梭框数据
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

/**
 * 同步props数据
 */
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

/**
 * 过滤设备
 * @param query 搜索关键词
 * @param item 设备
 * @returns 是否过滤
 */
function filterDevice(query: string, item: TransferDataItem): boolean {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  const row = (item as DeviceTransferOption).device;
  const fields = [row?.name, row?.code];
  return fields.some((field) => (field || "").toString().toLowerCase().includes(q));
}

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

/* 与 RoleEditDialog Tab 内容区（max-height: 480px）对齐的固定可视高度 */
.device-transfer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: min(400px, calc(480px - 48px));
  min-height: 280px;
}

.device-transfer {
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

  /* 穿梭框面板真实类名为 el-panel（非 el-transfer-panel） */
  :deep(.el-panel) {
    display: flex !important;
    flex: 1 1 0;
    flex-direction: column;
    width: auto !important;
    min-width: 200px;
    height: 100%;
    min-height: 0;
    margin: 0;
    overflow: hidden;
  }

  :deep(.el-panel__header),
  :deep(.el-panel__filter),
  :deep(.el-panel__footer) {
    flex-shrink: 0;
  }

  :deep(.el-panel__filter) {
    padding: 8px 0 !important;

    .el-input {
      width: 100%;
    }
  }

  :deep(.el-panel__header) {
    .el-checkbox__label {
      font-size: 14px;
      font-weight: 600;
    }
  }

  :deep(.el-panel__footer) {
    height: auto !important;
    min-height: 28px;
    padding: 0;
    margin: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    border-top: none;
  }

  :deep(.el-panel__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: auto !important;
    min-height: 0;
    overflow: hidden;
  }

  /* 列表容器类名仍为 el-transfer-panel__list（通用组件内写死） */
  :deep(.el-transfer-panel__list) {
    flex: 1;
    height: auto !important;
    min-height: 0;
    max-height: 100% !important;
    padding: 4px 0;
    margin: 0;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  :deep(.el-transfer-panel__list.is-filterable) {
    height: 100% !important;
    padding-top: 0;
  }

  :deep(.el-panel__item.el-checkbox) {
    display: flex !important;
    align-items: center;
    height: auto !important;
    min-height: 32px;
    padding: 4px 8px 4px 0;
    margin-right: 0 !important;
    line-height: 1.4;

    .el-checkbox__input {
      position: static !important;
      top: auto !important;
      flex-shrink: 0;
    }

    .el-checkbox__label {
      display: flex !important;
      flex: 1;
      width: 100% !important;
      min-width: 0;
      max-width: 100%;
      padding-left: 8px !important;
      overflow: hidden;
      line-height: 1.4;
    }
  }

  :deep(.el-transfer__buttons) {
    display: flex;
    flex: 0 0 96px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto !important;
    padding: 0 4px;

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
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 6px 12px 6px 30px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;

  .header-item {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    white-space: nowrap;
  }
}

.transfer-item {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  width: 100%;
  min-width: 0;
  font-size: 13px;
  line-height: 1.4;

  &__desc {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-regular);
    text-align: left;
    white-space: nowrap;
  }
}
</style>
