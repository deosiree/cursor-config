<template>
  <div class="dashboard-container">
    <el-row :gutter="13" class="mb-[13px]">
      <!-- 租户总数 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content h-full">
            <div class="kpi-icon" style="background-color: #ecf5ff">
              <el-icon :size="32"><OfficeBuilding color="#369fff" /></el-icon>
            </div>
            <div class="kpi-info flex-col">
              <div class="kpi-title flex-1 color-#369fff">
                {{ t("dashboard.kpi.tenantTotal") }}
              </div>
              <div class="kpi-value flex-1 color-#369fff">{{ kpiData.tenantTotal }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 用户总数 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon" style="background-color: #f0f9eb">
              <div class="i-svg:common-user-1 w-[32px] h-[32px]" color="#67C23A"></div>
            </div>
            <div class="kpi-info">
              <div class="kpi-title color-#67C23A">
                {{ t("dashboard.kpi.userTotal") }}
              </div>
              <div class="kpi-value color-#67C23A">{{ kpiData.userTotal }}</div>
              <div class="kpi-detail">
                <span class="detail-item">
                  <span class="detail-label">{{ t("dashboard.kpi.userEnabled") }}：</span>
                  <span class="detail-value enabled">
                    {{ kpiData.userEnabled }}
                  </span>
                </span>
                <span class="detail-item">
                  <span class="detail-label">{{ t("dashboard.kpi.userDisabled") }}：</span>
                  <span class="detail-value disabled">
                    {{ kpiData.userDisabled }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 设备总数 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon" style="background-color: #ecf5ff">
              <div class="i-svg:common-monitor w-[32px] h-[32px]" color="#369fff"></div>
            </div>
            <div class="kpi-info device-info">
              <div class="kpi-title color-#369fff">
                {{ t("dashboard.kpi.deviceTotal") }}
              </div>
              <div class="kpi-value color-#369fff">
                {{ formatNumberWithSeparator(deviceOverView.total) }}
              </div>
              <div class="kpi-detail device-detail">
                <div class="sub-stat-item">
                  {{ t("dashboard.kpi.online") }}：
                  <strong class="sub-value online-value">
                    {{ formatNumberWithSeparator(deviceOverView.online) }}
                  </strong>
                </div>
                <div class="sub-stat-item">
                  {{ t("dashboard.kpi.offline") }}：
                  <strong class="sub-value offline-value">
                    {{ formatNumberWithSeparator(deviceOverView.offline) }}
                  </strong>
                </div>
                <div class="sub-stat-item">
                  {{ t("dashboard.kpi.notActivated") }}：
                  <strong class="sub-value disconnect-value">
                    {{ formatNumberWithSeparator(deviceOverView.activated) }}
                  </strong>
                </div>
                <div class="sub-stat-item">
                  {{ t("dashboard.kpi.disabled") }}：
                  <strong class="sub-value danger-value">
                    {{ formatNumberWithSeparator(deviceOverView.disabled) }}
                  </strong>
                </div>
                <el-divider direction="vertical" />
                <div class="sub-stat-item">
                  {{ t("dashboard.kpi.unallocated") }}：
                  <strong class="sub-value unallocated-value">
                    {{ formatNumberWithSeparator(deviceOverView.unactivated) }}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 状态分布图表区域 -->
    <el-row :gutter="13" class="mb-[13px] chart-row">
      <!-- 用户状态分布 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12" class="chart-col">
        <el-card shadow="hover" class="chart-card-full">
          <template #header>
            <div class="card-header">
              {{ t("dashboard.chart.userStatusTitle") }}
            </div>
          </template>
          <ECharts :options="userStatusChartOptions" height="100%" />
        </el-card>
      </el-col>

      <!-- 资源使用状况 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12" class="chart-col">
        <el-card shadow="hover" class="chart-card-full">
          <template #header>
            <div class="card-header-with-filter">
              <span class="font-550">
                {{ t("dashboard.chart.resourceUsageTitle") }}
              </span>
              <el-select
                v-model="selectedProject"
                :placeholder="t('dashboard.chart.selectProjectPlaceholder')"
                style="width: 180px"
                clearable
                size="small"
              >
                <el-option
                  v-for="option in projectOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
          </template>
          <div class="resource-usage-content">
            <!--            <div class="access-devices-info">-->
            <!--              <span class="access-devices-label">接入设备量：</span>-->
            <!--              <span class="access-devices-value">{{ kpiData.accessDevices }}</span>-->
            <!--            </div>-->
            <div class="access-points-chart">
              <ECharts :options="accessPointsChartOptions" height="100%" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备状况图表区域 -->
    <el-row :gutter="13" class="chart-row">
      <el-col :span="24" :xs="24" :sm="24" :md="24" class="chart-col">
        <el-card shadow="hover" class="chart-card-full">
          <template #header>
            <div class="card-header-with-filter">
              <span class="font-550">
                {{ t("dashboard.chart.deviceStatusTitle") }}
              </span>
              <el-select
                v-model="selectedDeviceFilter"
                style="width: 180px"
                clearable
                size="small"
                :placeholder="t('dashboard.chart.selectDevicePlaceholder')"
                @change="handleDeviceFilterChange"
              >
                <el-option
                  v-for="option in productOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
          </template>
          <div class="device-status-container">
            <div class="device-chart-item">
              <!--              <div class="chart-title">分配状况</div>-->
              <ECharts :options="deviceAllocationChartOptions" height="100%" />
            </div>
            <div class="device-chart-item">
              <!--              <div class="chart-title">已分配设备使用状况</div>-->
              <ECharts :options="allocatedDeviceStatusChartOptions" height="100%" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { OfficeBuilding } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import * as echarts from "echarts/core";
import { t } from "@/i18n";

import DeviceAPI from "@/gateway/device/device.gateway";
import TenantAPI from "@/gateway/system/tenant/tenant.gateway";
import UserGateway from "@/gateway/system/user.gateway";
import TypeAPI from "@/gateway/device/device-type.gateway";
import ProjectGateway, { type ProjectInfoV1 } from "@/gateway/resource/project/project.gateway";
// KPI数据
const kpiData = ref({
  tenantTotal: 156,
  tenantEnabled: 142,
  tenantDisabled: 14,
  userTotal: 3248,
  userEnabled: 856,
  userDisabled: 2389,
  accessDevices: 100,
  maxAccessDevices: 200,
  accessPoints: 9103000, // 已接入点数（910.3万）
  maxAccessPoints: 10000000, // 总接入点数（1000W = 1000万 = 10000000）
});

// 设备概览数据
const deviceOverView = reactive({
  online: 0,
  total: 0,
  activated: 0,
  disabled: 0,
  offline: 0,
  unactivated: 0,
  allocated: 0, // 已分配
  unallocated: 0, // 未分配
});

// 筛选器
const selectedProject = ref("all");
const selectedDeviceFilter = ref("all");

// 项目选项列表
const projectOptions = ref<Array<{ label: string; value: string | number }>>([
  { label: "全部", value: "all" },
]);

// 产品选项列表
const productOptions = ref<Array<{ label: string; value: string | number }>>([
  { label: "全部", value: "all" },
]);

interface DeviceTypeOption {
  id: string | number;
  deviceTypeName?: string;
  deviceTypeAlias?: string;
}

/**
 * 格式化数字，添加千分符
 */
function formatNumberWithSeparator(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return "0";
  }
  // 使用 'zh-CN' 或 'en-US' locale 都可以实现千分符，
  // 'en-US' 通常使用逗号(,)作为千分符，更常见于数字统计
  return new Intl.NumberFormat("en-US").format(value);
}

// 响应式窗口宽度
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1920);

