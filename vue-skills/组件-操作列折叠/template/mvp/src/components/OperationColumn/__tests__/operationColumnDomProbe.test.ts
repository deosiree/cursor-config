/**
 * @file 离屏 render 探针：与 index.vue probeDomSlots 同路径验证。
 * @module OperationColumn/operationColumnDomProbe.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { h, render, nextTick } from "vue";
import OpItem from "../OpItem.vue";
import { dedupeByLbl, scanOpButtons } from "../operationWidth";

vi.mock("@/directive/permission", () => ({
  checkHasPerm: vi.fn((perm?: string | string[]) => {
    if (perm === "sys:tenant:edit") return false;
    if (perm === "sys:tenant:delete") return true;
    return true;
  }),
}));

/** 模拟 TenantTable 受限角色下可见的 OpItem 组合 */
async function tenantProbe(): Promise<ReturnType<typeof scanOpButtons>> {
  const container = document.createElement("div");
  container.className = "operation-column-probe-host";
  document.body.appendChild(container);

  try {
    const vnode = h("motionless-wrapper", [
      h(OpItem, { label: "管理信息", perm: "sys:tenant:edit", iconClass: "i-svg:a" }),
      h(OpItem, { label: "管理项目", perm: "sys:tenant:edit", icon: "edit" }),
      h(OpItem, { label: "项目资源绑定", perm: "sys:tenant:edit", iconClass: "i-svg:b" }),
      h(OpItem, { label: "管理边端设备", iconClass: "i-svg:bind-device" }),
      h(OpItem, { label: "删除", perm: "sys:tenant:delete", icon: "delete", type: "danger" }),
    ]);
    render(vnode, container);
    await nextTick();
    await nextTick();
    return dedupeByLbl(scanOpButtons(container));
  } finally {
    render(null, container);
    document.body.removeChild(container);
  }
}

describe("离屏 render 探针（OpItem 最终可见态）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("无 edit 权限时仅扫描 2 个可见 OpItem", async () => {
    const descs = await tenantProbe();
    expect(descs.map((d) => d.label)).toEqual(["管理边端设备", "删除"]);
    expect(descs.every((d) => d.hasIcon)).toBe(true);
  });

  it("无 perm 限制的项均进入扫描结果", async () => {
    const container = document.createElement("motionless-wrapper");
    document.body.appendChild(container);

    try {
      const vnode = h("motionless-wrapper", [
        h(OpItem, { label: "操作A" }),
        h(OpItem, { label: "操作B", icon: "edit" }),
      ]);
      render(vnode, container);
      await nextTick();
      await nextTick();
      const descs = scanOpButtons(container);
      expect(descs.map((d) => d.label)).toEqual(["操作A", "操作B"]);
    } finally {
      render(null, container);
      document.body.removeChild(container);
    }
  });
});
