<!-- RED：无提交锁 -->
<el-button type="primary" size="small" @click="handleSubmitApi">
  {{ $t("确定") }}
</el-button>

<script setup lang="ts">
async function handleSubmitApi() {
  const isValid = await formRef.value?.validate().catch(() => false);
  if (!isValid) return;
  internalLoading.value = true;
  try {
    await MenuGateway.addFuncApi({ ... });
  } finally {
    internalLoading.value = false;
  }
}
</script>
