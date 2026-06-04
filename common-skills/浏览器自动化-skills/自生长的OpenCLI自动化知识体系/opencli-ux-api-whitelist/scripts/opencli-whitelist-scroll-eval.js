(() => {
  const dialog = [...document.querySelectorAll(".el-dialog")].find(
    (el) =>
      (el.getAttribute("aria-label") || "").includes("编辑白名单") ||
      el.textContent?.includes("编辑白名单")
  );
  const wrap = dialog?.querySelector(".el-table__body-wrapper");
  const rows = dialog?.querySelectorAll(".el-table__body tbody tr")?.length ?? 0;
  if (!wrap) {
    return { ok: false, reason: "whitelist dialog or table body not found", rowCount: rows };
  }
  return {
    ok: true,
    rowCount: rows,
    bodyClientHeight: wrap.clientHeight,
    bodyScrollHeight: wrap.scrollHeight,
    bodyClientWidth: wrap.clientWidth,
    bodyScrollWidth: wrap.scrollWidth,
    hasVerticalScroll: wrap.scrollHeight > wrap.clientHeight,
    hasHorizontalScroll: wrap.scrollWidth > wrap.clientWidth,
    overflowX: getComputedStyle(wrap).overflowX,
    overflowY: getComputedStyle(wrap).overflowY,
  };
})()
