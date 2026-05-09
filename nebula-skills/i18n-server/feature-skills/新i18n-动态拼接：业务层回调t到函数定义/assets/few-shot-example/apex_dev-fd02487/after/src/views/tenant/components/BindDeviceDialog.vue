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
    <div id="bindDevice" v-loading="loading" class="transfer-container">
      <customTransfer
        ref="transferRef"
        v-model="selectedDeviceKeys"
        :data="transferData"
        filterable
        :filter-method="filterMethod"
        :filter-placeholder="$t('请输入设备名称、设备描述、机器码、租户、状态')"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
        class="full-height-transfer"
        :virtual-scroll="true"
      >
        <template #left-footer>
          <div class="transfer-header">
            <div class="header-item">{{ $t("设备名称") }}</div>
            <div class="header-item">{{ $t("设备描述") }}</div>
            <div class="header-item">{{ $t("机器码") }}</div>
            <div class="header-item">{{ $t("租户") }}</div>
            <div class="header-item">{{ $t("状态") }}</div>
          </div>
        </template>

        <template #right-footer>
          <div class="transfer-header">
            <div class="header-item">{{ $t("设备名称") }}</div>
            <div class="header-item">{{ $t("设备描述") }}</div>
            <div class="header-item">{{ $t("机器码") }}</div>
            <div class="header-item">{{ $t("租户") }}</div>
            <div class="header-item">{{ $t("状态") }}</div>
          </div>
        </template>

        <template #default="{ option }">
          <div class="transfer-item">
            <div class="transfer-item__desc" :title="option.device?.deviceName">
              {{ option.device?.deviceName || "-" }}
            </div>
            <div class="transfer-item__desc" :title="option.device?.deviceDesc">
              {{ option.device?.deviceDesc || "-" }}
            </div>
            <div class="transfer-item__desc" :title="option.device?.machineCode">
              {{ option.device?.machineCode || "-" }}
            </div>
            <div class="transfer-item__desc" :title="option.device?.tenantName">
              {{ option.device?.tenantName || "-" }}
            </div>
            <div class="transfer-item__desc">
              <el-tag
                v-if="option.device?.status && DEVICE_STATUS_CONFIG[option.device.status]"
                :type="DEVICE_STATUS_CONFIG[option.device.status].type"
                size="small"
                disable-transitions
              >
                {{ $t(DEVICE_STATUS_CONFIG[option.device.status].label) }}
              </el-tag>
              <span v-else>-</span>
            </div>
          </div>
        </template>
      </customTransfer>
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
import { showNotification } from "@/utils/notification";
import DeviceGateway, { DEVICE_STATUS_CONFIG } from "@/gateway/device/device.gateway";
import customTransfer from "@/components/transfer/src/transfer.vue";

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
  return [`${t("待绑定设备")} (${unboundTotal.value})`, `${t("已绑定设备")} (${boundTotal.value})`];
});

const transferButtonTexts = computed<[string, string]>(() => [t("解绑"), t("绑定")]);

// 监听 visible 变化，打开时加载设备列表
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      selectedDeviceKeys.value = [];
      loadDeviceList();
      // 在数据加载后添加事件监听
      nextTick(() => {
        setupLabelClickPrevention();
      });
    }
  }
);

// 阻止 label 区域的点击事件，但允许 hover
function setupLabelClickPrevention() {
  const transferContainer = document.querySelector("#bindDevice");
  if (!transferContainer) return;

  // 事件委托：在 label 区域阻止点击事件传播到 checkbox
  const handleLabelClick = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    // 如果点击的是 label 区域（不是 checkbox 输入框）
    if (target.closest(".el-checkbox__label") && !target.closest(".el-checkbox__input")) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      mouseEvent.stopImmediatePropagation();
    }
  };

  // 使用捕获阶段来更早地拦截事件
  transferContainer.addEventListener("click", handleLabelClick, true);
}

// 加载未绑定设备列表（一次性加载所有数据）
async function loadUnboundDeviceList() {
  if (!props.tenantId) return;

  try {
    const res = await DeviceGateway.getUnbind();

    const total = res?.total || 0;
    unboundTotal.value = total;
    unboundDeviceList.value = res?.list || [];
    buildTransferData();
  } catch (error) {
    console.error("加载未绑定设备列表失败:", error);
    showNotification(t("加载未绑定设备列表失败"), { type: "error" });
    unboundDeviceList.value = [];
    unboundTotal.value = 0;
  }
}

// 加载已绑定设备列表（一次性加载所有数据）
async function loadBoundDeviceList() {
  if (!props.tenantId) return;

  try {
    // { tenantId: props.tenantId }, tenantId: props.tenantId,临时注释掉，但是不要删掉这个注释
    const res = await DeviceGateway.getBind();

    const total = res?.total || 0;
    boundTotal.value = total;
    boundDeviceList.value = res?.list || [];
    buildTransferData();
  } catch (error) {
    console.error("加载已绑定设备列表失败:", error);
    showNotification(t("加载已绑定设备列表失败"), { type: "error" });
    boundDeviceList.value = [];
    boundTotal.value = 0;
  }
}

