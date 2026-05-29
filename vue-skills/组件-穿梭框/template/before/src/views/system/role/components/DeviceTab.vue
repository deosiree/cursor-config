<template>
  <div v-loading="loading" class="group-device-tab">
    <el-alert v-if="loadError" type="error" :closable="false" show-icon class="device-tip">
      {{ loadError }}
    </el-alert>
    <div class="device-search">
      <el-input
        v-model="deviceFilterKeyword"
        placeholder="鎼滅储璁惧鍚嶇О鎴栫紪鍙?
        clearable
        :disabled="loading"
      />
    </div>
    <div class="device-list">
      <div v-if="!loading && !devices.length" class="device-list__state">
        {{ loadError ? "璁惧鍒楄〃鍔犺浇澶辫触" : "鏆傛棤鍙€夎澶? }}
      </div>
      <el-table
        v-else-if="devices.length"
        ref="tableRef"
        :data="filteredDevices"
        row-key="id"
        border
        stripe
        :max-height="360"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="璁惧鍚嶇О" prop="name" min-width="160" show-overflow-tooltip />
        <el-table-column label="璁惧缂栧彿" prop="code" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ElTable } from "element-plus";
import DeviceGateway from "@/gateway/device/device.gateway";
import { useUserStoreHook } from "@/store/modules/user.store";
import { mapBindDevicesToTabItems, type DeviceTabItem } from "@/types/device";

interface Props {
  initialDeviceIds?: string[];
  /** 瑙掕壊鏂板缓锛氳澶囧垪琛ㄥ姞杞藉悗榛樿鍏ㄩ€?*/
  defaultSelectAll?: boolean;
  /** 鐖剁骇锛氱紪杈戞€佹媺璇︽儏涓庤彍鍗曟爲 */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialDeviceIds: () => [],
  defaultSelectAll: false,
  loading: false,
});

const userStore = useUserStoreHook();

const emit = defineEmits<{
  (e: "update:deviceIds", ids: string[]): void;
}>();

const deviceFilterKeyword = ref("");
const localSelectedDeviceIds = ref<string[]>([]);
const devices = ref<DeviceTabItem[]>([]);
const devicesLoading = ref(false);
const loading = computed(() => props.loading || devicesLoading.value);
const loadError = ref("");
const tableRef = ref<InstanceType<typeof ElTable> | null>(null);
const tenantId = computed(() => String((userStore.userInfo as any)?.tenantId ?? "").trim());
let bindRequestSeq = 0;
let syncingTableSelection = false;

watch(localSelectedDeviceIds, (val) => emit("update:deviceIds", [...val]), { deep: true });

/**
 * 瑙ｆ瀽骞惰繑鍥炶澶?ID 鍒楄〃銆? *
 * 鏍规嵁閰嶇疆鍐冲畾鏄繑鍥炴墍鏈夎澶囩殑 ID锛岃繕鏄繑鍥炲垵濮嬫寚瀹氱殑璁惧 ID銆? *
 * @returns {string[]} 璁惧 ID 鏁扮粍
 */
function resolveIds(): string[] {
  // 濡傛灉榛樿鍏ㄩ€夛紝鍒欐彁鍙栨墍鏈夋湁鏁堣澶?ID
  if (props.defaultSelectAll) {
    return devices.value.map((d) => d.id).filter(Boolean);
  }
  // 鍚﹀垯杩斿洖鍒濆鎸囧畾鐨勮澶?ID
  return [...props.initialDeviceIds];
}

/**
 * 搴旂敤璁惧閫夋嫨鐘舵€佸苟鍚屾琛ㄦ牸閫変腑椤? * @param ids - 閫変腑鐨勮澶嘔D鍒楄〃
 * @returns Promise<void> - 褰撻€夋嫨鐘舵€佹洿鏂颁笖琛ㄦ牸鍚屾瀹屾垚鍚巖esolve
 */
async function applySelection(ids: string[]): Promise<void> {
  // 鏇存柊鏈湴閫変腑鐨勮澶嘔D鍒楄〃
  localSelectedDeviceIds.value = ids;
  // 鍚屾琛ㄦ牸鐨勯€変腑鐘舵€佸埌杩滅▼鎴栫埗绾х粍浠?  await syncTableSelection(ids);
}

