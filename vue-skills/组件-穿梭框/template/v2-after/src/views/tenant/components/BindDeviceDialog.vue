<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="65%"
    :close-on-click-modal="false"
    draggable
    class="min-width-dialog"
    @close="handleClose"
    @closed="handleClosed"
  >
    <div v-loading="loading">
      <DeviceTransfer
        ref="transferRef"
        v-model="selectedDeviceKeys"
        :data="transferData"
        :columns="deviceColumns"
        host-height="500px"
        :filter-method="filterMethod"
        :filter-placeholder="$t('请输入设备名称、设备描述、机器码、租户、状态')"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
        :prevent-label-toggle="true"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="handleClose">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="submitting" size="small" @click="handleSubmit">
          {{ $t("确定") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { showNotification, handleApiError } from "@/utils/notification";
import DeviceGateway, { DEVICE_STATUS_CONFIG } from "@/gateway/device/device.gateway";
import DeviceTransfer from "@/components/transfer/src/transfer_v2/DeviceTransfer.vue";
import type { DeviceTransferColumn } from "@/components/transfer/src/transfer_v2/device-transfer";
import type { TransferDataItem } from "@/components/transfer/src/transfer";

interface DeviceTransferItem {
  id?: string | number;
  deviceName?: string;
  deviceDesc?: string;
  machineCode?: string;
  tenantName?: string;
  status?: number;
}

interface TransferOption {
  key: string;
  label: string;
  desc: string;
  device: DeviceTransferItem;
  type: "unbound" | "bound";
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
  tenantId?: string;
  tenantName?: string;
}

interface Emits {
  (e: "update:visible", visible: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  tenantId: undefined,
  tenantName: undefined,
});

const emit = defineEmits<Emits>();
const { t } = useI18n();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

// 动态生成对话框标题，包含租户名称
const dialogTitle = computed(() => {
  const baseTitle = t("绑定设备");
  if (props.tenantName) {
    return `【${props.tenantName}】${baseTitle}`;
  }
  return baseTitle;
});

const loading = ref(false);
const submitting = ref(false);
const unboundDeviceList = ref<DeviceTransferItem[]>([]); // 未绑定设备列表
const boundDeviceList = ref<DeviceTransferItem[]>([]); // 已绑定设备列表
const selectedDeviceKeys = ref<string[]>([]); // 穿梭框选中的设备key数组
const transferData = ref<TransferOption[]>([]); // 穿梭框数据源
const transferRef = ref<TransferExpose | null>(null); // 穿梭框组件引用

// 未绑定设备总数
const unboundTotal = ref(0);
// 已绑定设备总数
const boundTotal = ref(0);

// 动态生成穿梭框标题，显示总数
const transferTitles = computed<[string, string]>(() => {
  return [`${t("待绑定设备")}`, `${t("已绑定设备")}`];
  // return [`${t("待绑定设备")} (${unboundTotal.value})`, `${t("已绑定设备")} (${boundTotal.value})`];
});

const transferButtonTexts = computed<[string, string]>(() => [t("解绑"), t("绑定")]);

/** 三列展示；搜索默认列外还需租户、状态，见 filterMethod */
const deviceColumns = computed<DeviceTransferColumn[]>(() => [
  {
    label: t("设备名称"),
    getValue: (option) => (option as TransferOption).device?.deviceName,
  },
  {
    label: t("设备描述"),
    getValue: (option) => (option as TransferOption).device?.deviceDesc,
  },
  {
    label: t("机器码"),
    getValue: (option) => (option as TransferOption).device?.machineCode,
  },
]);

// 监听 visible 变化，打开时加载设备列表
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      selectedDeviceKeys.value = [];
      loadDeviceList();
    }
  }
);

/**
 * 加载待绑定（未激活）设备全量列表。
 * 数据与总数由 gateway 分页合并后返回；标题计数使用 res.total。
 */
async function loadUnboundDeviceList() {
  if (!props.tenantId) return;

  try {
    const res = await DeviceGateway.getUnbind();

    unboundTotal.value = Number(res?.total ?? 0);
    unboundDeviceList.value = res?.list || [];
    buildTransferData();
  } catch (error) {
    console.error("加载未绑定设备列表失败:", error);
    unboundDeviceList.value = [];
    unboundTotal.value = 0;
  }
}

/**
 * 加载当前租户已绑定设备全量列表。
 * 数据与总数由 gateway 分页合并后返回；标题计数使用 res.total。
 */
async function loadBoundDeviceList() {
  if (!props.tenantId) return;

  try {
    // { tenantId: props.tenantId }, tenantId: props.tenantId,临时注释掉，但是不要删掉这个注释
    const res = await DeviceGateway.getBind(props.tenantId);

    boundTotal.value = Number(res?.total ?? 0);
    boundDeviceList.value = res?.list || [];
    buildTransferData();
  } catch (error) {
    console.error("加载已绑定设备列表失败:", error);
    boundDeviceList.value = [];
    boundTotal.value = 0;
  }
}