// 加载设备列表（加载未绑定和已绑定的设备）
async function loadDeviceList() {
  if (!props.tenantId) return;

  loading.value = true;
  try {
    // 并行加载未绑定和已绑定设备
    await Promise.all([loadUnboundDeviceList(), loadBoundDeviceList()]);
  } catch (error) {
    console.error("加载设备列表失败:", error);
    showNotification(t("加载设备列表失败"), { type: "error" });
    unboundDeviceList.value = [];
    boundDeviceList.value = [];
    transferData.value = [];
    unboundTotal.value = 0;
    boundTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

// 构建穿梭框数据源
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

// 穿梭框过滤方法
function filterMethod(query: string, item: { device?: DeviceTransferItem }) {
  const q = (query || "").toString().trim().toLowerCase();
  if (!q) return true;
  const dev: DeviceTransferItem = item?.device ?? {};
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
    // 批量绑定和解绑设备
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
    handleClose();
    emit("success");
  } catch (error) {
    console.error("操作设备失败:", error);
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

.full-height-transfer {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;

  :deep(.el-transfer) {
    display: flex;
    width: 100%;
    height: 100%;
  }

  :deep(.el-transfer-panel) {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    margin: 0;
    .el-transfer-panel__filter {
      padding: 4px !important;
      // 定义 filter 高度变量（输入框高度约32px + padding 8px）
      --el-transfer-filter-height: 40px;
    }

    .el-transfer-panel__header {
      flex-shrink: 0;
      order: 1;
      // 定义 header 高度变量（checkbox + padding，约40px）
      --el-transfer-header-height: 40px;
    }

    .el-transfer-panel__body {
      display: flex;
      flex-direction: column;
      order: 3;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    // 将 footer 移到 body 之前作为表头
    .el-transfer-panel__footer {
      flex-shrink: 0;
      order: 2;
      height: 25px !important;
      padding: 0;
      margin: 0;
      border-top: none;
      // 定义 footer 高度变量
      --el-transfer-footer-height: 25px;
    }

    .el-transfer-panel__list {
      display: flex;
      flex: 1;
      flex-direction: column;
      //pannel 的高度减去 filter 的高度
      height: calc(100% - var(--el-transfer-filter-height, 40px)) !important;
      min-height: 0;
      overflow: hidden;
      // 允许用户选择文本并复制
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }

    // 调整 checkbox 高度与列表项一致
    .el-checkbox {
      display: flex;
      align-items: center;
      margin-right: 8px;
      .el-checkbox__inner {
        margin: 0;
      }
    }

    // 列表项容器
    .el-transfer-panel__item {
      display: flex;
      justify-content: center;
    }
  }

  :deep(.el-transfer__buttons) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;
    padding: 0 10px;

    .el-button {
      width: 80px;
      height: 28px;
      padding: 7px 15px;
      margin: 0;
      font-size: 12px;
      line-height: 1;

      + .el-button {
        margin-top: 10px;
      }
    }
  }
}

:deep(.el-transfer-panel .el-checkbox__inner::after) {
  left: 6px;
}

/* 表头样式 */
.transfer-header {
  display: flex;
  // grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  padding: 4px 0 4px 22px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
  .header-title {
    padding-bottom: 4px;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-bottom: 1px solid var(--el-border-color-light);
  }
  .header-item {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    white-space: nowrap;
  }
}

.transfer-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  // 允许用户选择文本并复制
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;

  &__name {
    flex: 1;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  &__desc {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-regular);
    text-align: left;
    white-space: nowrap;
  }
}
// 限定在 transfer-container 容器内，避免影响其他页面
.transfer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  :deep(.el-panel__header) {
    padding-bottom: 10px;
    margin: 0;
  }
  :deep(.el-panel__footer) {
    padding: 10px 0;
    margin: 0;
  }
  :deep(.el-transfer__buttons) {
    width: 10% !important;
    min-width: 100px;
    // 去掉第二个按钮的默认 margin 和 padding
    .el-button:nth-child(2) {
      padding: 0 !important;
      margin: 10px !important;
    }
  }
  :deep(.el-panel) {
    width: 45% !important;
    min-width: 350px;
  }

  :deep(.el-panel__body) {
    // 100% 减去 header（约40px）、filter（约40px）和 footer（25px）的高度
    height: calc(100% - 120px) !important;
  }

  :deep(.el-panel__header .el-checkbox__label) {
    font-size: 16px;
    font-weight: 550;
  }

  :deep(.el-transfer-panel__item) {
    padding-left: 0px;
    margin-right: 0 !important;

    // label 区域允许鼠标事件（以便 hover 生效），但点击会被 JavaScript 阻止
    .el-checkbox__label {
      pointer-events: all !important;
      cursor: default; // 显示默认光标，表示不可点击
      // 允许用户选择文本并复制
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }

    // checkbox 输入框正常响应所有鼠标事件（包括点击）
    .el-checkbox__input {
      pointer-events: all !important;
      // checkbox 输入框本身不允许文本选择（避免影响点击）
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
  }
}
</style>
