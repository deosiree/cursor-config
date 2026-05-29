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
        :filter-placeholder="$t('璇疯緭鍏ヨ澶囧悕绉般€佽澶囨弿杩般€佹満鍣ㄧ爜銆佺鎴枫€佺姸鎬?)"
        :titles="transferTitles"
        :button-texts="transferButtonTexts"
        class="full-height-transfer"
        :virtual-scroll="true"
      >
        <template #left-footer>
          <div class="transfer-header">
            <div class="header-item">{{ $t("璁惧鍚嶇О") }}</div>
            <div class="header-item">{{ $t("璁惧鎻忚堪") }}</div>
            <div class="header-item">{{ $t("鏈哄櫒鐮?) }}</div>
            <!-- <div class="header-item">{{ $t("绉熸埛") }}</div> -->
            <!-- <div class="header-item">{{ $t("鐘舵€?) }}</div> -->
          </div>
        </template>

        <template #right-footer>
          <div class="transfer-header">
            <div class="header-item">{{ $t("璁惧鍚嶇О") }}</div>
            <div class="header-item">{{ $t("璁惧鎻忚堪") }}</div>
            <div class="header-item">{{ $t("鏈哄櫒鐮?) }}</div>
            <!-- <div class="header-item">{{ $t("绉熸埛") }}</div> -->
            <!-- <div class="header-item">{{ $t("鐘舵€?) }}</div> -->
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
            <!-- <div class="transfer-item__desc" :title="option.device?.tenantName">
              {{ option.device?.tenantName || "-" }}
            </div> -->
            <!-- <div class="transfer-item__desc">
              <el-tag
                v-if="option.device?.status && DEVICE_STATUS_CONFIG[option.device.status]"
                :type="DEVICE_STATUS_CONFIG[option.device.status].type"
                size="small"
                disable-transitions
              >
                {{ $t(DEVICE_STATUS_CONFIG[option.device.status].label) }}
              </el-tag>
              <span v-else>-</span>
            </div> -->
          </div>
        </template>
      </customTransfer>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="handleClose">{{ $t("鍙栨秷") }}</el-button>
        <el-button type="primary" :loading="submitting" size="small" @click="handleSubmit">
          {{ $t("纭畾") }}
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

// 鍔ㄦ€佺敓鎴愬璇濇鏍囬锛屽寘鍚鎴峰悕绉?const dialogTitle = computed(() => {
  const baseTitle = t("缁戝畾璁惧");
  if (props.tenantName) {
    return `銆?{props.tenantName}銆?{baseTitle}`;
  }
  return baseTitle;
});

const loading = ref(false);
const submitting = ref(false);
const unboundDeviceList = ref<DeviceTransferItem[]>([]); // 鏈粦瀹氳澶囧垪琛?const boundDeviceList = ref<DeviceTransferItem[]>([]); // 宸茬粦瀹氳澶囧垪琛?const selectedDeviceKeys = ref<string[]>([]); // 绌挎妗嗛€変腑鐨勮澶噆ey鏁扮粍
const transferData = ref<TransferOption[]>([]); // 绌挎妗嗘暟鎹簮
const transferRef = ref<TransferExpose | null>(null); // 绌挎妗嗙粍浠跺紩鐢?
// 鏈粦瀹氳澶囨€绘暟
const unboundTotal = ref(0);
// 宸茬粦瀹氳澶囨€绘暟
const boundTotal = ref(0);

// 鍔ㄦ€佺敓鎴愮┛姊鏍囬锛屾樉绀烘€绘暟
const transferTitles = computed<[string, string]>(() => {
  return [`${t("寰呯粦瀹氳澶?)} (${unboundTotal.value})`, `${t("宸茬粦瀹氳澶?)} (${boundTotal.value})`];
});

const transferButtonTexts = computed<[string, string]>(() => [t("瑙ｇ粦"), t("缁戝畾")]);

// 鐩戝惉 visible 鍙樺寲锛屾墦寮€鏃跺姞杞借澶囧垪琛?watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      selectedDeviceKeys.value = [];
      loadDeviceList();
      // 鍦ㄦ暟鎹姞杞藉悗娣诲姞浜嬩欢鐩戝惉
      nextTick(() => {
        setupLabelClickPrevention();
      });
    }
  }
);

// 闃绘 label 鍖哄煙鐨勭偣鍑讳簨浠讹紝浣嗗厑璁?hover
function setupLabelClickPrevention() {
  const transferContainer = document.querySelector("#bindDevice");
  if (!transferContainer) return;

  // 浜嬩欢濮旀墭锛氬湪 label 鍖哄煙闃绘鐐瑰嚮浜嬩欢浼犳挱鍒?checkbox
  const handleLabelClick = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    // 濡傛灉鐐瑰嚮鐨勬槸 label 鍖哄煙锛堜笉鏄?checkbox 杈撳叆妗嗭級
    if (target.closest(".el-checkbox__label") && !target.closest(".el-checkbox__input")) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      mouseEvent.stopImmediatePropagation();
    }
  };

  // 浣跨敤鎹曡幏闃舵鏉ユ洿鏃╁湴鎷︽埅浜嬩欢
  transferContainer.addEventListener("click", handleLabelClick, true);
}

// 鍔犺浇鏈粦瀹氳澶囧垪琛紙涓€娆℃€у姞杞芥墍鏈夋暟鎹級
async function loadUnboundDeviceList() {
  if (!props.tenantId) return;

  try {
    const res = await DeviceGateway.getUnbind();

    const total = res?.total || 0;
    unboundTotal.value = total;
    unboundDeviceList.value = res?.list || [];
    buildTransferData();
  } catch (error) {
    console.error("鍔犺浇鏈粦瀹氳澶囧垪琛ㄥけ璐?", error);
    unboundDeviceList.value = [];
    unboundTotal.value = 0;
  }
}

// 鍔犺浇宸茬粦瀹氳澶囧垪琛紙涓€娆℃€у姞杞芥墍鏈夋暟鎹級
async function loadBoundDeviceList() {
  if (!props.tenantId) return;

  try {
    // { tenantId: props.tenantId }, tenantId: props.tenantId,涓存椂娉ㄩ噴鎺夛紝浣嗘槸涓嶈鍒犳帀杩欎釜娉ㄩ噴
    const res = await DeviceGateway.getBind(props.tenantId);

    const total = res?.total || 0;
    boundTotal.value = total;
    boundDeviceList.value = res?.list || [];
    buildTransferData();
  } catch (error) {
    console.error("鍔犺浇宸茬粦瀹氳澶囧垪琛ㄥけ璐?", error);
    boundDeviceList.value = [];
    boundTotal.value = 0;
  }
}

// 鍔犺浇璁惧鍒楄〃锛堝姞杞芥湭缁戝畾鍜屽凡缁戝畾鐨勮澶囷級
async function loadDeviceList() {
  if (!props.tenantId) return;

  loading.value = true;
  try {
    // 骞惰鍔犺浇鏈粦瀹氬拰宸茬粦瀹氳澶?    await Promise.all([loadUnboundDeviceList(), loadBoundDeviceList()]);
  } catch (error) {
    console.error("鍔犺浇璁惧鍒楄〃澶辫触:", error);
    handleApiError(error, t("鍔犺浇璁惧鍒楄〃澶辫触"));
    unboundDeviceList.value = [];
    boundDeviceList.value = [];
    transferData.value = [];
    unboundTotal.value = 0;
    boundTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

// 鏋勫缓绌挎妗嗘暟鎹簮
function buildTransferData() {
  const data: TransferOption[] = [];
  selectedDeviceKeys.value = [];

  // 娣诲姞鏈粦瀹氱殑璁惧
  unboundDeviceList.value.forEach((device) => {
    data.push({
      key: `unbound-${device.id}`,
      label: device.deviceName || device.deviceDesc || device.machineCode || String(device.id),
      desc: `${t("鏈哄櫒鐮?)}: ${device.machineCode}`,
      device,
      type: "unbound",
    });
  });

  // 娣诲姞宸茬粦瀹氱殑璁惧
  boundDeviceList.value.forEach((device) => {
    const statusLabel =
      typeof device.status === "number" ? DEVICE_STATUS_CONFIG[device.status]?.label || "-" : "-";
    data.push({
      key: `bound-${device.id}`,
      label: device.deviceName || device.deviceDesc || device.machineCode || String(device.id),
      desc: `${t("鏈哄櫒鐮?)}: ${device.machineCode} | ${t("鐘舵€?)}: ${statusLabel}`,
      device,
      type: "bound",
    });
    // 宸茬粦瀹氱殑璁惧榛樿鍦ㄥ彸渚э紙閫変腑鐘舵€侊級
    selectedDeviceKeys.value.push(`bound-${device.id}`);
  });

  transferData.value = data;
}

// 绌挎妗嗚繃婊ゆ柟娉?function filterMethod(query: string, item: { device?: DeviceTransferItem }) {
  const q = (query || "").toString().trim().toLowerCase();
  if (!q) return true;
  const dev: DeviceTransferItem = item?.device ?? {};
  const statusLabel =
    typeof dev.status === "number" ? DEVICE_STATUS_CONFIG?.[dev.status]?.label : undefined;
  const fields = [dev.deviceName, dev.deviceDesc, dev.machineCode, dev.tenantName, statusLabel];
  return fields.some((f) => (f || "").toString().toLowerCase().includes(q));
}

// 鍏抽棴瀵硅瘽妗?function handleClose() {
  dialogVisible.value = false;
}

// 瀵硅瘽妗嗗畬鍏ㄥ叧闂悗娓呯┖鏁版嵁
function handleClosed() {
  selectedDeviceKeys.value = [];
  unboundDeviceList.value = [];
  boundDeviceList.value = [];
  transferData.value = [];
  unboundTotal.value = 0;
  boundTotal.value = 0;

  // 娓呯┖鎼滅储妗嗙殑鍊?  nextTick(() => {
    if (transferRef.value) {
      // 浣跨敤缁勪欢鏆撮湶鐨勬柟娉曟竻绌烘悳绱㈡
      if (transferRef.value.clearQuery) {
        transferRef.value.clearQuery("left");
        transferRef.value.clearQuery("right");
      } else if (transferRef.value.leftPanel && transferRef.value.rightPanel) {
        // 澶囩敤鏂规锛氱洿鎺ヨ闂潰鏉跨殑 query ref
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

// 缁戝畾璁惧
async function handleSubmit() {
  if (!props.tenantId || !props.tenantName) {
    showNotification(t("绉熸埛淇℃伅涓嶅瓨鍦?), { type: "warning" });
    return;
  }

  submitting.value = true;
  try {
    // 鑾峰彇闇€瑕佺粦瀹氱殑璁惧锛堝湪鍙充晶浣嗗師鏈槸鏈粦瀹氱殑锛?    const devicesToBind = transferData.value
      .filter((item) => selectedDeviceKeys.value.includes(item.key) && item.type === "unbound")
      .map((item) => item.device.id);

    // 鑾峰彇闇€瑕佽В缁戠殑璁惧锛堝湪宸︿晶浣嗗師鏈槸宸茬粦瀹氱殑锛?    const devicesToUnbind = transferData.value
      .filter((item) => !selectedDeviceKeys.value.includes(item.key) && item.type === "bound")
      .map((item) => item.device.id);
    // 鎵归噺缁戝畾鍜岃В缁戣澶?    const res = await DeviceGateway.deviceActivate({
      tenantId: props.tenantId,
      // 缁戝畾鐨勬墍鏈夎澶噆ey
      activateDeviceIds: devicesToBind,
      // 瑙ｇ粦鐨勬墍鏈夎澶噆ey
      deactivateDeviceIds: devicesToUnbind,
      autoDeviceKey: true,
      deviceName: "",
    });
    if (res) {
      showNotification(t("鎿嶄綔鎴愬姛"), { type: "success" });
    }
    handleClose();
    emit("success");
  } catch (error) {
    console.error("鎿嶄綔璁惧澶辫触:", error);
    handleApiError(error, t("鎿嶄綔璁惧澶辫触"));
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
      // 瀹氫箟 filter 楂樺害鍙橀噺锛堣緭鍏ユ楂樺害绾?2px + padding 8px锛?      --el-transfer-filter-height: 40px;
    }

    .el-transfer-panel__header {
      flex-shrink: 0;
      order: 1;
      // 瀹氫箟 header 楂樺害鍙橀噺锛坈heckbox + padding锛岀害40px锛?      --el-transfer-header-height: 40px;
    }

    .el-transfer-panel__body {
      display: flex;
      flex-direction: column;
      order: 3;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    // 灏?footer 绉诲埌 body 涔嬪墠浣滀负琛ㄥご
    .el-transfer-panel__footer {
      flex-shrink: 0;
      order: 2;
      height: 25px !important;
      padding: 0;
      margin: 0;
      border-top: none;
      // 瀹氫箟 footer 楂樺害鍙橀噺
      --el-transfer-footer-height: 25px;
    }

    .el-transfer-panel__list {
      display: flex;
      flex: 1;
      flex-direction: column;
      //pannel 鐨勯珮搴﹀噺鍘?filter 鐨勯珮搴?      height: calc(100% - var(--el-transfer-filter-height, 40px)) !important;
      min-height: 0;
      overflow: hidden;
      // 鍏佽鐢ㄦ埛閫夋嫨鏂囨湰骞跺鍒?      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }

    // 璋冩暣 checkbox 楂樺害涓庡垪琛ㄩ」涓€鑷?    .el-checkbox {
      display: flex;
      align-items: center;
      margin-right: 8px;
      .el-checkbox__inner {
        margin: 0;
      }
    }

    // 鍒楄〃椤瑰鍣?    .el-transfer-panel__item {
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

/* 琛ㄥご鏍峰紡 */
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
  // 鍏佽鐢ㄦ埛閫夋嫨鏂囨湰骞跺鍒?  -webkit-user-select: text;
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
// 闄愬畾鍦?transfer-container 瀹瑰櫒鍐咃紝閬垮厤褰卞搷鍏朵粬椤甸潰
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
    // 鍘绘帀绗簩涓寜閽殑榛樿 margin 鍜?padding
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
    // 100% 鍑忓幓 header锛堢害40px锛夈€乫ilter锛堢害40px锛夊拰 footer锛?5px锛夌殑楂樺害
    height: calc(100% - 120px) !important;
  }

  :deep(.el-panel__header .el-checkbox__label) {
    font-size: 16px;
    font-weight: 550;
  }

  :deep(.el-transfer-panel__item) {
    padding-left: 0px;
    margin-right: 0 !important;

    // label 鍖哄煙鍏佽榧犳爣浜嬩欢锛堜互渚?hover 鐢熸晥锛夛紝浣嗙偣鍑讳細琚?JavaScript 闃绘
    .el-checkbox__label {
      pointer-events: all !important;
      cursor: default; // 鏄剧ず榛樿鍏夋爣锛岃〃绀轰笉鍙偣鍑?      // 鍏佽鐢ㄦ埛閫夋嫨鏂囨湰骞跺鍒?      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }

    // checkbox 杈撳叆妗嗘甯稿搷搴旀墍鏈夐紶鏍囦簨浠讹紙鍖呮嫭鐐瑰嚮锛?    .el-checkbox__input {
      pointer-events: all !important;
      // checkbox 杈撳叆妗嗘湰韬笉鍏佽鏂囨湰閫夋嫨锛堥伩鍏嶅奖鍝嶇偣鍑伙級
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
  }
}
</style>
