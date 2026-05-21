import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

interface UseTableBodyHeightOptions {
  /** 表格 body 最小高度（px），默认 200 */
  minHeight?: number;
}

/**
 * 根据表格容器实测高度，为 el-table 的 `height` / `max-height` 提供动态数值。
 *
 * 使用 ResizeObserver 监听容器尺寸变化（窗口缩放、侧栏折叠、分页显隐等），
 * 降级时在 window resize 时补算一次。
 *
 * @param wrapperRef 表格外层容器（通常为 `.table-wrapper`）
 * @param options 可选配置
 * @returns tableBodyHeight 供 el-table 绑定的像素高度
 */
export function useTableBodyHeight(
  wrapperRef: Ref<HTMLElement | null>,
  options: UseTableBodyHeightOptions = {}
) {
  const minHeight = options.minHeight ?? 200;
  const tableBodyHeight = ref(minHeight);
  let resizeObserver: ResizeObserver | null = null;

  /**
   * 同步表格主体的高度。
   *
   * 该函数通过获取包装器元素的实际高度，并结合最小高度限制，
   * 来更新表格主体的显示高度，确保布局符合预期。
   */
  function syncHeight(): void {
    // 获取包装器的测量高度，若不存在则默认为 0，并确保最终高度不小于最小高度
    const measured = wrapperRef.value?.clientHeight ?? 0;
    tableBodyHeight.value = Math.max(measured, minHeight);
  }

  /**
   * 初始化并配置 ResizeObserver，用于监听容器尺寸变化。
   *
   * 该函数首先检查浏览器是否支持 ResizeObserver API，若不支持则直接返回。
   * 若支持，则创建一个新的 ResizeObserver 实例，在检测到尺寸变化时调用 syncHeight 同步高度。
   * 最后，如果 wrapperRef.value 存在，则开始观察该元素。
   */
  function setupResizeObserver(): void {
    // 检查浏览器兼容性，若不支持 ResizeObserver 则退出
    if (typeof ResizeObserver === "undefined") return;

    // 创建 ResizeObserver 实例，当观察到尺寸变化时同步高度
    resizeObserver = new ResizeObserver(() => {
      syncHeight();
    });

    // 如果目标元素存在，则启动观察
    if (wrapperRef.value) {
      resizeObserver.observe(wrapperRef.value);
    }
  }

  /**
   * 销毁 ResizeObserver 实例并清理相关资源。
   *
   * 如果 resizeObserver 存在，则断开其所有观察连接，并将引用置为 null，
   * 以防止内存泄漏并确保后续不会重复触发观察回调。
   */
  function teardownResizeObserver(): void {
    if (!resizeObserver) return;
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  /**
   * 组件挂载生命周期钩子。
   * 在 DOM 更新后同步高度并设置ResizeObserver监听器，
   * 若浏览器不支持 ResizeObserver，则降级使用 window resize 事件监听。
   */
  onMounted(() => {
    nextTick(() => {
      syncHeight();
      setupResizeObserver();
    });
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncHeight);
    }
  });

  /**
   * 组件卸载前生命周期钩子。
   * 清理 ResizeObserver 监听器及 window resize 事件监听，防止内存泄漏。
   */
  onBeforeUnmount(() => {
    teardownResizeObserver();
    window.removeEventListener("resize", syncHeight);
  });

  return { tableBodyHeight, syncHeight };
}
