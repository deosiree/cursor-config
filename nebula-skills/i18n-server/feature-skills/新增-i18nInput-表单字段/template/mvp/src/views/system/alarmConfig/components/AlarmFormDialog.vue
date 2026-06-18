<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    draggable
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="$localeLayout.formLabel.xl"
      :validate-on-rule-change="false"
    >
      <el-form-item v-if="showTypeOption" :label="$t('类型')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio value="group">{{ $t("告警组") }}</el-radio>
          <el-radio value="item">{{ $t("告警项") }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="formData.type === 'group'">
        <el-form-item :label="$t('告警组名称')" prop="name">
          <el-input v-model="nameValue" :placeholder="$t('请输入告警组名称')" maxlength="64">
            <template #append>
              <I18nInput v-model:i18n-data="formData.name" :source-value="nameValue" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('告警组编码')" prop="code">
          <el-input
            v-model="formData.code"
            :placeholder="$t('请输入告警组编码')"
            :disabled="mode === 'edit'"
            maxlength="64"
          />
        </el-form-item>
        <el-form-item :label="$t('告警组描述')">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            maxlength="256"
            :placeholder="$t('请输入告警组描述')"
          />
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item :label="$t('告警组名称')" prop="groupId">
          <el-select
            v-model="formData.groupId"
            :placeholder="$t('请选择告警组名称')"
            class="w-full"
            :disabled="mode === 'edit' || isAddingSubItem"
            @change="handleGroupChange"
          >
            <el-option
              v-for="g in alarmGroups"
              :key="g.id"
              :label="getLocalizedName(g.groupName, g.groupNameI18n)"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('告警组编码')">
          <el-input
            v-model="formData.groupCode"
            disabled
            :placeholder="$t('选择告警组后自动填充')"
          />
        </el-form-item>
        <el-form-item :label="$t('告警项名称')" prop="name">
          <el-input v-model="nameValue" :placeholder="$t('请输入告警项名称')" maxlength="64">
            <template #append>
              <I18nInput v-model:i18n-data="formData.name" :source-value="nameValue" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('告警项编码')" prop="code">
          <el-input
            v-model="formData.code"
            :placeholder="$t('请输入告警项编码')"
            :disabled="mode === 'edit'"
            maxlength="64"
          />
        </el-form-item>
        <el-form-item :label="$t('告警等级')" prop="level">
          <el-radio-group v-model="formData.level">
            <el-radio v-for="l in alarmLevels" :key="l.id" :value="l.id">
              {{ getAlarmLevelLabel(l) }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('告警项描述')">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            maxlength="256"
            :placeholder="$t('请输入告警项描述')"
          />
        </el-form-item>
        <el-form-item :label="$t('告警模板')">
          <el-input
            v-model="formData.template"
            type="textarea"
            :rows="3"
            maxlength="256"
            :placeholder="$t('告警模板示例', ['{0}', '{1}', '{2}'])"
          />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button size="small" @click="visible = false">{{ $t("取消") }}</el-button>
      <el-button type="primary" :loading="submitting" size="small" @click="handleSubmit">
        {{ $t("确定") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { type FormInstance } from "element-plus";
import AlarmAPI from "@/gateway/system/alarm.gateway";
import { showNotification, handleApiError } from "@/utils/notification";
import type {
  AlarmGroupCreatePayload,
  AlarmGroupUpdatePayload,
  AlarmItemCreatePayload,
  AlarmItemUpdatePayload,
} from "./type";
import { useI18n } from "vue-i18n";
import type { AlarmLevelOption } from "@/composables/useAlarmDict";
import { resolveAlarmI18nText } from "@/composables/useAlarmDict";
import I18nInput from "@/components/I18nInput/index.vue";
import { normalizeI18nDataLocaleKeys, normalizeI18nLocaleCode } from "@/utils/i18n";
const { t, locale } = useI18n();

interface I18nData {
  [key: string]: string;
}

const props = defineProps<{
  alarmLevels: AlarmLevelOption[];
  alarmGroups: any[];
  projectId: string;
}>();

const emit = defineEmits(["refresh"]);

const visible = ref(false);
const submitting = ref(false);
const mode = ref<"add" | "edit">("add");
const showTypeOption = ref(true); // 是否显示类型切换
const isAddingSubItem = ref(false); // 是否为行内快捷新增子项
const formRef = ref<FormInstance>();

const formData = reactive({
  type: "group" as "group" | "item",
  id: undefined as any,
  name: {} as I18nData,
  code: "",
  description: "",
  groupId: undefined as any,
  groupCode: "",
  level: "",
  template: "",
});

const dialogTitle = computed(() => {
  if (mode.value === "edit") return t("编辑配置");
  return formData.type === "group" ? t("新建告警组") : t("新建告警项");
});

const rules = computed(() => {
  const prefix = formData.type === "group" ? t("告警组") : t("告警项");
  return {
    name: [{ validator: validateName, trigger: "blur" }],
    code: [{ required: true, message: prefix + t("编码不能为空"), trigger: "blur" }],
    groupId: [{ required: true, message: t("请选择告警组名称"), trigger: "change" }],
    level: [{ required: true, message: t("请选择告警等级"), trigger: "change" }],
  };
});

const getAlarmLevelLabel = (level: AlarmLevelOption) =>
  resolveAlarmI18nText(level.levelName, locale.value, level.levelNameI18n) || String(level.id);

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
  get: () => String(cloneI18nData(formData.name)[getCurrentLocaleKey()] || ""),
  set: (value: string) => {
    formData.name = updateLanguageValue(formData.name, value);
  },
});

const hasNameValue = () => Object.values(formData.name).some((value) => value.trim());

const validateName = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
  const prefix = formData.type === "group" ? t("告警组") : t("告警项");
  callback(hasNameValue() ? undefined : new Error(prefix + t("名称不能为空")));
};

const stringifyNameI18nData = () => {
  const data = Object.entries(formData.name).reduce<Record<string, string>>(
    (result, [key, value]) => {
      const text = value.trim();
      if (text) result[normalizeI18nLocaleCode(key)] = text;
      return result;
    },
    {}
  );

  return JSON.stringify(data);
};

const getLocalizedName = (value: unknown, fallbackText?: unknown) =>
  resolveAlarmI18nText(value, locale.value, fallbackText);

// 提交逻辑
const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  const isGroup = formData.type === "group";
  const isEdit = mode.value === "edit";
  const namePayload = stringifyNameI18nData();
  const defaultErrorMsg = isGroup
    ? t(isEdit ? "修改告警组失败" : "新增告警组失败")
    : t(isEdit ? "修改告警项失败" : "新增告警项失败");
  try {
    if (isGroup) {
      if (isEdit) {
        const payload: AlarmGroupUpdatePayload = {
          id: formData.id,
          groupName: namePayload,
          description: formData.description,
          enable: true,
        };
        await AlarmAPI.updateGroup(payload);
      } else {
        const payload: AlarmGroupCreatePayload = {
          groupCode: formData.code,
          groupName: namePayload,
          description: formData.description,
          projectId: props.projectId,
        };
        await AlarmAPI.createGroup(payload);
      }
      showNotification(t(isEdit ? "修改告警组成功" : "新增告警组成功"), {
        type: "success",
      });
    } else {
      if (isEdit) {
        const payload: AlarmItemUpdatePayload = {
          id: formData.id,
          alarmName: namePayload,
          description: formData.description,
          level: Number(formData.level),
          enable: true,
          template: formData.template,
        };
        await AlarmAPI.updateItem(payload);
      } else {
        const payload: AlarmItemCreatePayload = {
          groupId: formData.groupId,
          alarmCode: formData.code,
          alarmName: namePayload,
          description: formData.description,
          level: Number(formData.level),
          enable: true,
          template: formData.template,
        };
        await AlarmAPI.createItem(payload);
      }
      showNotification(t(isEdit ? "修改告警项成功" : "新增告警项成功"), {
        type: "success",
      });
    }
    visible.value = false;
    emit("refresh");
  } catch (err) {
    handleApiError(err, defaultErrorMsg);
  } finally {
    submitting.value = false;
  }
};