/**
 * 鍚屾琛ㄦ牸鐨勯€変腑鐘舵€佸埌鎸囧畾鐨?ID 鍒楄〃銆? * 璇ュ嚱鏁伴€氳繃娓呴櫎褰撳墠閫変腑椤瑰苟閲嶆柊閫変腑鍖归厤鐨勮锛岀‘淇濊鍥句笌鏁版嵁涓€鑷淬€? * 浣跨敤鍙岄噸 nextTick 纭繚 DOM 鏇存柊瀹屾垚鍚庡啀鎿嶄綔琛ㄦ牸瀹炰緥銆? *
 * @param ids - 闇€瑕佽閫変腑鐨勮澶?ID 鏁扮粍
 * @returns Promise<void>
 */
async function syncTableSelection(ids: string[]): Promise<void> {
  // 绛夊緟涓ゆ DOM 鏇存柊鍛ㄦ湡锛岀‘淇濊〃鏍兼覆鏌撳畬鎴愪笖鐘舵€佺ǔ瀹?  await nextTick();
  await nextTick();
  const table = tableRef.value;
  if (!table) return;

  // 璁剧疆鍚屾鏍囧織锛岄槻姝㈠湪鍚屾杩囩▼涓Е鍙戦€夋嫨鍙樺寲浜嬩欢瀵艰嚧寰幆璋冪敤鎴栫姸鎬佸啿绐?  syncingTableSelection = true;
  try {
    // 娓呴櫎褰撳墠鎵€鏈夐€変腑椤癸紝閬垮厤娈嬬暀閫変腑鐘舵€?    table.clearSelection();
    // 灏?ID 鏁扮粍杞崲涓?Set 浠ユ彁楂樻煡鎵炬晥鐜?    const idSet = new Set(ids);
    // 閬嶅巻杩囨护鍚庣殑璁惧鍒楄〃锛岄€変腑閭ｄ簺 ID 瀛樺湪浜庣洰鏍囬泦鍚堜腑鐨勮
    filteredDevices.value.forEach((row) => {
      if (idSet.has(row.id)) table.toggleRowSelection(row, true);
    });
    // 鏇存柊鏈湴閫変腑鐨勮澶?ID 鍒楄〃锛屼繚鎸佺姸鎬佸悓姝?    localSelectedDeviceIds.value = ids;
  } finally {
    // 鏃犺鎴愬姛鎴栧け璐ワ紝鍧囬噸缃悓姝ユ爣蹇楋紝鎭㈠姝ｅ父鐨勯€夋嫨浜嬩欢鐩戝惉
    syncingTableSelection = false;
  }
}

/**
 * 澶勭悊琛ㄦ牸閫夋嫨鍙樺寲浜嬩欢銆? * 褰撶敤鎴锋墜鍔ㄦ洿鏀硅〃鏍奸€変腑椤规椂锛屾洿鏂版湰鍦伴€変腑鐨勮澶?ID 鍒楄〃銆? * 濡傛灉姝ｅ浜庣▼搴忓寲鍚屾閫変腑鐘舵€佺殑杩囩▼涓紝鍒欏拷鐣ユ娆″彉鏇翠互閬垮厤鐘舵€佽鐩栥€? *
 * @param rows - 褰撳墠琚€変腑鐨勮〃鏍艰鏁版嵁鏁扮粍
 * @returns void
 */
function handleSelectionChange(rows: DeviceTabItem[]): void {
  // 濡傛灉姝ｅ湪鎵ц绋嬪簭鍖栧悓姝ワ紝鍒欏拷鐣ユ娆＄敱鐢ㄦ埛浜や簰鎴栫▼搴忚Е鍙戠殑浜嬩欢锛岄槻姝㈢姸鎬佸啿绐?  if (syncingTableSelection) return;
  // 鎻愬彇閫変腑琛岀殑 ID 骞惰繃婊ゆ帀鏃犳晥鍊硷紝鏇存柊鏈湴閫変腑鐘舵€?  localSelectedDeviceIds.value = rows.map((r) => r.id).filter(Boolean);
}

