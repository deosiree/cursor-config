<template>
  <div class="profile-container app-container">
    <div class="flex flex-col h-full">
      <!-- 基本信息 -->
      <el-card class="basic-info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ $t("基本信息") }}</span>
            <!--          <el-button type="primary" link @click="handleOpenDialog(DialogType.ACCOUNT)">-->
            <!--            <el-icon><Edit /></el-icon>-->
            <!--            编辑-->
            <!--          </el-button>-->
          </div>
        </template>

        <div class="basic-info-content">
          <!-- 左侧头像 -->
          <div v-if="!isMobile" class="avatar-section">
            <div class="avatar-wrapper">
              <img class="user-profile__avatar" :src="profileAvatarSrc" />
              <input ref="fileInput" type="file" style="display: none" @change="handleFileChange" />
            </div>
            <!--            <el-button type="default" @click="triggerFileUpload">更换头像</el-button>-->
          </div>

          <!-- 右侧用户信息 -->
          <div class="user-info-section">
            <el-descriptions :column="isMobile ? 1 : 2" border>
              <el-descriptions-item :label="$t('用户名')">
                {{ userProfile.userName || "XXX" }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('邮箱')">
                {{ userProfile.email || "xxx123456@sieyuan.com" }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('手机号')">
                {{ userProfile.phone || "+86 1234567890" }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('角色')">
                {{ userProfile.roleName || $t("管理员") }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('所属租户')">
                {{ userProfile.tenantName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('状态')">
                <el-tag :type="currentUserStatusMeta.type" size="small">
                  {{ currentUserStatusMeta.label }}
                </el-tag>
                <span v-if="currentUserStatusDesc" class="ml-8px text-[12px] text-[#909399]">
                  {{ currentUserStatusDesc }}
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- 安全设置 -->
      <el-card class="security-card data-table h-full" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ $t("安全设置") }}</span>
          </div>
        </template>

        <div class="security-content">
          <!-- 登录密码 -->
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">{{ $t("登录密码") }}</div>
              <div class="security-desc security-desc--password">
                {{ $t("定期更换密码可以保护账户安全") }}
              </div>
            </div>
            <el-button
              type="primary"
              plain
              class="security-btn"
              @click="() => handleOpenDialog(DialogType.PASSWORD)"
            >
              {{ $t("修改密码") }}
            </el-button>
          </div>

          <!-- 手机号绑定 -->
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">{{ $t("手机号绑定") }}</div>
              <div class="security-desc">
                <span class="desc-prefix">
                  {{ userProfile.phone ? $t("已绑定手机号: ") : $t("未绑定手机号") }}
                </span>
                <span class="desc-value">{{ userProfile.phone || "" }}</span>
              </div>
            </div>
            <el-button
              type="primary"
              plain
              class="security-btn"
              @click="() => handleOpenDialog(DialogType.MOBILE)"
            >
              {{ userProfile.mobile ? $t("更换手机") : $t("绑定手机") }}
            </el-button>
          </div>

          <!-- 邮箱绑定 -->
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">{{ $t("邮箱绑定") }}</div>
              <div class="security-desc">
                <span class="desc-prefix">
                  {{ userProfile.email ? $t("已绑定邮箱: ") : $t("未绑定邮箱") }}
                </span>
                <span class="desc-value">{{ userProfile.email || "" }}</span>
              </div>
            </div>
            <el-button
              type="primary"
              plain
              class="security-btn"
              @click="() => handleOpenDialog(DialogType.EMAIL)"
            >
              {{ userProfile.email ? $t("更换邮箱") : $t("绑定邮箱") }}
            </el-button>
          </div>

          <!-- 双因素认证 -->
          <!--          <div class="security-item">-->
          <!--            <div class="security-info">-->
          <!--              <div class="security-title">双因素认证</div>-->
          <!--              <div class="security-desc">启用双因素认证提高账户安全性</div>-->
          <!--            </div>-->
          <!--            <el-switch v-model="twoFactorEnabled" />-->
          <!--          </div>-->
        </div>
      </el-card>
    </div>
    <!-- 弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      :width="500"
      draggable
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <!-- 账号资料 -->
      <el-form
        v-if="dialog.type === DialogType.ACCOUNT"
        ref="userProfileFormRef"
        :model="userProfileForm"
        :rules="userProfileRules"
        label-width="auto"
        @submit.prevent
      >
        <el-form-item :label="$t('邮箱')" prop="email">
          <el-input
            v-model="userProfileForm.email"
            :placeholder="$t('请输入邮箱')"
            maxlength="64"
          />
        </el-form-item>
        <el-form-item :label="$t('手机号')" prop="mobile">
          <el-input
            v-model="userProfileForm.mobile"
            :placeholder="$t('请输入手机号')"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item :label="$t('角色')" prop="roleIds">
          <el-select
            v-model="userProfileForm.roleIds"
            multiple
            :placeholder="$t('请选择角色')"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 修改密码 -->
      <el-form
        v-if="dialog.type === DialogType.PASSWORD"
        ref="passwordChangeFormRef"
        :model="passwordChangeForm"
        :rules="passwordChangeRules"
        :validate-on-rule-change="false"
        label-width="auto"
        @submit.prevent
      >
        <el-form-item :label="$t('原密码')" prop="oldPassword">
          <el-input
            v-model="passwordChangeForm.oldPassword"
            type="password"
            show-password
            maxlength="64"
          />
        </el-form-item>
        <el-form-item prop="newPassword">
          <template #label>
            <div class="inline-flex items-center gap-1">
              <span>{{ $t("新密码") }}</span>
              <PwdPolicyTip :policy="pwdPlcy" />
            </div>
          </template>
          <el-input
            v-model="passwordChangeForm.newPassword"
            type="password"
            show-password
            maxlength="64"
          />
        </el-form-item>
        <el-form-item :label="$t('确认密码')" prop="confirmPassword">
          <el-input
            v-model="passwordChangeForm.confirmPassword"
            type="password"
            show-password
            maxlength="64"
          />
        </el-form-item>
      </el-form>

      <!-- 绑定手机 -->
      <el-form
        v-else-if="dialog.type === DialogType.MOBILE"
        ref="mobileBindingFormRef"
        :model="mobileUpdateForm"
        :rules="mobileBindingRules"
        label-width="auto"
        @submit.prevent
      >
        <el-form-item :label="$t('手机号')" prop="mobile">
          <el-input v-model="mobileUpdateForm.mobile" maxlength="11" />
        </el-form-item>
      </el-form>

      <!-- 绑定邮箱 -->
      <el-form
        v-else-if="dialog.type === DialogType.EMAIL"
        ref="emailBindingFormRef"
        :model="emailUpdateForm"
        :rules="emailBindingRules"
        label-width="auto"
        @submit.prevent
      >
        <el-form-item :label="$t('邮箱')" prop="email">
          <el-input v-model="emailUpdateForm.email" maxlength="64" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="handleCancel">{{ $t("取消") }}</el-button>
          <el-button type="primary" size="small" @click="handleSubmit">{{ $t("确定") }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { showNotification } from "@/utils/notification";
import type { FormInstance, FormRules } from "element-plus";
import router from "@/router";
import { useUserStoreHook } from "@/store/modules/user.store";

import UserGateway from "@/gateway/system/user.gateway";
import ConfigGateway from "@/gateway/system/config.gateway";
import PwdPolicyTip from "@/components/form/PwdPolicyTip.vue";
import { pwdPair, type PwdCtx } from "@/utils/formRules";
import type {
  UserProfileVO,
  PasswordChangeForm,
  MobileUpdateForm,
  EmailUpdateForm,
  UserProfileForm,
  UserInfo,
} from "@/types/user";

import FileAPI from "@/gateway/file.gateway";
const userIcon = new URL("../../assets/icons/user.png", import.meta.url).href;
import { resolvePasswordMapByLoginSetting } from "@/gateway/auth/password-transit.gateway";
import { Storage } from "@/utils/storage";
import { LOGIN_PATH } from "@/constants/navigation-paths";
import { USER_STATUS_CONFIG } from "@/views/system/user/user-status";
// 类型定义
interface RoleOption {
  id: number;
  name: string;
}

const { t } = useI18n();

const userProfile = ref<UserProfileVO>({});
// const twoFactorEnabled = ref<boolean>(true);
const roleOptions = ref<RoleOption[]>([]);

// 响应式的设备类型检测
const deviceType = ref<string>(localStorage.getItem("device") || "");
const windowWidth = ref<number>(window.innerWidth);

// 监听localStorage变化和窗口大小变化
const handleStorageChange = () => {
  deviceType.value = localStorage.getItem("device") || "";
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
// const userStore = useUserStoreHook();
const enum DialogType {
  ACCOUNT = "account",
  PASSWORD = "password",
  MOBILE = "mobile",
  EMAIL = "email",
}

const dialog = reactive({
  visible: false,
  title: "",
  type: "" as DialogType,
});

const userProfileFormRef = ref<FormInstance>();
const passwordChangeFormRef = ref<FormInstance>();
const mobileBindingFormRef = ref<FormInstance>();
const emailBindingFormRef = ref<FormInstance>();

const userProfileForm = reactive<UserProfileForm>({
  gender: 1,
  email: "",
  mobile: "",
  roleIds: [],
});

const passwordChangeForm = reactive<PasswordChangeForm>({});
const pwdPlcy = ref<Awaited<ReturnType<typeof ConfigGateway.getPwdPolicy>>>();

const pwdCtx: PwdCtx = {
  getPassword: () => passwordChangeForm.newPassword ?? "",
  getConfirmPassword: () => passwordChangeForm.confirmPassword ?? "",
  getFormRef: () => passwordChangeFormRef.value,
};
const mobileUpdateForm = reactive<MobileUpdateForm>({});
const emailUpdateForm = reactive<EmailUpdateForm>({});

const mobileTimer = ref<NodeJS.Timeout>();

const emailTimer = ref<NodeJS.Timeout>();

const currentUserStatusMeta = computed(() => {
  const status = userProfile.value.status ?? "unspecified";
  const meta = USER_STATUS_CONFIG[status];
  return { ...meta, label: t(meta.label) };
});

const profileAvatarSrc = computed(() => {
  const avatar = userProfile.value.avatar?.trim();
  return avatar || userIcon;
});

// 判断是否是移动端 - 实时检测
const isMobile = computed(() => {
  return deviceType.value === "mobile" || windowWidth.value <= 768;
});

const currentUserStatusDesc = computed(() => {
  switch (userProfile.value.status) {
    case "activation":
      return t("账号待激活，请查收激活邮件或联系管理员");
    case "locked":
      return t("账号已锁定，请联系管理员解锁");
    case "disabled":
      return t("账号已停用，请联系管理员");
    default:
      return "";
  }
});

function getCurrentUserId(): string | undefined {
  const userInfo = Storage.sessionGet<UserInfo>("userInfo");
  return userInfo?.id;
}

// 基本信息表单验证规则
const userProfileRules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t("请输入邮箱"), trigger: "blur" },
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t("请输入正确的邮箱"),
      trigger: "blur",
    },
  ],
  mobile: [
    { required: true, message: t("请输入手机号"), trigger: "blur" },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t("请输入正确的手机号"),
      trigger: "blur",
    },
  ],
  roleIds: [{ required: true, message: t("请选择角色"), trigger: "change" }],
}));