// 响应式字体大小
const getResponsiveFontSize = () => {
  const width = windowWidth.value;
  if (width < 768) {
    // 小屏幕
    return { title: 10, value: 14 };
  } else if (width < 1200) {
    // 中等屏幕
    return { title: 12, value: 18 };
  }
  // 大屏幕
  return { title: 16, value: 24 };
};

// 用户状态分布环形图（中间显示用户总数）
const userStatusChartOptions = computed(() => {
  const enabled = kpiData.value.userEnabled;
  const disabled = kpiData.value.userDisabled;
  const total = kpiData.value.userTotal;
  const fontSize = getResponsiveFontSize();

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: "right",
      itemWidth: 12,
      itemHeight: 12,
      formatter: (name: string) => {
        if (name === t("dashboard.kpi.userEnabled")) {
          return `${t("dashboard.kpi.userEnabled")} ${formatNumberWithSeparator(enabled)}`;
        } else if (name === t("dashboard.kpi.userDisabled")) {
          return `${t("dashboard.kpi.userDisabled")} ${formatNumberWithSeparator(disabled)}`;
        }
        return name;
      },
      data: [
        { name: t("dashboard.kpi.userEnabled"), icon: "rect" },
        { name: t("dashboard.kpi.userDisabled"), icon: "rect" },
      ],
    },
    series: [
      {
        name: t("dashboard.chart.userStatusTitle"),
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        center: ["40%", "50%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          position: "outside",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            width: 1,
          },
        },
        data: [
          {
            value: enabled,
            name: t("dashboard.kpi.userEnabled"),
            itemStyle: { color: "#39D070" },
          },
          {
            value: disabled,
            name: t("dashboard.kpi.userDisabled"),
            itemStyle: { color: "#909399" },
          },
        ],
      },
      {
        // 内层显示总数
        name: t("dashboard.kpi.userTotal"),
        type: "pie",
        radius: ["0%", "40%"],
        center: ["40%", "50%"],
        tooltip: {
          formatter: () => {
            return `用户总数: ${formatNumberWithSeparator(total)}`;
          },
        },
        label: {
          show: true,
          position: "center",
          formatter: () => {
            return `{title|${t("dashboard.kpi.userTotal")}}\n\n{value|${formatNumberWithSeparator(
              total
            )}}`;
          },
          rich: {
            title: {
              fontSize: fontSize.title,
              fontWeight: "normal",
              color: "#303133",
              lineHeight: fontSize.title + 4,
            },
            value: {
              fontSize: fontSize.value,
              fontWeight: "bold",
              color: "#303133",
              lineHeight: fontSize.value,
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: [{ value: total, name: "用户总数" }],
        itemStyle: {
          color: "transparent",
        },
      },
    ],
  } as echarts.EChartsCoreOption;
});