/**
 * 浠庡睘鎬ф垨澶栭儴鏁版嵁婧愬悓姝ラ€変腑鐘舵€併€? * 浠呭湪璁惧鍒楄〃宸插姞杞戒笖鏃犻敊璇椂鎵ц锛岄€氳繃瑙ｆ瀽褰撳墠搴旈€変腑鐨?ID 骞跺簲鐢ㄩ€夋嫨閫昏緫銆? *
 * @returns void
 */
function syncFromProps(): void {
  // 濡傛灉璁惧鍒楄〃涓虹┖鎴栧瓨鍦ㄥ姞杞介敊璇紝鍒欎笉鎵ц鍚屾鎿嶄綔
  if (!devices.value.length || loadError.value) return;
  // 寮傛搴旂敤鍩轰簬褰撳墠涓婁笅鏂囪В鏋愬嚭鐨?ID 閫夋嫨鐘舵€?  void applySelection(resolveIds());
}

watch(
  () => [props.initialDeviceIds, props.defaultSelectAll] as const,
  () => syncFromProps(),
  { deep: true, immediate: true }
);

/**
 * 鍔犺浇璁惧鍒楄〃鏁版嵁
 *
 * 璇ュ嚱鏁伴€氳繃 DeviceGateway 鑾峰彇缁戝畾璁惧淇℃伅锛屽苟澶勭悊绔炴€佹潯浠躲€侀敊璇姸鎬佸強UI鍔犺浇鐘舵€併€? * 浣跨敤璇锋眰搴忓垪鍙锋満鍒剁‘淇濆彧鏈夋渶鏂板彂璧风殑璇锋眰浼氭洿鏂版渶缁堢姸鎬侊紝闃叉鏃ц姹傝鐩栨柊璇锋眰鐨勭粨鏋溿€? *
 * @returns {Promise<void>} 鏃犺繑鍥炲€? */
async function loadDevices(): Promise<void> {
  // 鐢熸垚褰撳墠璇锋眰鐨勫敮涓€搴忓垪鍙凤紝鐢ㄤ簬璇嗗埆绔炴€佹潯浠?  const requestSeq = ++bindRequestSeq;
  devicesLoading.value = true;
  loadError.value = "";
  devices.value = [];

  try {
    const res = await DeviceGateway.getBind(tenantId.value);

    // 妫€鏌ヨ姹傚簭鍒楀彿锛岃嫢涓嶄竴鑷村垯璇存槑宸叉湁鏂拌姹傚彂鍑猴紝蹇界暐褰撳墠鍝嶅簲
    if (requestSeq !== bindRequestSeq) return;

    // 鍏煎涓嶅悓鐨勫搷搴旀暟鎹粨鏋勶紝鎻愬彇璁惧鍒楄〃
    const rows = res?.list ?? res?.result ?? [];
    devices.value = mapBindDevicesToTabItems(Array.isArray(rows) ? rows : []);
  } catch {
    // 鑻ヨ姹傝繃鏃跺垯蹇界暐閿欒澶勭悊
    if (requestSeq !== bindRequestSeq) return;

    devices.value = [];
    loadError.value = "璁惧鍒楄〃鍔犺浇澶辫触锛岃绋嶅悗閲嶈瘯";
  } finally {
    // 浠呭綋褰撳墠璇锋眰浠嶄负鏈€鏂拌姹傛椂锛屾墠閲嶇疆鍔犺浇鐘舵€佸苟鎵ц鍚庣画鍚屾閫昏緫
    if (requestSeq === bindRequestSeq) {
      devicesLoading.value = false;
      if (!loadError.value) {
        syncFromProps();
      }
    }
  }
}

const filteredDevices = computed(() => {
  const keyword = deviceFilterKeyword.value.trim().toLowerCase();
  if (!keyword) return devices.value;
  return devices.value.filter((item) => `${item.name}${item.code}`.toLowerCase().includes(keyword));
});

onMounted(() => {
  void loadDevices();
});

defineExpose({
  loading,
  getDeviceIds: (): string[] => [...localSelectedDeviceIds.value],
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
}

.device-search {
  flex-shrink: 0;
}

.device-list {
  flex: 1;
  min-height: 0;

  :deep(.el-table) {
    width: 100%;
  }
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