// 重置并清理
const handleClosed = () => {
  formRef.value?.resetFields();
  Object.assign(formData, {
    type: "group",
    id: undefined,
    name: {},
    code: "",
    description: "",
    groupId: undefined,
    groupCode: "",
    level: "",
    template: "",
  });
  showTypeOption.value = true;
  isAddingSubItem.value = false;
};

// 暴露给父组件的 Open 方法
const open = (type: "add" | "edit", row?: any, context?: "toolbar" | "table") => {
  mode.value = type;
  if (type === "add") {
    if (context === "table") {
      // 从表格行内“添加告警项”打开
      formData.type = "item";
      showTypeOption.value = false;
      isAddingSubItem.value = true;
      if (row) {
        formData.groupId = row.rawId;
        handleGroupChange(row.rawId);
      }
    } else {
      // 从顶部新增打开
      formData.type = "group";
      showTypeOption.value = true;
    }
  } else if (row) {
    // 编辑逻辑
    showTypeOption.value = false;
    formData.type = row.isGroup ? "group" : "item";
    formData.id = row.rawId;
    formData.name = parseNameI18nData(row.rawName ?? row.name);
    formData.code = row.code;
    formData.description = row.description;
    formData.level = row.level;
    formData.template = row.template || "";
    if (!row.isGroup) {
      formData.groupId = row.groupId;
      handleGroupChange(row.groupId);
    }
  }
  visible.value = true;
};

const handleGroupChange = (val: number) => {
  const group = props.alarmGroups.find((g) => g.id === val);
  formData.groupCode = group ? group.groupCode : "";
};

defineExpose({ open });
</script>
