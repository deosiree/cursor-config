<template>
  <div class="forgot-step-panel">
    <div class="forgot-step-panel__header">
      <h3 class="forgot-step-panel__title">
        <!-- 忘记密码/重置密码，传入时已经包$t了 -->
        {{ title }}
      </h3>
    </div>

    <div class="forgot-step-panel__body">
      <div class="forgot-step-panel__content">
        <slot />
      </div>

      <div class="forgot-step-panel__footer">
        <TextLink
          class="forgot-back-btn"
          @click="emit('back')"
        >
          <span class="forgot-back-btn__icon">
            <SvgIcon
              name="common-back"
              width="16"
              height="16"
            />
          </span>
          <span class="forgot-back-btn__text">{{ $t("返回登录") }}</span>
        </TextLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TextLink from "@/components/auth/layout/TextLink.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";

defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  back: [];
}>();
</script>

<style lang="scss" scoped>
.forgot-step-panel {
  width: 100%;
  min-height: 392px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  color: #303133;
}

.forgot-step-panel__header {
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.forgot-step-panel__title {
  margin: 0;
  font-family: "Source Han Sans CN", "Microsoft YaHei", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  color: #303133;
}

.forgot-step-panel__body {
  width: 340px;
  min-height: 328px;
  display: flex;
  flex-direction: column;
}

.forgot-step-panel__content {
  width: 340px;
}

.forgot-step-panel__footer {
  display: flex;
  justify-content: center;
  width: 88px;
  height: 24px;
  margin: auto auto 0;
}

.forgot-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  width: 88px;

  :deep(.el-button__text) {
    width: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: currentColor;
    padding: 0;
    line-height: 24px;
  }

  :deep(svg) {
    display: block;
    color: currentColor;
  }
}

.forgot-back-btn__icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.forgot-back-btn__text {
  width: 64px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-left: 10px;
  padding: 0;
  line-height: 24px;
}
</style>
