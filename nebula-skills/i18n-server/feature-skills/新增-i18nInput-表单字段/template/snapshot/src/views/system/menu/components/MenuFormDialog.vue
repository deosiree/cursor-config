<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="40%"
    draggable
    append-to-body
    class="min-width-dialog-1"
    :close-on-click-modal="false"
  >
    <ElForm
      ref="menuFormRef"
      :model="formData"
      :rules="rules"
      :validate-on-rule-change="false"
      :label-width="$localeLayout.formLabel.md"
      class="menu-dialog-form"
    >
      <el-form-item
        v-if="formData.type != MenuTypeEnum.FUNCTION"
        :label="$t('父级菜单')"
        prop="parentId"
      >
        <!-- 业务 parentId=null 表示顶级；TreeSelect 用 ROOT_MENU_VALUE 展示；清空写 null（value-on-clear） -->
        <el-tree-select
          v-model="parentSelectValue"
          :placeholder="$t('选择上级菜单')"
          :data="parentMenuOptions"
          :props="menuTreeFieldProps"
          :value-on-clear="null"
          clearable
          filterable
          check-strictly
          :render-after-expand="false"
          @change="handleParentIdUserChange"
        />
      </el-form-item>

      <el-form-item :label="$t('名称')" prop="name">
        <el-input
          v-model="nameValue"
          :placeholder="$t('请输入名称')"
          maxlength="8"
          @blur="handleNameBlur"
        >
          <template #append>
            <I18nInput v-model:i18n-data="nameI18n" :source-value="nameValue" />
          </template>
        </el-input>
      </el-form-item>
      <!-- 节点类型 -->
      <el-form-item v-if="formData.type != MenuTypeEnum.FUNCTION" :label="$t('类型')" prop="type">
        <el-radio-group :key="locale" v-model="formData.type" :disabled="isEditMode">
          <el-radio v-for="option in menuTypeOptions" :key="option" :value="option">
            {{ getMenuTypeLabel(option) }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 权限标识 -->
      <el-form-item
        v-if="formData.type == MenuTypeEnum.FUNCTION"
        :label="$t('权限标识')"
        prop="perm"
      >
        <el-input v-model="formData.perm" :placeholder="$t('如：sys:user:add')" maxlength="50" />
      </el-form-item>

      <!-- 路由路径 -->
      <el-form-item
        v-if="formData.type == MenuTypeEnum.DIRECTORY || formData.type == MenuTypeEnum.PAGE"
        prop="routePath"
      >
        <template #label>
          <div class="flex-y-center">
            {{ $t("路由路径") }}
            <el-tooltip placement="bottom" effect="light">
              <template #content>
                {{ $t("定义应用中不同页面对应的 URL 路径。例如：安全管理目录 /system") }}
              </template>
              <el-icon class="ml-1 cursor-pointer">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
        <el-input
          v-model="formData.routePath"
          maxlength="64"
          @blur="
            () => trimFieldOnBlur(formData as Record<string, unknown>, 'routePath', menuFormRef)
          "
        />
      </el-form-item>

      <!-- 路由参数 -->
      <el-form-item v-if="formData.type == MenuTypeEnum.PAGE" prop="params">
        <template #label>
          <div class="flex-y-center">
            {{ $t("路由参数") }}
            <el-tooltip placement="bottom" effect="light">
              <template #content>
                {{ $t("组件页面使用 `useRoute().query.参数名` 获取路由参数值。") }}
              </template>
              <el-icon class="ml-1 cursor-pointer">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </template>

        <div v-if="!formData.params || formData.params.length === 0">
          <el-button type="success" size="small" plain @click="handleAddRouteParam">
            {{ $t("添加路由参数") }}
          </el-button>
        </div>

        <div v-else>
          <div v-for="(item, index) in formData.params" :key="index" class="mb-[5px]">
            <el-input
              v-model="item.key"
              :placeholder="$t('参数名')"
              style="width: 100px"
              maxlength="64"
              @blur="() => menuFormRef?.validateField('params').catch(() => undefined)"
            />

            <span class="mx-1">=</span>

            <el-input
              v-model="item.value"
              :placeholder="$t('参数值')"
              style="width: 100px"
              maxlength="64"
            />

            <el-icon
              v-if="formData.params.indexOf(item) === formData.params.length - 1"
              class="ml-2 cursor-pointer color-[var(--el-color-success)]"
              style="vertical-align: -0.15em"
              @click="handleAddRouteParam"
            >
              <CirclePlusFilled />
            </el-icon>
            <el-icon
              class="ml-2 cursor-pointer color-[var(--el-color-danger)]"
              style="vertical-align: -0.15em"
              @click="handleRemoveRouteParam(item)"
            >
              <DeleteFilled />
            </el-icon>
          </div>
        </div>
      </el-form-item>

      <!-- 显示状态 -->
      <el-form-item prop="isVisible" :label="$t('显示状态')">
        <div class="menu-form-choice">
          <el-radio-group v-model="formData.isVisible" :disabled="hideLock">
            <el-radio :value="true">{{ $t("显示") }}</el-radio>
            <el-radio :value="false">{{ $t("隐藏") }}</el-radio>
          </el-radio-group>
          <div v-if="hideLock" class="menu-form-hint">{{ $t("父节点已被隐藏") }}</div>
        </div>
      </el-form-item>

      <!-- 仅平台显示 -->
      <el-form-item prop="isSystemOnly" :label="$t('仅平台显示')">
        <div class="menu-form-choice">
          <el-radio-group v-model="formData.isSystemOnly" :disabled="sysLock">
            <el-radio :value="true">{{ $t("是") }}</el-radio>
            <el-radio :value="false">{{ $t("否") }}</el-radio>
          </el-radio-group>
          <div v-if="sysLock" class="menu-form-hint">{{ $t("父节点已设为仅系统显示") }}</div>
        </div>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item :label="$t('排序')" prop="sort">
        <el-input-number
          v-model="formData.sort"
          style="width: 100%"
          controls-position="right"
          :min="0"
        />
      </el-form-item>
      <!-- 图标选择器 -->

      <el-form-item v-if="formData.type !== MenuTypeEnum.FUNCTION" :label="$t('图标')" prop="icon">
        <icon-select v-model="formData.icon" style="width: 100%" />
      </el-form-item>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="visible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" size="small" @click="handleSubmit">{{ $t("确定") }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { ElForm } from "element-plus";
import i18n from "@/i18n";
import { showNotification } from "@/utils/notification";
import { QuestionFilled, CirclePlusFilled, DeleteFilled } from "@element-plus/icons-vue";
import {
  MenuTypeOptions,
  MenuTypeEnum,
  getMenuTypeLabel,
  isRouteLikeMenuType,
  isFunctionMenuType,
  isDirectoryMenuType,
  isMenuMenuType,
} from "@/enums/system/menu.enum";
import type { MenuForm, MenuFormDialogPropsModel, MenuVO } from "@/types/menu";
import MenuGateway from "@/gateway/system/menu/menu.gateway";
import { findNodeById } from "@/gateway/system/menu/menu-tree-helpers";

import type { MenuFormSuccessPayload } from "../menu.types";
import { shouldMarkListPending } from "../composables/useMenuListRefreshState";
import I18nInput from "@/components/I18nInput/index.vue";
import {
  resolveI18nJsonText,
  normalizeI18nDataLocaleKeys,
  normalizeI18nLocaleCode,
} from "@/utils/i18n";
import {
  createNameValidator,
  createSiblingKeyUniqueRule,
  createMenuSiblingPermUniqueRules,
  createRouteParamsRules,
  createRoutePathRules,
  NAME_MAX_LENGTH,
  normName,
  trimFieldOnBlur,
} from "@/utils/formRules";

interface I18nData {
  [key: string]: string;
}

const emit = defineEmits<{
  success: [payload: MenuFormSuccessPayload];
  close: [];
}>();

const { t, locale } = useI18n();

const props = defineProps<MenuFormDialogPropsModel>();

const visible = defineModel<boolean>("modelValue", {
  required: true,
  default: false,
});

const menuFormRef = ref<InstanceType<typeof ElForm>>();

/** ElTree 节点字段映射（勿与 defineProps 的 props 混淆） */
const menuTreeFieldProps = {
  label: "menuName",
  children: "children",
  value: "id",
};

/**
 * 顶级菜单在 TreeSelect 中的节点 id / 展示用哨兵（非 API 字段）。
 *
 * - 业务层 `formData.parentId === null` 表示顶级菜单。
 * - TreeSelect 的 `isValidValue(null)` 为 false，虚拟根节点不能使用 null 作为 id。
 * - `:value-on-clear="null"` 仅表示点清空图标时写回 null；展示仍由 parentSelectValue 映射为哨兵。
 */
const ROOT_MENU_VALUE = "__TOP_LEVEL_MENU__";

/** 父级下拉仅展示目录/菜单，与原先目录级接口的可选范围一致。 */
function toParentMenuTree(nodes: MenuVO[], currentLocale: string): MenuVO[] {
  return nodes.flatMap((node) => {
    if (!isDirectoryMenuType(node.type) && !isMenuMenuType(node.type)) return [];
    const children = Array.isArray(node.children)
      ? toParentMenuTree(node.children, currentLocale)
      : [];
    return [
      {
        ...node,
        menuName: resolveI18nJsonText(node.name, currentLocale, node.menuName || ""),
        children,
      },
    ];
  });
}

const parentMenuOptions = computed(() => {
  void i18n.global.locale.value;
  const topLevelLabel = t("顶级菜单");
  return [
    {
      id: ROOT_MENU_VALUE,
      name: topLevelLabel,
      menuName: topLevelLabel,
      children: toParentMenuTree(
        Array.isArray(props.menuOptions) ? props.menuOptions : [],
        locale.value
      ),
    },
  ];
});

const nameI18n = ref<I18nData>({});

const getCurrentLocaleKey = () => normalizeI18nLocaleCode(locale.value);

const cloneI18nData = (i18nData?: I18nData) => (i18nData ? { ...i18nData } : {});

const parseNameI18nData = (value?: unknown): I18nData => {
  if (!value) return {};

  if (typeof value === "object") {
    const parsed = Object.entries(value as Record<string, unknown>).reduce<I18nData>(
      (result, [key, item]) => {
        if (typeof item === "string") result[key] = item;
        return result;
      },
      {}
    );
    return normalizeI18nDataLocaleKeys(parsed);
  }

  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return parseNameI18nData(parsed);
  } catch {
    return value.trim() ? { [getCurrentLocaleKey()]: value.trim() } : {};
  }
};

const updateLanguageValue = (i18nData: I18nData, value: string) => {
  const parsed = cloneI18nData(i18nData);
  parsed[getCurrentLocaleKey()] = value;
  return parsed;
};

const nameValue = computed({
  get: () => String(cloneI18nData(nameI18n.value)[getCurrentLocaleKey()] || ""),
  set: (value: string) => {
    nameI18n.value = updateLanguageValue(nameI18n.value, value);
    formData.value.name = value;
  },
});

const hasNameValue = () => Object.values(nameI18n.value).some((value) => value.trim());

const stringifyNameI18nData = () => {
  const data = Object.entries(nameI18n.value).reduce<Record<string, string>>(
    (result, [key, value]) => {
      const text = value.trim();
      if (text) result[normalizeI18nLocaleCode(key)] = text;
      return result;
    },
    {}
  );

  return JSON.stringify(data);
};

const syncNameI18nFromRaw = (rawName?: unknown) => {
  nameI18n.value = parseNameI18nData(rawName);
  formData.value.name = nameValue.value;
};

const menuNameValidator = createNameValidator({
  label: i18n.global.t("菜单名"),
  maxLength: NAME_MAX_LENGTH.menuName,
});

const validateName: NonNullable<import("element-plus").FormItemRule["validator"]> = (
  rule,
  value,
  callback,
  source,
  options
) => {
  if (!hasNameValue()) {
    callback(new Error(t("菜单名不能为空")));
    return;
  }

  menuNameValidator(rule, nameValue.value, callback, source, options);
};

function handleNameBlur() {
  const trimmed = nameValue.value.trim();
  if (trimmed !== nameValue.value) {
    nameValue.value = trimmed;
  }
  void menuFormRef.value?.validateField("name").catch(() => undefined);
}

/** 业务 parentId（null=顶级）与 TreeSelect v-model（哨兵字符串）之间的桥接 */
const parentSelectValue = computed<string | null>({
  get() {
    return formData.value.parentId == null ? ROOT_MENU_VALUE : String(formData.value.parentId);
  },
  set(value) {
    formData.value.parentId = value === ROOT_MENU_VALUE || value == null ? null : String(value);
  },
});

// 初始菜单表单数据
const initialMenuFormData: MenuFormDialogModel = {
  id: undefined,
  parentId: null,
  isVisible: true,
  isSystemOnly: false,
  sort: 1,
  type: MenuTypeEnum.DIRECTORY,
  routeName: "",
  projectId: undefined,
  alwaysShow: 1,
  keepAlive: 1,
  params: [],
};

// 菜单表单数据
const formData = ref<MenuFormDialogModel>({ ...initialMenuFormData });

// 标记是否是编辑模式，用于控制是否自动计算排序值
const isEditMode = computed(() => {
  return !!(props.editData?.id || formData.value.id);
});

// 动态计算对话框标题（间隔符由 locale 通用模板 {0}{1} 控制；0/1 对应列表下标 0/1）
const dialogTitle = computed(() => {
  void i18n.global.locale.value;
  return t("{0}{1}", [
    isEditMode.value ? t("编辑") : t("新增"),
    getMenuTypeLabel(formData.value.type),
  ]);
});

const showRouteFields = computed(() => isRouteLikeMenuType(formData.value.type));

const showFunctionFields = computed(() => isFunctionMenuType(formData.value.type));

/**
 * 当前表单对应的祖先链锁定结果。
 *
 * 说明：
 * - 直接消费 gateway 的封装结果，避免业务层自己遍历菜单树。
 * - 仅依赖当前表单中的 parentId，因此在编辑时切换父级菜单后也能立即刷新灰禁态。
 */
const ancLocks = computed(() =>
  MenuGateway.getAncLocks(
    Array.isArray(props.menuOptions) ? props.menuOptions : [],
    formData.value.parentId
  )
);

/**
 * “显示状态”是否被祖先链隐藏约束锁定。
 */
const hideLock = computed(() => ancLocks.value.hideLock);

/**
 * “仅平台显示”是否被祖先链系统级约束锁定。
 */
const sysLock = computed(() => ancLocks.value.sysLock);

const menuTypeOptions = computed(() =>
  isEditMode.value && formData.value.type === MenuTypeEnum.MENU
    ? [MenuTypeEnum.MENU, ...MenuTypeOptions]
    : MenuTypeOptions
); // 兼容性写法，若当前类型是菜单（兼容），则编辑框的类型中才显示“菜单”，否则只显示 目录，页面，功能项

/**
 * 当前表单的兄弟节点：权限配置弹窗优先用 siblingItems，否则从菜单树按 parentId 推导。
 */
function getMenuSiblings(): MenuVO[] {
  if (props.siblingItems != null) {
    return props.siblingItems;
  }
  const menuTree = props.menuOptions ?? [];
  const parentId = formData.value.parentId;
  return parentId ? (findNodeById(menuTree, parentId)?.children ?? []) : menuTree;
}

/** 同级子节点数量为 n 时，默认排序号为 n + 1。 */
function calculateNextSort(): number {
  return getMenuSiblings().length + 1;
}

/** 新增模式下根据父级同步排序与祖先链锁定态 */
function applyParentContext(parentId: string | number | null | undefined) {
  if (isEditMode.value) return;
  formData.value.sort = calculateNextSort();
  const locks = MenuGateway.getAncLocks(
    Array.isArray(props.menuOptions) ? props.menuOptions : [],
    parentId
  );
  formData.value.isVisible = !locks.hideLock;
  formData.value.isSystemOnly = locks.sysLock;
}

/**
 * 处理添加路由参数
 */
function handleAddRouteParam() {
  const params = formData.value.params || [];
  params.push({ key: "", value: "" });
  formData.value.params = params;
}

/**
 * 处理移除路由参数
 * @param item
 */
function handleRemoveRouteParam(item: KVParams) {
  const params = formData.value.params || [];
  const idx = params.indexOf(item as any);
  if (idx >= 0) {
    params.splice(idx, 1);
    formData.value.params = params;
    menuFormRef.value?.clearValidate("params");
  }
}
// 避免频繁 blur 校验导致重复请求
const routePathCheckCache = ref<any>(null);

/**
 * 获取当前项目下可用的路由路径项，并在短时间内复用本地缓存。
 *
 * 用途：
 * - 为路由路径唯一性校验提供扁平化的路由路径列表。
 *
 * @returns 扁平化的路由路径列表。
 */
async function getAllRoutePathItems(projectId: string): Promise<any[]> {
  if (!projectId) return [];

  const cache = routePathCheckCache.value;
  // 1. 缓存有效则直接返回
  if (cache && Date.now() - cache.at < 5000 && cache.projectId === projectId) return cache.items;

  // 2. 数据定义：完整菜单树res，items是扁平化的路由路径列表
  const res = await MenuGateway.getRoutes({ projectId });
  const items: any[] = [];

  // 3. 递归遍历路由树
  const walk = (nodes: MenuVO[] = []) => {
    for (const node of nodes) {
      const path = node.routePath?.trim();

      // 仅收集有效路径
      if (path) {
        items.push({
          id: node.id ? String(node.id) : "",
          routePath: path,
          projectId: node.projectId ?? projectId,
        });
      }

      // 存在子节点则继续
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };

  walk(res?.result);

  // 4. 更新缓存并返回
  routePathCheckCache.value = { at: Date.now(), projectId, items };
  return items;
}

/**
 * 确保当前项目下路由路径唯一（现在是前端遍历查询路由是否重复，期望后端能提供接口）
 * @param routePathRaw
 * @param excludeId
 * @param projectId
 * @returns
 */
async function ensureRoutePathUnique(
  routePathRaw: unknown,
  excludeId?: unknown,
  projectId?: string
): Promise<void> {
  const routePath = String(routePathRaw ?? "").trim();
  if (!routePath || !projectId) return;
  const excludeIdStr = excludeId === undefined || excludeId === null ? "" : String(excludeId);

  const items = await getAllRoutePathItems(projectId);
  const exists = items.some((it) => {
    if (!it?.routePath) return false;
    if (excludeIdStr && it.id && String(it.id) === excludeIdStr) return false;
    return it.routePath === routePath && it.projectId === projectId;
  });
  if (exists) {
    throw new Error(t("当前项目下的路由路径已存在"));
  }
}

// 表单验证规则（动态计算，编辑顶级菜单时 parentId 不是必填）
const rules = computed(() => {
  void i18n.global.locale.value;
  const currentType = formData.value.type;
  const siblingOptions = {
    getSiblings: getMenuSiblings,
    getExcludeId: () => formData.value.id,
  };
  return {
    parentId: [],
    name: [
      { validator: validateName, trigger: ["blur", "change"] },
      createSiblingKeyUniqueRule({
        getSiblings: getMenuSiblings,
        getExcludeId: () => formData.value.id,
        getKey: (item) =>
          normName(
            resolveI18nJsonText(item.name, locale.value) || item.menuName || "",
            NAME_MAX_LENGTH.menuName
          ),
        getDraftKey: (value) => normName(String(value ?? ""), NAME_MAX_LENGTH.menuName),
        messageKey: t("名称不能重复"),
      }),
    ],
    type: [{ required: true, message: t("请选择类型"), trigger: "blur" }],
    routePath: showRouteFields.value
      ? [
          ...createRoutePathRules(),
          {
            validator: (_rule: unknown, value: string, callback: (err?: Error) => void) => {
              const routePath = String(value ?? "").trim();
              if (!routePath) {
                callback();
                return;
              }
              ensureRoutePathUnique(routePath, formData.value.id, props.selectedProjectId)
                .then(() => callback())
                .catch((e: unknown) =>
                  callback(new Error((e as Error)?.message || t("当前项目下的路由路径已存在")))
                );
            },
            trigger: ["blur", "change"],
          },
        ]
      : [],
    params:
      currentType === MenuTypeEnum.PAGE
        ? createRouteParamsRules({ getParams: () => formData.value.params })
        : [],
    isVisible: [{ required: true, message: t("请选择显示状态"), trigger: "change" }],
    isSystemOnly: [{ required: true, message: t("请选择是否显示给非平台租户"), trigger: "change" }],
    perm: showFunctionFields.value
      ? [
          {
            validator: (_rule: unknown, value: string, callback: (err?: Error) => void) => {
              if (!value || !String(value).trim()) {
                callback(new Error(t("请输入权限码")));
                return;
              }
              callback();
            },
            trigger: ["blur", "change"],
          },
          ...createMenuSiblingPermUniqueRules(siblingOptions),
        ]
      : [],
  };
});

async function resetForm() {
  menuFormRef.value?.clearValidate();
  formData.value = { ...initialMenuFormData, routeName: "" };
  nameI18n.value = {};
  await nextTick();
}

/** 用户手动切换父级后，仅当名称已有内容时再重验同级唯一性 */
function handleParentIdUserChange() {
  if (hasNameValue()) {
    void menuFormRef.value?.validateField("name").catch(() => undefined);
  }
}

/** 弹窗打开时回填或初始化表单（唯一打开编排入口） */
async function syncFormOnOpen() {
  if (props.editData) {
    formData.value = { ...initialMenuFormData, ...props.editData };
    syncNameI18nFromRaw(props.editData.name);
    await nextTick();
    if (!isEditMode.value) {
      applyParentContext(formData.value.parentId);
    }
    await nextTick();
    menuFormRef.value?.clearValidate();
    return;
  }

  await resetForm();
  const parentId = props.parentId !== undefined ? props.parentId : null;
  formData.value.parentId = parentId;
  applyParentContext(parentId);
  await nextTick();
  menuFormRef.value?.clearValidate();
}

watch(visible, async (isOpen) => {
  if (isOpen) {
    await syncFormOnOpen();
  } else {
    await resetForm();
    emit("close");
  }
});

watch(
  () => props.editData,
  (newData) => {
    if (!visible.value || !newData) return;
    Object.assign(formData.value, newData);
    syncNameI18nFromRaw(newData.name);
  },
  { deep: true }
);

watch(
  () => [visible.value, props.parentId, formData.value.parentId, isEditMode.value] as const,
  ([isOpen, propParentId, formParentId, editMode], prev) => {
    if (!isOpen || editMode) return;

    if (propParentId !== prev?.[1] && propParentId !== undefined) {
      formData.value.parentId = propParentId ?? null;
    }

    if (!prev || formParentId !== prev[2] || propParentId !== prev[1]) {
      applyParentContext(formData.value.parentId);
    }
  }
);

watch(
  () => props.menuOptions,
  () => {
    if (visible.value && !isEditMode.value) {
      formData.value.sort = calculateNextSort();
    }
  },
  { deep: true }
);

/**
 * 提交表单
 */
async function handleSubmit() {
  const isValid = await menuFormRef.value?.validate().catch(() => false);
  if (!isValid) return;

  const menuId = formData.value.id;
  const submitData: MenuForm = {
    ...formData.value,
    projectId: props.selectedProjectId,
    parentId: formData.value.parentId ?? null,
    name: stringifyNameI18nData(),
    routePath: String(formData.value.routePath ?? "").trim(),
    routeName: formData.value.routeName || "",
    isVisible: formData.value.isVisible !== false,
    isSystemOnly: Boolean(formData.value.isSystemOnly),
  } as MenuForm;

  if (menuId && formData.value.parentId != null && formData.value.parentId == menuId) {
    showNotification(t("父级菜单不能为当前菜单"), { type: "error" });
    return;
  }

  /** 提交成功后的统一收尾：提示、关弹窗、通知父级刷新 */
  function finishSubmitSuccess(message: string) {
    showNotification(message, { type: "success" });
    visible.value = false;
    emit("success", {
      listAffecting: shouldMarkListPending(formData.value.type),
      menuType: formData.value.type,
    });
  }

  try {
    if (menuId) {
      await MenuGateway.update({ ...submitData, id: String(menuId) });
      finishSubmitSuccess(t("修改成功"));
    } else {
      await MenuGateway.create(submitData);
      finishSubmitSuccess(t("新增成功"));
    }
  } catch {
    return;
  }
}
</script>

<style lang="scss" scoped>
.menu-form-choice {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.menu-form-hint {
  padding-left: 2px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-placeholder);
  text-align: left;
}
</style>
