<template>
  <el-tooltip
    :content="tooltipContent"
    placement="top"
    :show-after="300"
    :disabled="!showTooltip"
  >
    <component
      :is="tag"
      :class="cellClass"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      {{ display }}
    </component>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    content?: string;
    tag?: "span" | "div";
  }>(),
  {
    content: "",
    tag: "span",
  }
);

const showTooltip = ref(false);

const display = computed(() => (props.content?.trim() ? props.content : "-"));
const tooltipContent = computed(() => props.content?.trim() ?? "");
const cellClass = computed(() =>
  props.tag === "div" ? "header-item transfer-overflow-text" : "transfer-item__desc transfer-overflow-text"
);

function onMouseEnter(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  showTooltip.value =
    Boolean(tooltipContent.value) && el.scrollWidth > el.clientWidth;
}

function onMouseLeave() {
  showTooltip.value = false;
}
</script>

<style scoped lang="scss">
.transfer-overflow-text {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-item {
  text-align: left;
}

.transfer-item__desc {
  color: var(--el-text-color-regular);
  text-align: left;
}
</style>
