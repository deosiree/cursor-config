# Element Plus 表格滚动探测（可复用）

弹窗内 `el-table` 设 `max-height` 时，实际滚动容器多为 **`.el-scrollbar__wrap`**。

```javascript
const dialog = [...document.querySelectorAll(".el-dialog")].find(
  (el) =>
    (el.getAttribute("aria-label") || "").includes("编辑白名单") ||
    (el.textContent || "").includes("编辑白名单")
);
const wrap =
  dialog?.querySelector(".el-scrollbar__wrap") ||
  dialog?.querySelector(".el-table__body-wrapper");
const rows = dialog?.querySelectorAll(".el-table__body tbody tr")?.length ?? 0;
if (!wrap) return { ok: false, reason: "scroll container not found", rowCount: rows };
return {
  ok: true,
  rowCount: rows,
  hasVerticalScroll: wrap.scrollHeight > wrap.clientHeight,
  hasHorizontalScroll: wrap.scrollWidth > wrap.clientWidth,
};
```

父级模式编号：**P-ElementPlus-ScrollbarWrap**（见 `references/公共模式与反模式.md`）。

成品脚本：`scripts/opencli-whitelist-scroll-eval-oneline.js`。
