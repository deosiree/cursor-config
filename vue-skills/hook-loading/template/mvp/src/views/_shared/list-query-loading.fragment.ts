/**
 * 形态 B：列表查询页内联全屏 loading（不抽领域 hook）。
 * 真源参照：opsdeck/src/views/projectManage/index.vue（getProjectList 段）。
 */
import { ref } from "vue";
import { useLoading } from "@/layouts/composables/useLoading";

const { startLoading, stopLoading } = useLoading(); // 默认 delay=500

const tableData = ref<unknown[]>([]);
const queryParams = ref({ page: 1, pageSize: 20 });

async function fetchList() {
  try {
    startLoading();
    const data = await ListGateway.getList(queryParams.value);
    tableData.value = data.items ?? [];
  } finally {
    stopLoading();
  }
}

// 查询按钮 / onMounted 直接调用 fetchList，勿创建 useXxxList composable
