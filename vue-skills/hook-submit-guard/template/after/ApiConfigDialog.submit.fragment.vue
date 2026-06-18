<!-- GREEN：useSubmitGuard + 弹窗内容区 wrapper v-loading -->
<el-dialog v-model="formDialog.visible" ...>
  <div v-loading="submitLoading" class="submit-dialog-body">
    <ElForm ref="formRef" class="api-form" ...>...</ElForm>
  </div>
  <template #footer>
    <el-button type="primary" size="small" :disabled="submitLoading" @click="handleSubmitApi">
      {{ $t("确定") }}
    </el-button>
  </template>
</el-dialog>

<script setup lang="ts">
import { useSubmitGuard } from "@/composables/useSubmitGuard";

const { loading: submitLoading, startLoad, stopLoad } = useSubmitGuard();
</script>

<style scoped lang="scss">
.submit-dialog-body {
  position: relative;
  min-height: 0;
}
</style>