// 修改密码校验规则（新/确认密码走 pwdPair + 租户策略）
const passwordChangeRules = computed<FormRules>(() => {
  const { password, confirmPassword } = pwdPair(pwdCtx, { policy: pwdPlcy.value });
  return {
    oldPassword: [{ required: true, message: t("请输入原密码"), trigger: ["blur", "change"] }],
    newPassword: password,
    confirmPassword,
  };
});

// 手机号校验规则
const mobileBindingRules = computed<FormRules>(() => ({
  mobile: [
    { required: true, message: t("请输入手机号"), trigger: "blur" },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t("请输入正确的手机号"),
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: t("请输入验证码"), trigger: "blur" }],
}));

// 邮箱校验规则
const emailBindingRules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t("请输入邮箱"), trigger: "blur" },
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t("请输入正确的邮箱"),
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: t("请输入验证码"), trigger: "blur" }],
}));

/**
 * 打开弹窗
 */
const handleOpenDialog = (type: DialogType) => {
  dialog.type = type;
  dialog.visible = true;
  switch (type) {
    case DialogType.ACCOUNT:
      dialog.title = t("编辑基本信息");
      // 回填表单数据
      userProfileForm.id = userProfile.value.id;
      userProfileForm.gender = userProfile.value.gender || 1;
      userProfileForm.email = userProfile.value.email || "";
      userProfileForm.mobile = userProfile.value.mobile || "";
      userProfileForm.roleIds = userProfile.value.roleIds || [];
      break;
    case DialogType.PASSWORD:
      dialog.title = t("修改密码");
      Object.assign(passwordChangeForm, {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      void ConfigGateway.getPwdPolicy().then((policy) => {
        pwdPlcy.value = policy;
      });
      nextTick(() => passwordChangeFormRef.value?.clearValidate());
      break;
    case DialogType.MOBILE:
      dialog.title = userProfile.value.mobile ? t("更换手机") : t("绑定手机");
      break;
    case DialogType.EMAIL:
      dialog.title = userProfile.value.email ? t("更换邮箱") : t("绑定邮箱");
      break;
  }
};
/**
 * 提交表单
 */
const handleSubmit = async () => {
  const userId = getCurrentUserId();

  if (!userId) {
    showNotification(t("用户信息过期，请重新登录"), {
      type: "error",
      title: t("提示"),
    });
    // 重置用户状态
    await useUserStoreHook().resetAllState();
    // 跳转到登录页，保留当前路由用于登录后跳转
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}`);
    return;
  }

  if (dialog.type === DialogType.ACCOUNT) {
    const valid = await userProfileFormRef.value?.validate().catch(() => false);
    if (!valid) return;
    try {
      await UserGateway.updateProfile(userProfileForm);
      showNotification(t("基本信息修改成功"), { type: "success" });
      dialog.visible = false;
      await loadUserProfile();
    } catch (error) {
      console.error("基本信息修改失败:", error);
    }
  } else if (dialog.type === DialogType.PASSWORD) {
    await passwordChangeFormRef.value?.validate();
    if (passwordChangeForm.newPassword && passwordChangeForm.oldPassword) {
      // 改密属于敏感操作：是否需要“传输加密”必须按服务端 loginSetting 决策，避免前端硬编码策略
      const passwordResult = await resolvePasswordMapByLoginSetting({
        newPassword: passwordChangeForm.newPassword,
        oldPassword: passwordChangeForm.oldPassword,
      });
      if (!passwordResult.ok) {
        // 直接提示网关层错误码（可与后端/网关日志对齐定位：缺公钥/加密失败/拉取配置失败）
        showNotification(passwordResult.code, { type: "error" });
        return;
      }
      const data = {
        id: userId,
        newPassword: passwordResult.passwords.newPassword,
        oldPassword: passwordResult.passwords.oldPassword,
      };
      try {
        await UserGateway.changePassword(data);
        showNotification(t("密码修改成功"), { type: "success" });
        dialog.visible = false;
      } catch (error) {
        console.error("密码修改失败:", error);
      }
    }
  } else if (dialog.type === DialogType.MOBILE) {
    const valid = await mobileBindingFormRef.value?.validate().catch(() => false);
    if (!valid) return;
    try {
      await UserGateway.bindOrChangeMobile({
        phone: mobileUpdateForm.mobile?.trim(),
        id: userId,
      });
      showNotification(t("手机号更新成功"), { type: "success" });
      dialog.visible = false;
      await loadUserProfile();
    } catch (error) {
      console.error("手机号更新失败:", error);
    }
  } else if (dialog.type === DialogType.EMAIL) {
    const valid = await emailBindingFormRef.value?.validate().catch(() => false);
    if (!valid) return;
    try {
      await UserGateway.bindOrChangeEmail({
        email: emailUpdateForm.email?.trim(),
        id: userId,
      });
      showNotification(t("邮箱更新成功"), { type: "success" });
      dialog.visible = false;
      await loadUserProfile();
    } catch (error) {
      console.error("邮箱更新失败:", error);
    }
  }
};

/**
 * 清空表单数据
 */
const resetFormData = () => {
  if (dialog.type === DialogType.ACCOUNT) {
    userProfileFormRef.value?.resetFields();
    userProfileFormRef.value?.clearValidate();
    // 重置表单数据
    Object.assign(userProfileForm, {
      gender: 1,
      email: "",
      mobile: "",
      roleIds: [],
      status: 1,
    });
  } else if (dialog.type === DialogType.PASSWORD) {
    passwordChangeFormRef.value?.resetFields();
    passwordChangeFormRef.value?.clearValidate();
    pwdPlcy.value = undefined;
    Object.assign(passwordChangeForm, {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } else if (dialog.type === DialogType.MOBILE) {
    mobileBindingFormRef.value?.resetFields();
    mobileBindingFormRef.value?.clearValidate();
    Object.assign(mobileUpdateForm, {
      mobile: "",
      code: "",
    });
  } else if (dialog.type === DialogType.EMAIL) {
    emailBindingFormRef.value?.resetFields();
    emailBindingFormRef.value?.clearValidate();
    Object.assign(emailUpdateForm, {
      email: "",
      code: "",
    });
  }
};

/**
 * 对话框关闭事件
 */
const handleDialogClose = () => {
  resetFormData();
};

/**
 * 取消
 */
const handleCancel = () => {
  dialog.visible = false;
  resetFormData();
};

const fileInput = ref<HTMLInputElement | null>(null);

// const triggerFileUpload = () => {
//   fileInput.value?.click();
// };

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    try {
      const data = await FileAPI.uploadFile(file);
      userProfile.value.avatar = data.url;
      await UserGateway.updateProfile({
        avatar: data.url,
      });
      showNotification(t("头像更新成功"), { type: "success" });
    } catch (error) {
      console.error("头像上传失败：" + error);
      target.value = "";
    }
  }
};

/** 加载角色选项 */
// const loadRoleOptions = async () => {
//   try {
//     // const response = await RoleAPI.getRoleList();
//     // roleOptions.value = response.data;
//   } catch (error) {
//     console.error("加载角色选项失败:", error);
//   }
// };

/** 加载用户信息 */
const loadUserProfile = async () => {
  const userId = getCurrentUserId();
  if (userId) {
    const res = await UserGateway.getProfile({ id: userId });
    userProfile.value = res;
  }
};

onMounted(async () => {
  // 监听localStorage变化和窗口大小变化
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("resize", handleResize);

  // 定期检查localStorage变化（备用方案）
  const checkInterval = setInterval(() => {
    const currentDevice = localStorage.getItem("device") || "";
    if (currentDevice !== deviceType.value) {
      deviceType.value = currentDevice;
    }
  }, 1000); // 每秒检查一次

  // 保存定时器引用以便清理
  (window as any).__deviceCheckInterval = checkInterval;

  if (mobileTimer.value) {
    clearInterval(mobileTimer.value);
  }
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
  }
  await loadUserProfile();
  // await loadRoleOptions();
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("resize", handleResize);

  // 清理定时器
  if ((window as any).__deviceCheckInterval) {
    clearInterval((window as any).__deviceCheckInterval);
    delete (window as any).__deviceCheckInterval;
  }
});
</script>

<style lang="scss" scoped>
.profile-container {
  :deep(.el-card .el-card__body) {
    padding: v-bind('isMobile ? "10px" : "20px"');
  }
  :deep(.el-card__header) {
    padding: v-bind('isMobile ? "10px" : "20px"');
  }
}
.basic-info-card {
  margin-bottom: 13px;
}
.basic-info-card,
.security-card {
  border-radius: 8px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

// 移动端时让卡片占据剩余空间
@media (max-width: 768px) {
  .basic-info-card,
  .security-card {
    flex: 1;
  }
}

.basic-info-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  min-width: 150px;

  .avatar-wrapper {
    position: relative;
    .user-profile__avatar {
      width: 128px;
    }
  }

  .el-button {
    width: 120px;
  }
}

/* 基本信息 - 描述列表样式 */
.user-info-section {
  flex: 1;
  margin: auto;
  :deep(.el-descriptions) {
    .el-descriptions__label {
      width: 120px;
      font-weight: 600;
      color: var(--el-text-color-regular);
      background-color: var(--profile-item);
    }

    .el-descriptions__content {
      color: var(--el-text-color-primary);
    }
  }
}

.security-content {
  .security-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: var(--profile-item);

    &:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .security-info {
      flex: 1;

      .security-title {
        margin-bottom: 4px;
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .security-desc {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        word-break: break-all;

        .desc-prefix {
          display: inline;
        }

        .desc-value {
          display: inline;
        }
      }
    }

    .security-btn {
      flex-shrink: 0;
      margin-left: 16px;
    }

    .el-button {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
}

.el-dialog {
  .el-dialog__header {
    padding: 20px;
    margin: 0;
  }

  .el-dialog__body {
    padding: 30px 20px;
  }

  .el-dialog__footer {
    padding: 0 20px 20px 0;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .basic-info-content {
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }

  .avatar-section {
    width: 100%;
    min-width: auto;
  }

  .user-info-section {
    width: 100%;

    :deep(.el-descriptions) {
      .el-descriptions__label {
        width: 80px;
        font-size: 14px;
      }

      .el-descriptions__content {
        font-size: 14px;
      }
    }
  }

  .security-content {
    .security-item {
      flex-direction: column;
      align-items: stretch;
      padding: 8px 0;
      .security-info {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;

        .security-title {
          flex-shrink: 0;
          min-width: 80px;
          margin-bottom: 8px;
          font-size: 15px;
        }

        .security-desc {
          flex: 1;
          font-size: 13px;
          line-height: 1.5;
          text-align: right;

          .desc-prefix {
            display: none;
          }

          .desc-value {
            display: inline;
          }

          &.security-desc--password {
            display: none;
          }
        }
      }

      .security-btn {
        width: 100%;
        margin-left: 0;
      }
    }
  }

  // 弹窗适配
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;

    .el-dialog__header {
      padding: 16px;
    }

    .el-dialog__body {
      padding: 20px 16px;
    }

    .el-dialog__footer {
      padding: 0 16px 16px 0;
    }

    .el-form-item__label {
      font-size: 14px;
    }
  }
}
</style>