// 接入点数状况环形图
const accessPointsChartOptions = computed(() => {
  const connected = kpiData.value.accessPoints || 0;
  const total = kpiData.value.maxAccessPoints || 10000000;
  const unconnected = Math.max(0, total - connected);
  const fontSize = getResponsiveFontSize();

  return {
    title: {
      text: `${t("dashboard.chart.accessDevicesPrefix")} 100`,
      textStyle: {
        fontSize: 15,
        fontWeight: 400,
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: "right",
      itemWidth: 12,
      itemHeight: 12,
      data: [
        { name: t("dashboard.chart.used"), icon: "rect" },
        { name: t("dashboard.chart.unused"), icon: "rect" },
      ],
    },
    series: [
      {
        name: t("dashboard.chart.resourceUsageTitle"),
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        center: ["40%", "50%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          position: "outside",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            width: 1,
          },
        },
        data: [
          {
            value: connected,
            name: t("dashboard.chart.used"),
            itemStyle: { color: "#39D070" },
          },
          {
            value: unconnected,
            name: t("dashboard.chart.unused"),
            itemStyle: { color: "#909399" },
          },
        ],
      },
      {
        // 内层显示总量
        name: t("dashboard.chart.availableResource"),
        type: "pie",
        radius: ["0%", "40%"],
        center: ["40%", "50%"],
        tooltip: {
          formatter: () => {
            // 1000W = 1000万 = 10000000
            const totalStr =
              total >= 10000000
                ? `${(total / 10000000).toFixed(0)}W`
                : formatNumberWithSeparator(total);
            return `${t("dashboard.chart.availableResource")}: ${totalStr}`;
          },
        },
        label: {
          show: true,
          position: "center",
          formatter: () => {
            // 1000W = 1000万 = 10000000
            const totalStr =
              total >= 10000000
                ? `${(total / 10000000).toFixed(0)}W`
                : formatNumberWithSeparator(total);
            return `{title|${t("dashboard.chart.availableResource")}}\n\n{value|${totalStr}}`;
          },
          rich: {
            title: {
              fontSize: fontSize.title,
              fontWeight: "normal",
              color: "#303133",
              lineHeight: fontSize.title + 4,
            },
            value: {
              fontSize: fontSize.value,
              fontWeight: "bold",
              color: "#303133",
              lineHeight: fontSize.value,
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: [{ value: total, name: "可使用资源" }],
        itemStyle: {
          color: "transparent",
        },
      },
    ],
  } as echarts.EChartsCoreOption;
});

// 设备状况饼图（已分配/未分配）
const deviceAllocationChartOptions = computed(() => {
  const allocated = deviceOverView.allocated || 0;
  const unallocated = deviceOverView.unallocated || 0;

  return {
    title: {
      text: t("dashboard.chart.allocationTitle"),
      textStyle: {
        fontSize: 15,
        fontWeight: 400,
      },
      left: "auto",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: "right",
      itemWidth: 12,
      itemHeight: 12,
      formatter: (name: string) => {
        if (name === t("dashboard.chart.allocated")) {
          return `${t("dashboard.chart.allocated")} ${formatNumberWithSeparator(allocated)}`;
        } else if (name === t("dashboard.chart.unallocated")) {
          return `${t("dashboard.chart.unallocated")} ${formatNumberWithSeparator(unallocated)}`;
        }
        return name;
      },
      data: [
        { name: t("dashboard.chart.allocated"), icon: "rect" },
        { name: t("dashboard.chart.unallocated"), icon: "rect" },
      ],
    },
    series: [
      {
        name: t("dashboard.chart.allocationTitle"),
        type: "pie",
        radius: "70%",
        center: ["40%", "50%"],
        itemStyle: {
          borderRadius: 0,
          borderColor: "#fff",
          borderWidth: 0,
        },
        label: {
          formatter: "{b}: {d}%",
        },
        data: [
          {
            value: allocated,
            name: t("dashboard.chart.allocated"),
            itemStyle: { color: "#39D070" },
          },
          {
            value: unallocated,
            name: t("dashboard.chart.unallocated"),
            itemStyle: { color: "#909399" },
          },
        ],
      },
    ],
  } as echarts.EChartsCoreOption;
});

// 已分配设备使用状况饼图（在线/离线/未投运/禁用）
const allocatedDeviceStatusChartOptions = computed(() => {
  const online = deviceOverView.online || 0;
  const offline = deviceOverView.offline || 0;
  const activated = deviceOverView.activated || 0;
  const disabled = deviceOverView.disabled || 0;

  return {
    title: {
      text: t("dashboard.chart.allocatedDeviceStatusTitle"),
      textStyle: {
        fontSize: 15,
        fontWeight: 400,
      },
      left: "auto",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: "right",
      itemWidth: 12,
      itemHeight: 12,
      formatter: (name: string) => {
        if (name === t("dashboard.kpi.online")) {
          return `${t("dashboard.kpi.online")} ${formatNumberWithSeparator(online)}`;
        } else if (name === t("dashboard.kpi.offline")) {
          return `${t("dashboard.kpi.offline")} ${formatNumberWithSeparator(offline)}`;
        } else if (name === t("dashboard.kpi.notActivated")) {
          return `${t("dashboard.kpi.notActivated")} ${formatNumberWithSeparator(activated)}`;
        } else if (name === t("dashboard.kpi.disabled")) {
          return `${t("dashboard.kpi.disabled")} ${formatNumberWithSeparator(disabled)}`;
        }
        return name;
      },
      data: [
        { name: t("dashboard.kpi.online"), icon: "rect" },
        { name: t("dashboard.kpi.offline"), icon: "rect" },
        { name: t("dashboard.kpi.notActivated"), icon: "rect" },
        { name: t("dashboard.kpi.disabled"), icon: "rect" },
      ],
    },
    series: [
      {
        name: t("dashboard.chart.allocatedDeviceStatusTitle"),
        type: "pie",
        radius: "70%",
        center: ["40%", "50%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          formatter: "{b}: {d}%",
        },
        data: [
          {
            value: online,
            name: t("dashboard.kpi.online"),
            itemStyle: { color: "#39D070" },
          },
          {
            value: offline,
            name: t("dashboard.kpi.offline"),
            itemStyle: { color: "#909399" },
          },
          {
            value: activated,
            name: t("dashboard.kpi.notActivated"),
            itemStyle: { color: "#4080ff" },
          },
          {
            value: disabled,
            name: t("dashboard.kpi.disabled"),
            itemStyle: { color: "#f56c6c" },
          },
        ],
      },
    ],
  } as echarts.EChartsCoreOption;
});

// 加载数据
const loadDashboardData = async () => {
  // 获取设备概览数据
  const overviewParams =
    selectedDeviceFilter.value === "all" || !selectedDeviceFilter.value
      ? undefined
      : { deviceTypeId: selectedDeviceFilter.value };
  const viewRes = await DeviceAPI.overview(overviewParams);
  Object.assign(deviceOverView, viewRes);

  // 计算已分配和未分配设备数量
  // 已分配 = 在线 + 离线 + 未投运 + 禁用，未分配 = 总数 - 已分配
  const allocated =
    (deviceOverView.online || 0) +
    (deviceOverView.offline || 0) +
    (deviceOverView.activated || 0) +
    (deviceOverView.disabled || 0);
  deviceOverView.allocated = allocated;
  deviceOverView.unallocated = Math.max(0, (deviceOverView.total || 0) - allocated);

  // 获取租户总数
  try {
    const tenantRes = await TenantAPI.getPageV2({
      pagination: {
        page: 1,
        pageSize: 1,
      },
    });
    kpiData.value.tenantTotal = tenantRes.pagination?.totalCount || 0;
  } catch (error) {
    console.error("获取租户总数失败:", error);
  }

  // 获取用户统计数据
  try {
    // 获取用户总数
    const userTotalRes = await UserGateway.getPage({
      page: 1,
      pageSize: 1,
    });
    kpiData.value.userTotal = userTotalRes.totalCount || 0;

    // 获取正常用户数量（status: active）
    const userEnabledRes = await UserGateway.getPage({
      page: 1,
      pageSize: 1,
      status: "active",
    });
    kpiData.value.userEnabled = userEnabledRes.totalCount || 0;

    // 获取停用用户数量（status: disabled）
    const userDisabledRes = await UserGateway.getPage({
      page: 1,
      pageSize: 1,
      status: "disabled",
    });
    kpiData.value.userDisabled = userDisabledRes.totalCount || 0;
  } catch (error) {
    console.error("获取用户统计数据失败:", error);
  }

  // 获取项目列表
  try {
    const projectRes = await ProjectGateway.getProjectList({
      page: 1,
      pageSize: 1000, // 获取所有项目
    });
    if (
      projectRes.projects &&
      Array.isArray(projectRes.projects) &&
      projectRes.projects.length > 0
    ) {
      projectOptions.value = [
        ...projectRes.projects.map((project: ProjectInfoV1) => ({
          label: project.name,
          value: project.id,
        })),
      ];
      // 默认选中第一个项目
      selectedProject.value = String(projectRes.projects[0].id);
      // 根据选中的项目获取项目版本资源
      await loadProjectVersionResource();
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }

  try {
    const productRes = await TypeAPI.list({
      page: 1,
      pageSize: 1000, // 获取所有产品
    });
    const productList = (productRes as { list?: DeviceTypeOption[] }).list;
    if (productList && Array.isArray(productList)) {
      productOptions.value = [
        { label: "全部", value: "all" },
        ...productList.map((product) => ({
          label: product.deviceTypeName || product.deviceTypeAlias || String(product.id),
          value: product.id,
        })),
      ];
    }
  } catch (error) {
    console.error("获取产品列表失败:", error);
  }
};

// 获取项目版本资源
const loadProjectVersionResource = async () => {
  if (!selectedProject.value || selectedProject.value === "all") {
    // 如果未选中项目或选中"全部"，重置相关数据
    kpiData.value.accessDevices = 0;
    kpiData.value.accessPoints = 0;
    kpiData.value.maxAccessPoints = 10000000;
    return;
  }
};

// 处理设备筛选变化
const handleDeviceFilterChange = async () => {
  try {
    // 获取设备概览数据
    const overviewParams =
      selectedDeviceFilter.value === "all" || !selectedDeviceFilter.value
        ? undefined
        : { deviceTypeId: selectedDeviceFilter.value };
    const viewRes = await DeviceAPI.overview(overviewParams);
    Object.assign(deviceOverView, viewRes);

    // 计算已分配和未分配设备数量
    // 已分配 = 在线 + 离线 + 未投运 + 禁用，未分配 = 总数 - 已分配
    const allocated =
      (deviceOverView.online || 0) +
      (deviceOverView.offline || 0) +
      (deviceOverView.activated || 0) +
      (deviceOverView.disabled || 0);
    deviceOverView.allocated = allocated;
    deviceOverView.unallocated = Math.max(0, (deviceOverView.total || 0) - allocated);
  } catch (error) {
    console.error("获取设备概览数据失败:", error);
  }
};

// 监听项目切换
watch(
  () => selectedProject.value,
  async (newValue) => {
    if (newValue) {
      await loadProjectVersionResource();
    }
  }
);

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// 监听全屏状态变化
const { isFullscreen } = useFullscreen();
watch(isFullscreen, () => {
  // 全屏状态变化时，延迟更新窗口大小和触发 resize
  // 使用 setTimeout 确保全屏切换动画完成后再更新
  setTimeout(() => {
    windowWidth.value = window.innerWidth;
    // 触发全局 resize 事件，让 ECharts 重新计算尺寸
    window.dispatchEvent(new Event("resize"));
  }, 100);
});
onBeforeMount(() => {
  loadDashboardData();
});
onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  :deep(.el-card__body) {
    height: 100%;
  }
}

.kpi-card {
  height: 100%;
  min-height: 94px;
  transition: all 0.3s;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .kpi-content {
    display: flex;
    gap: 16px;
    align-items: center;

    .kpi-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      color: white;
      border-radius: 12px;
    }

    .kpi-info {
      flex: 1;
      min-width: 0;

      .kpi-title {
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 550;
      }

      .kpi-value {
        margin-bottom: 8px;
        font-size: 28px;
        font-weight: bold;
      }

      .kpi-detail {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 14px;
        .sub-stat-item {
          color: #909399;
        }

        &.device-detail {
          align-items: center;
        }

        .detail-item {
          display: flex;
          align-items: center;

          .detail-label {
            margin-right: 4px;
            color: #909399;
          }

          .detail-value {
            font-weight: 500;

            &.enabled {
              color: #67c23a;
            }

            &.disabled {
              color: #909399;
            }

            &.online {
              color: #67c23a;
            }

            &.offline {
              color: #909399;
            }

            &.fault {
              color: #e6a23c;
            }
          }
        }
      }

      .kpi-resource {
        .resource-item {
          margin-bottom: 8px;
          font-size: 12px;

          .resource-label {
            color: #909399;
          }

          .resource-value {
            font-weight: 500;
            color: #303133;
          }
        }
      }
    }
  }
}

.card-header {
  font-size: 16px;
  font-weight: 550;
  color: #303133;
}

.card-header-with-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.resource-usage-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;

  .access-devices-info {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;

    .access-devices-label {
      color: #909399;
    }

    .access-devices-value {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .access-points-chart {
    flex: 1;
    min-height: 0;
  }
}

.device-status-container {
  display: flex;
  gap: 13px;
  height: 100%;
  min-height: 0;
  .device-chart-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 0px;
    .chart-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      text-align: center;
    }

    :deep(.echarts-container) {
      flex: 1;
      min-height: 0;
    }
  }
}

// 图表行和列样式，使图表能够自适应高度
.chart-row {
  display: flex;
  flex: 1;
  align-items: stretch;
  min-height: 0;

  .chart-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
}

// 图表卡片占满剩余空间
.chart-card-full {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;

  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 20px;
    overflow: hidden;
  }

  :deep(.el-card__header) {
    flex-shrink: 0;
  }
}

// 设备卡片样式（参考allDevice页面）
.online-value {
  color: #67c23a;
}

.offline-value {
  color: #ff9a2e;
}

.disconnect-value {
  color: #4080ff;
}

.danger-value {
  color: #f56c6c;
}
</style>