/** 并行加载未绑定与已绑定设备，供穿梭框虚拟列表展示 */
async function loadDeviceList() {
  if (!props.tenantId) return;

  loading.value = true;
  try {
    // 并行加载未绑定和已绑定设备
    await Promise.all([loadUnboundDeviceList(), loadBoundDeviceList()]);
  } catch (error) {
    console.error("加载设备列表失败:", error);
    handleApiError(error, t("加载设备列表失败"));
    unboundDeviceList.value = [];
    boundDeviceList.value = [];
    transferData.value = [];
    unboundTotal.value = 0;
    boundTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 合并未绑定/已绑定列表为穿梭框数据源，已绑定项默认在右侧。
 */
function buildTransferData() {
  const data: TransferOption[] = [];
  selectedDeviceKeys.value = [];

  // 添加未绑定的设备
  unboundDeviceList.value.forEach((device) => {
    data.push({
      key: `unbound-${device.id}`,
      label: device.deviceName || device.deviceDesc || device.machineCode || String(device.id),
      desc: `${t("机器码")}: ${device.machineCode}`,
      device,
      type: "unbound",
    });
  });

  // 添加已绑定的设备
  boundDeviceList.value.forEach((device) => {
    const statusLabel =
      typeof device.status === "number" ? DEVICE_STATUS_CONFIG[device.status]?.label || "-" : "-";
    data.push({
      key: `bound-${device.id}`,
      label: device.deviceName || device.deviceDesc || device.machineCode || String(device.id),
      desc: `${t("机器码")}: ${device.machineCode} | ${t("状态")}: ${statusLabel}`,
      device,
      type: "bound",
    });
    // 已绑定的设备默认在右侧（选中状态）
    selectedDeviceKeys.value.push(`bound-${device.id}`);
  });

  transferData.value = data;
}

/**
 * 自定义搜索：除三列设备字段外，包含租户名与状态文案。
 */
function filterMethod(query: string, item: TransferDataItem) {
  const row = item as TransferOption;
  const q = (query || "").toString().trim().toLowerCase();
  if (!q) return true;
  const dev: DeviceTransferItem = row?.device ?? {};
  const statusLabel =
    typeof dev.status === "number" ? DEVICE_STATUS_CONFIG?.[dev.status]?.label : undefined;
  const fields = [dev.deviceName, dev.deviceDesc, dev.machineCode, dev.tenantName, statusLabel];
  return fields.some((f) => (f || "").toString().toLowerCase().includes(q));
}

// 关闭对话框
function handleClose() {
  dialogVisible.value = false;
}

// 对话框完全关闭后清空数据
function handleClosed() {
  selectedDeviceKeys.value = [];
  unboundDeviceList.value = [];
  boundDeviceList.value = [];
  transferData.value = [];
  unboundTotal.value = 0;
  boundTotal.value = 0;

  // 清空搜索框的值
  nextTick(() => {
    if (transferRef.value) {
      // 使用组件暴露的方法清空搜索框
      if (transferRef.value.clearQuery) {
        transferRef.value.clearQuery("left");
        transferRef.value.clearQuery("right");
      } else if (transferRef.value.leftPanel && transferRef.value.rightPanel) {
        // 备用方案：直接访问面板的 query ref
        if (transferRef.value.leftPanel.query !== undefined) {
          transferRef.value.leftPanel.query = "";
        }
        if (transferRef.value.rightPanel.query !== undefined) {
          transferRef.value.rightPanel.query = "";
        }
      }
    }
  });
}

// 绑定设备
async function handleSubmit() {
  if (!props.tenantId || !props.tenantName) {
    showNotification(t("租户信息不存在"), { type: "warning" });
    return;
  }

  submitting.value = true;
  try {
    // 获取需要绑定的设备（在右侧但原本是未绑定的）
    const devicesToBind = transferData.value
      .filter((item) => selectedDeviceKeys.value.includes(item.key) && item.type === "unbound")
      .map((item) => item.device.id);

    // 获取需要解绑的设备（在左侧但原本是已绑定的）
    const devicesToUnbind = transferData.value
      .filter((item) => !selectedDeviceKeys.value.includes(item.key) && item.type === "bound")
      .map((item) => item.device.id);
    if (devicesToBind.length !== 0 || devicesToUnbind.length !== 0) {
      // 批量绑定和解绑设备(有设备需要操作才调用接口)
      const res = await DeviceGateway.deviceActivate({
        tenantId: props.tenantId,
        // 绑定的所有设备key
        activateDeviceIds: devicesToBind,
        // 解绑的所有设备key
        deactivateDeviceIds: devicesToUnbind,
        autoDeviceKey: true,
        deviceName: "",
      });
      if (res) {
        showNotification(t("操作成功"), { type: "success" });
      }
    }
    handleClose();
    emit("success");
  } catch (error) {
    console.error("操作设备失败:", error);
    handleApiError(error, t("操作设备失败"));
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
