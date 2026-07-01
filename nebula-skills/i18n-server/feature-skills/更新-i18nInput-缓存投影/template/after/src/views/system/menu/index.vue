<template>
  <div class="app-container flex flex-col menu">
    <el-card shadow="hover" class="data-table h-full">
      <PageTabShell
        v-model="activeTabId"
        class="menu-tabs"
        :class="{ 'menu-tabs--empty-fallback': isEmptyFallbackTab }"
        :tabs="displayTabs"
        :show-tab-actions="true"
        tab-label-max-width="4em"
        @tab-click="handleTabClick"
      >
        <template #toolbarTitle>
          <!-- 绿/黄 Tag：本页树与基座左侧导航是否已对齐（状态见 useMenuListRefreshState） -->
          <span class="inline-flex items-center gap-2">
            {{ $t("菜单列表") }}
            <el-tooltip
              v-if="listRefreshStatus === 'latest'"
              :content="$t('功能项、API 权限变更不影响左侧导航栏')"
            >
              <el-tag type="success" effect="plain" size="small" class="menu-list-refresh-tag">
                {{ $t("最新") }}
              </el-tag>
            </el-tooltip>
            <el-tooltip v-else :content="$t('点击同步左侧导航栏')">
              <el-tag
                type="warning"
                effect="dark"
                size="small"
                class="menu-list-refresh-tag menu-list-refresh-tag--clickable"
                :disabled="fullRefreshLoading"
                @click="syncHostSidebarOnly()"
              >
                {{ fullRefreshLoading ? $t("同步中…") : $t("待刷新") }}
              </el-tag>
            </el-tooltip>
          </span>
        </template>
        <template #toolbarFilters>
          <el-select
            v-model="selectedProjectId"
            :placeholder="$t('请选择项目')"
            filterable
            class="project-select"
            :loading="projectLoading"
            @change="handleProjectChange"
          >
            <el-option
              v-for="option in projectOptions"
              :key="option.value"
              :label="option.label"
              :value="String(option.value)"
            />
          </el-select>
          <el-input
            v-model="queryParams.keywords"
            suffix-icon="search"
            :placeholder="$t('请输入关键字搜索')"
            clearable
            :style="{ width: $localeLayout.queryField.md }"
            @keyup.enter="handleQuery"
            @clear="handleQuery"
          />
        </template>
        <template #toolbarActions>
          <el-button
            v-hasPerm="'sys:menu:query'"
            icon="search"
            type="primary"
            plain
            size="small"
            @click="() => void handleQuery()"
          >
            {{ $t("搜索") }}
          </el-button>
          <el-button
            v-hasPerm="'sys:menu:add'"
            type="primary"
            size="small"
            plain
            icon="plus"
            @click="handleOpenDialog()"
          >
            {{ $t("新增") }}
          </el-button>
          <span v-hasPerm="'sys:menu:query'" class="column-filter-wrap">
            <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
          </span>
          <span
            v-hasPerm="['sys:menu:whitelist', 'sys:menu:import', 'sys:menu:export']"
            class="dropdown-perm-wrap"
          >
            <el-dropdown size="small">
              <el-button size="small" type="primary" plain>
                {{ $t("更多操作") }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <span v-hasPerm="'sys:menu:whitelist'" class="dropdown-item-perm-wrap">
                      <el-button
                        data-testid="sys-menu-whitelist-btn"
                        style="width: 100%"
                        type="primary"
                        size="small"
                        plain
                        icon="document"
                        @click="handleOpenWhitelistDialog"
                      >
                        {{ $t("白名单") }}
                      </el-button>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <span v-hasPerm="'sys:menu:import'" class="dropdown-item-perm-wrap">
                      <el-button
                        style="width: 100%"
                        type="primary"
                        size="small"
                        plain
                        @click="handleOpenImportDialog"
                      >
                        <div class="i-svg:common-import mr-6px w-[14px] h-[14px]"></div>
                        {{ $t("导入") }}
                      </el-button>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <span v-hasPerm="'sys:menu:export'" class="dropdown-item-perm-wrap">
                      <el-button
                        style="width: 100%"
                        type="primary"
                        size="small"
                        plain
                        @click="handleExport"
                      >
                        <div class="i-svg:common-export mr-6px w-[14px] h-[14px]"></div>
                        {{ $t("导出") }}
                      </el-button>
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </template>

        <template #tabLabelExtra="{ tab }">
          <el-dropdown
            v-if="getRootMenuById(tab.key)"
            trigger="click"
            @command="(command) => handleRootMenuAction(command, getRootMenuById(tab.key)!)"
          >
            <el-button link size="small" icon="Setting" class="tab-config-btn" @click.stop />
            <template #dropdown>
              <el-dropdown-menu>
                <template v-if="checkHasPerm('sys:menu:edit')">
                  <el-dropdown-item command="edit" :icon="Edit">{{ $t("编辑") }}</el-dropdown-item>
                </template>
                <template
                  v-if="
                    checkHasPerm('sys:menu:add') &&
                    (isDirectoryMenuType(getRootMenuById(tab.key)?.type) ||
                      isMenuMenuType(getRootMenuById(tab.key)?.type))
                  "
                >
                  <el-dropdown-item command="addChild" icon="plus">
                    {{ $t("新增子项") }}
                  </el-dropdown-item>
                </template>
                <template
                  v-if="
                    checkHasPerm('sys:menu:edit') && isPageMenuType(getRootMenuById(tab.key)?.type)
                  "
                >
                  <el-dropdown-item command="permissionConfig" icon="Setting">
                    {{ $t("权限配置") }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item
                  v-if="checkHasPerm('sys:menu:delete')"
                  command="delete"
                  :icon="Delete"
                  divided
                >
                  {{ $t("删除") }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template #tabContent="{ tab, contentHeight }">
          <div
            v-if="tab.key === MENU_EMPTY_TAB_KEY"
            class="menu-empty-panel"
            :style="{ minHeight: `${resolveTableHeight(contentHeight)}px` }"
          >
            <el-skeleton v-if="loading" :rows="8" animated />
            <el-empty
              v-else-if="menuPageSource.length === 0"
              :image-size="100"
              :description="$t('当前项目暂无菜单，点击「新增」创建菜单节点')"
            >
              <el-button
                v-if="checkHasPerm('sys:menu:add')"
                type="primary"
                @click="handleOpenDialog()"
              >
                {{ $t("新增菜单") }}
              </el-button>
            </el-empty>
            <el-empty v-else :image-size="100" :description="$t('未找到匹配的菜单')" />
          </div>
          <div v-else class="table-wrapper">
            <el-table
              :key="locale"
              v-loading="loading"
              row-key="id"
              :data="getMenuChildren(tab.key)"
              default-expand-all
              :tree-props="{
                children: 'children',
                hasChildren: 'hasChildren',
              }"
              :height="resolveTableHeight(contentHeight)"
              class="data-table__content"
              stripe
              border
            >
              <template v-for="column in visibleColumns" :key="column.prop">
                <el-table-column
                  v-if="column.prop === 'menuName'"
                  :label="$t(column.label)"
                  min-width="150"
                >
                  <template #default="scope">
                    <div class="menu-name-cell">
                      <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
                        <el-icon class="menu-name-icon">
                          <component :is="scope.row.icon.replace('el-icon-', '')" />
                        </el-icon>
                      </template>
                      <template v-else-if="scope.row.icon">
                        <div :class="`i-svg:${scope.row.icon}`" class="menu-name-icon" />
                      </template>
                      <template v-else>
                        <div class="menu-name-icon" />
                      </template>
                      <span class="menu-name-text">
                        {{ scope.row.menuName }}
                      </span>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column
                  v-else-if="column.prop === 'type'"
                  :label="$t(column.label)"
                  align="center"
                  width="100"
                >
                  <template #default="scope">
                    <span
                      v-if="getMenuTypeBadgeClass(scope.row.type)"
                      class="menu-type-badge"
                      :class="getMenuTypeBadgeClass(scope.row.type)"
                    >
                      {{ getMenuTypeLabel(scope.row.type) }}
                    </span>
                  </template>
                </el-table-column>

                <el-table-column
                  v-else-if="column.prop === 'routePath'"
                  :label="$t(column.label)"
                  align="left"
                  width="auto"
                  prop="routePath"
                  min-width="150"
                />
                <el-table-column
                  v-else-if="column.prop === 'sort'"
                  :label="$t(column.label)"
                  align="center"
                  width="auto"
                  prop="sort"
                />
                <OperationColumn
                  v-else-if="column.prop === 'actions'"
                  :label="$t(column.label)"
                  fixed="right"
                  align="center"
                  :list-data-length="getMenuChildren(tab.key).length"
                  :inline-visible-count="3"
                >
                  <template #default="{ row }">
                    <OpItem
                      :label="$t('编辑')"
                      icon="edit"
                      perm="sys:menu:edit"
                      @click.stop="handleOpenDialog(undefined, row.id)"
                    />
                    <OpItem
                      v-if="isDirectoryMenuType(row.type) || isMenuMenuType(row.type)"
                      :label="$t('新增子项')"
                      icon="plus"
                      perm="sys:menu:add"
                      @click.stop="handleOpenDialog(row.id)"
                    />
                    <OpItem
                      v-if="isPageMenuType(row.type)"
                      :label="$t('权限配置')"
                      icon="Setting"
                      perm="sys:menu:edit"
                      @click.stop="handleOpenPermissionDialog(row)"
                    />
                    <OpItem
                      :label="$t('删除')"
                      icon="delete"
                      type="danger"
                      perm="sys:menu:delete"
                      @click.stop="handleDelete(row.id)"
                    />
                  </template>
                </OperationColumn>
              </template>
            </el-table>
          </div>
        </template>
      </PageTabShell>
    </el-card>

    <!-- 菜单表单对话框 -->
    <MenuFormDialog
      v-model="dialog.visible"
      :menu-options="menuPageSource"
      :edit-data="dialog.editData"
      :parent-id="dialog.parentId"
      :selected-project-id="selectedProjectId"
      @success="handleFormSuccess"
      @close="handleCloseDialog"
    />

    <!-- 子权限配置对话框 -->
    <PermissionConfigDialog
      v-model="permissionDialog.visible"
      :loading="permissionDialog.loading"
      :parent-menu-id="permissionDialog.parentMenuId"
      :parent-menu-name="permissionDialog.parentMenuName"
      :parent-is-system-only="permissionDialog.parentIsSystemOnly"
      :parent-is-visible="permissionDialog.parentIsVisible"
      :permission-data="permissionTableData"
      :menu-options="menuPageSource"
      :selected-project-id="selectedProjectId"
      @close="handleClosePermissionDialog"
    />

    <!-- 导入对话框 -->
    <MenuImportDialog
      v-model="importDialogVisible"
      :selected-project-id="selectedProjectId"
      @success="handleImportSuccess"
    />

    <!-- API 白名单 -->
    <ApiWhitelistDialog v-model="whitelistDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { trans } from "vue-i18n-kit-sy/runtime";
import { Edit, Delete } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { showNotification, handleApiError } from "@/utils/notification";
import { downloadBlob } from "@/utils/file";
import ProjectGateway from "@/gateway/resource/project/project.gateway";
import MenuGateway from "@/gateway/system/menu/menu.gateway";
import {
  getMenuTypeBadgeClass,
  getMenuTypeLabel,
  isDirectoryMenuType,
  isMenuMenuType,
  isPageMenuType,
} from "@/enums/system/menu.enum";
import MenuImportDialog from "./components/MenuImportDialog.vue";
import MenuFormDialog from "./components/MenuFormDialog.vue";
import PermissionConfigDialog from "./components/PermissionConfigDialog.vue";
import ApiWhitelistDialog from "./components/ApiWhitelistDialog.vue";
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
import ColumnFilter from "@/components/ColumnFilter/ColumnFilter.vue";
import PageTabShell, { type PageTabShellTabItem } from "@/components/PageTabShell/index.vue";
import { buildMenuProjectOptions } from "./components/menu-project-helpers";
import { checkHasPerm } from "@/directive/permission";
import type { MenuForm, MenuQuery, MenuVO } from "@/types/menu";
import { findNodeById } from "@/gateway/system/menu/menu-tree-helpers";
import { useMenuViewState } from "./composables/useMenuViewState";
import { usePermissionDialogState } from "./composables/usePermissionDialogState";
import {
  useMenuListRefreshState,
  shouldMarkListPendingOnDelete,
} from "./composables/useMenuListRefreshState";
import {
  filterMenusByKeyword,
  getMenuChildrenFromRoots,
  getRootMenuByIdFromRoots,
  removeNodeFromTree,
} from "./composables/menu-page-tree-helpers";
import type { MenuFormSuccessPayload } from "./menu.types";
import { projectMenuTreeForCache } from "@/services/menu/menu-repo";
defineOptions({
  name: "SystemMenu",
  inheritAttrs: false,
});

const { t, locale } = useI18n();

const loading = ref(false);
const projectLoading = ref(false);

/** 拉树前需校验 query 权限；工具栏按钮显隐由 v-hasPerm 控制 */
const canQuery = computed(() => checkHasPerm("sys:menu:query"));
const dialog = reactive({
  visible: false,
  editData: null as MenuForm | null,
  parentId: undefined as string | null | undefined,
});

const importDialogVisible = ref(false);
const whitelistDialogVisible = ref(false);

function handleOpenWhitelistDialog() {
  whitelistDialogVisible.value = true;
}

// 权限表格数据
const permissionTableData = ref<MenuVO[]>([]);

// 列设置状态
const STORAGE_KEY = "menu_manage_table_columns";

const buildTableColumns = () => {
  return [
    { prop: "menuName", label: trans("菜单名称"), visible: true },
    { prop: "type", label: trans("类型"), visible: true },
    { prop: "routePath", label: trans("路由路径"), visible: true },
    { prop: "sort", label: trans("排序"), visible: true },
    { prop: "actions", label: trans("操作"), required: true },
  ];
};

const tableColumns = ref(buildTableColumns());
const selectedColumns = ref<string[]>([]);

const visibleColumns = computed(() =>
  tableColumns.value.filter((c) => selectedColumns.value.includes(c.prop) || c.required)
);

const initSelectedColumns = () => {
  const savedColumns = localStorage.getItem(STORAGE_KEY);
  const validProps = new Set(tableColumns.value.map((c) => c.prop));
  if (savedColumns) {
    try {
      const parsed = JSON.parse(savedColumns) as string[];
      const filtered = parsed.filter((prop) => validProps.has(prop));
      selectedColumns.value = filtered.length > 0 ? filtered : getDefaultSelectedColumns();
      return;
    } catch {
      // 非法缓存回退默认
    }
  }
  selectedColumns.value = getDefaultSelectedColumns();
};

const getDefaultSelectedColumns = () =>
  tableColumns.value.filter((c) => !c.required && c.visible !== false).map((c) => c.prop);

watch(
  selectedColumns,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

// 查询参数
const queryParams = reactive<MenuQuery>({
  keywords: "",
});
const projectOptions = ref<SimpleOptionType[]>([]);
const selectedProjectId = ref<string>("");
// 当前激活的Tab ID
const activeTabId = ref<string>("");
// 页面级菜单树真相源（wire，用于编辑/提交）
const menuPageSource = ref<MenuVO[]>([]);
const displayMenuPageSource = computed(() =>
  projectMenuTreeForCache(menuPageSource.value, locale.value)
);
const menuTableData = computed(() =>
  filterMenusByKeyword(displayMenuPageSource.value, queryParams.keywords || "", locale.value)
);
const {
  getCachedActiveTab, // 获取当前激活的Tab
  resolveInitialProjectId, // 获取初始项目ID
  syncActiveTab, // 同步当前激活的Tab
  syncProjectAndTab, // 同步项目ID和Tab
  syncSelectedProject, // 同步项目ID
} = useMenuViewState(); // 菜单视图状态
const {
  close: closePermissionDialogState, // 关闭权限配置对话框状态
  open, // 打开权限配置对话框状态
  permissionDialog, // 权限配置对话框状态
  setLoading, // 设置权限配置对话框加载状态
} = usePermissionDialogState(); // 权限配置对话框状态
const MENU_EMPTY_TAB_KEY = "__menu_empty__";

const menuTabs = computed<PageTabShellTabItem[]>(() =>
  menuTableData.value
    .filter((menu) => Boolean(menu.id))
    .map((menu) => ({
      key: menu.id || "",
      label: menu.menuName || "",
    }))
);

const displayTabs = computed<PageTabShellTabItem[]>(() => {
  if (menuTabs.value.length > 0) return menuTabs.value;
  if (!selectedProjectId.value || !canQuery.value) return [];
  return [{ key: MENU_EMPTY_TAB_KEY, label: "" }];
});

const isEmptyFallbackTab = computed(
  () => displayTabs.value.length === 1 && displayTabs.value[0]?.key === MENU_EMPTY_TAB_KEY
);
/**
 * 基于 PageTabShell 提供的内容区高度，计算菜单表格可用高度。
 * @param contentHeight PageTabShell 传入的 tab 内容区高度
 * @returns 表格高度，最小兜底 320
 */
function resolveTableHeight(contentHeight: number): number {
  if (contentHeight <= 0) return 320;
  return Math.max(contentHeight, 320);
}

/**
 * 根据父菜单ID获取子菜单列表
 * @param parentId 父菜单ID
 */
function getMenuChildren(parentId: string | undefined): MenuVO[] {
  return getMenuChildrenFromRoots(menuTableData.value, parentId);
}

/**
 * 根据根菜单ID获取根菜单节点。
 * @param tabKey 根菜单对应的 tab key
 * @returns 根菜单节点；未命中时返回 undefined
 */
function getRootMenuById(tabKey: string): MenuVO | undefined {
  return getRootMenuByIdFromRoots(menuTableData.value, tabKey);
}

/**
 * 重置菜单视图
 */
function resetMenuView() {
  menuPageSource.value = [];
  activeTabId.value = "";
}

/**
 * 初始化项目下拉选项
 */
async function initProjectOptions(): Promise<boolean> {
  projectLoading.value = true;
  try {
    const projects = await ProjectGateway.getProjectOptions();
    projectOptions.value = buildMenuProjectOptions(projects);
    selectedProjectId.value = resolveInitialProjectId(projects);
    activeTabId.value = getCachedActiveTab(selectedProjectId.value);
    syncSelectedProject(selectedProjectId.value);

    if (!selectedProjectId.value) {
      resetMenuView();
      showNotification(t("暂无可用项目"), { type: "warning" });
      return false;
    }

    return true;
  } catch {
    resetMenuView();
    projectOptions.value = [];
    selectedProjectId.value = "";
    return false;
  } finally {
    projectLoading.value = false;
  }
}

/**
 * 拉取本页菜单树。
 * - 不展示全屏 loading（供保存/导入/删除后静默刷新，或外层已控 loading 的场景）；
 * - 不改动绿/黄 Tag（Tag 仅由 markListPending / markListLatest / 点黄 Tag 维护）。
 */
async function fetchMenuList() {
  if (!canQuery.value) {
    resetMenuView();
    return;
  }
  if (!selectedProjectId.value) {
    resetMenuView();
    return;
  }

  const currentActiveTabId = activeTabId.value || getCachedActiveTab(selectedProjectId.value);
  const projectId = selectedProjectId.value;
  const pageSourceData = await MenuGateway.getPageByProjectPage(projectId);

  menuPageSource.value = pageSourceData;
  const currentTabExists = menuTableData.value.some((menu) => menu.id === currentActiveTabId);
  if (menuTableData.value.length > 0) {
    if (currentTabExists) {
      activeTabId.value = currentActiveTabId;
    } else {
      activeTabId.value = menuTableData.value[0].id || "";
    }
    syncProjectAndTab(projectId, activeTabId.value);
  } else {
    activeTabId.value = MENU_EMPTY_TAB_KEY;
  }
}

/**
 * 用户主动查询：搜索、切项目、挂载首屏等。
 * 带全屏 loading；不修改侧栏同步 Tag。
 */
async function handleQuery() {
  loading.value = true;
  try {
    await fetchMenuList();
  } finally {
    loading.value = false;
  }
}

/** 基座导航 Tag 状态（本页树静默刷新在页面内直接调 fetchMenuList） */
const {
  fullRefreshLoading,
  listRefreshStatus,
  markListLatest,
  markListPending,
  syncHostSidebarOnly,
} = useMenuListRefreshState();

function applyLocalTreeAfterDelete(nodeId: string) {
  menuPageSource.value = removeNodeFromTree(menuPageSource.value, nodeId);
  if (menuTableData.value.length === 0) {
    activeTabId.value = MENU_EMPTY_TAB_KEY;
  }
}

/**
 * 处理项目切换
 */
async function handleProjectChange() {
  syncSelectedProject(selectedProjectId.value); // 同步项目ID
  activeTabId.value = getCachedActiveTab(selectedProjectId.value); // 获取缓存的Tab页
  await handleQuery();
}

/**
 * Tab点击事件
 */
function handleTabClick(tab: any) {
  activeTabId.value = tab.paneName;
  syncActiveTab(selectedProjectId.value, activeTabId.value); // 同步Tab页
}

/**
 * 根菜单操作（编辑/新增子项/权限配置/删除）
 * @param command 操作命令
 * @param rootMenu 根菜单数据
 */
function handleRootMenuAction(command: string, rootMenu: MenuVO) {
  if (command === "edit") {
    // 编辑根菜单
    if (rootMenu.id) {
      handleOpenDialog(undefined, rootMenu.id);
    }
  } else if (command === "addChild") {
    // 添加子菜单
    if (rootMenu.id) {
      handleOpenDialog(rootMenu.id);
    }
  } else if (command === "permissionConfig") {
    // 权限配置
    handleOpenPermissionDialog(rootMenu);
  } else if (command === "delete") {
    // 删除根菜单
    if (rootMenu.id) {
      handleDelete(rootMenu.id);
    }
  }
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父菜单ID
 * @param menuId 菜单ID
 */
function handleOpenDialog(parentId?: string | null, menuId?: string) {
  if (menuId) {
    const target = findNodeById(menuPageSource.value, menuId);
    if (target) {
      dialog.editData = {
        ...target,
        params: Array.isArray(target.params)
          ? target.params.map((item) => ({
              key: item.key,
              value: item.value,
            }))
          : [],
      } as MenuForm; // 仅克隆可变数组，避免污染原树数据
    } else {
      console.warn("在当前菜单树中未找到要编辑的节点: ", menuId);
      dialog.editData = null;
    }
  } else {
    dialog.editData = null;
    dialog.parentId = parentId == null ? null : String(parentId);
  }
  dialog.visible = true;
}

/**
 * 表单提交成功回调。
 * listAffecting：目录/菜单/页面 → 黄 Tag + 静默拉树；否则功能项 → 绿 Tag + 带 loading 查询。
 */
function handleFormSuccess(payload: MenuFormSuccessPayload) {
  if (payload.listAffecting) {
    markListPending();
    void fetchMenuList();
    return;
  }
  markListLatest();
  void handleQuery();
}

// 删除菜单
function handleDelete(menuId: string) {
  if (!menuId) {
    showNotification(t("请勾选删除项"), { type: "warning" });
    return false;
  }

  ElMessageBox.confirm(t("确认删除已选中的数据项?"), t("警告"), {
    confirmButtonText: t("确定"),
    cancelButtonText: t("取消"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(async () => {
    loading.value = true;
    const deletedNode = findNodeById(menuPageSource.value, menuId); // 找到要删除的节点
    try {
      await MenuGateway.deleteById(menuId);
      showNotification(t("删除成功"), { type: "success" });
      applyLocalTreeAfterDelete(menuId);
      if (shouldMarkListPendingOnDelete(deletedNode ?? undefined)) {
        // nav_safe 节点：黄 Tag，静默对齐本页树（loading 由外层 finally 收尾）
        markListPending();
        void fetchMenuList();
      } else {
        // 功能项：绿 Tag，仅 fetchMenuList，避免 handleQuery 与外层 loading 冲突
        markListLatest();
        void fetchMenuList();
      }
    } catch {
      return;
    } finally {
      loading.value = false;
    }
  });
}

/**
 * 关闭对话框
 */
function handleCloseDialog() {
  dialog.visible = false;
  dialog.editData = null;
  dialog.parentId = undefined;
}

/**
 * 打开子权限配置对话框
 * @param row 当前菜单行数据
 */
function handleOpenPermissionDialog(row: MenuVO) {
  if (!row.id) {
    showNotification(t("菜单ID不存在"), { type: "warning" });
    return;
  }
  open(row); // 打开权限配置对话框
  void loadPermissionData(row.id);
}

/**
 * 加载权限数据（按钮类型的子菜单）
 * @param parentId 父菜单ID
 */
async function loadPermissionData(parentId: string) {
  if (!parentId) {
    showNotification(t("父菜单ID不存在"), { type: "warning" });
    return;
  }
  setLoading(true); // 设置加载中
  try {
    permissionTableData.value = await MenuGateway.getPageFuncByList(parentId);
  } finally {
    setLoading(false); // 设置加载完毕
  }
}

/**
 * 关闭子权限配置对话框
 */
function handleClosePermissionDialog() {
  closePermissionDialogState(); // 关闭权限配置对话框状态
  permissionTableData.value = []; // 清空权限表格数据
}

/**
 * 打开导入对话框
 */
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

/** 导入成功：影响侧栏结构，黄 Tag + 静默拉取本页树 */
function handleImportSuccess() {
  markListPending();
  void fetchMenuList();
}

/**
 * 导出菜单
 */
function handleExport() {
  ElMessageBox.confirm(t("确认导出菜单数据?"), t("提示"), {
    confirmButtonText: t("确定"),
    cancelButtonText: t("取消"),
    type: "info",
    closeOnClickModal: false,
    buttonSize: "small",
  })
    .then(() => {
      loading.value = true;
      MenuGateway.exportMenuTree({
        projectId: selectedProjectId.value,
        includeApis: true,
      })
        .then((result) => {
          downloadBlob(result.content, result.fileName);
          showNotification(result.successMessage, { type: "success" });
        })
        .catch((error) => {
          console.error("导出失败:", error);
          handleApiError(error, t("导出失败"));
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {
      // showNotification("已取消导出", { type: "info" });
    });
}

onMounted(() => {
  initSelectedColumns();
  initProjectOptions().then((ready) => {
    if (ready) {
      void handleQuery();
    }
  });
});
</script>

<style lang="scss" scoped>
.menu-list-refresh-tag--clickable {
  cursor: pointer;
}

.project-select {
  width: 220px;
}

.menu-name-cell {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.menu-name-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px !important;
  height: 14px !important;
}

.menu-name-text {
  line-height: 1;
}

.menu {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100% !important;
    min-height: 0;
    overflow: hidden;
  }
}

.menu-tabs {
  flex: 1;
  min-height: 0;

  &.menu-tabs--empty-fallback :deep(.el-tabs__header) {
    display: none;
  }

  :deep(.el-tabs__content) {
    overflow: hidden;
  }

  :deep(.data-table__content) {
    margin: 0;
  }
}

.menu-empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}

/* 工具栏响应式，避免拥挤时变形 */
.table-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  :deep(.el-table__expand-icon) {
    width: 12px !important;
  }
}

.h-full {
  width: 100%;
  height: 100%;
}

// 菜单类型标签样式（与权限树组件保持一致）
.menu-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  // 目录样式（绿色）
  &.badge-directory {
    color: #fff;
    background-color: #67c23a;
  }

  // 菜单样式（蓝色）
  &.badge-menu {
    color: #fff;
    background-color: #409eff;
  }

  // 页面样式（青色）
  &.badge-page {
    color: #fff;
    background-color: #13c2c2;
  }

  // 按钮样式（黄色）
  &.badge-function {
    color: #fff;
    background-color: #e6a23c;
  }
}

.column-filter-wrap,
.dropdown-perm-wrap {
  display: inline-flex;
  align-items: center;
}

.dropdown-item-perm-wrap {
  display: block;
  width: 100%;
}
</style>
