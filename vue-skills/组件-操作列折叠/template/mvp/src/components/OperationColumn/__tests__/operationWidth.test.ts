/**
 * @file 操作列宽度子系统单元测试。
 * @module OperationColumn/operationWidth.test
 */

import { describe, it, expect } from "vitest";
import {
  tblProbeFp,
  calcOpStrip,
  pickProbeRows,
  dedupeByLbl,
  flatForProbe,
  isCjkFull,
  labelTextW,
  moreSlotW,
  stripSceneW,
  opItemW,
  maxFromSlots,
  scanOpButtons,
} from "../operationWidth";

// ========== isCjkFull ==========

describe("isCjkFull", () => {
  it("CJK 统一汉字返回 true", () => {
    expect(isCjkFull("中")).toBe(true);
    expect(isCjkFull("编")).toBe(true);
    expect(isCjkFull("资")).toBe(true);
  });

  it("全角符号返回 true", () => {
    expect(isCjkFull("！")).toBe(true);
    expect(isCjkFull("（")).toBe(true);
    expect(isCjkFull("　")).toBe(true); // 全角空格 U+3000
  });

  it("拉丁字母返回 false", () => {
    expect(isCjkFull("a")).toBe(false);
    expect(isCjkFull("Z")).toBe(false);
  });

  it("边界 U+00FF（ÿ）返回 false", () => {
    expect(isCjkFull("ÿ")).toBe(false);
  });

  it("数字与半角符号返回 false", () => {
    expect(isCjkFull("1")).toBe(false);
    expect(isCjkFull("@")).toBe(false);
  });
});

// ========== labelTextW ==========

describe("labelTextW", () => {
  it("纯 CJK 文案：每字 12px", () => {
    expect(labelTextW("管理信息")).toBe(48); // 4 × 12
    expect(labelTextW("项目资源绑定")).toBe(72); // 6 × 12
  });

  it("纯拉丁文案：每字符 7px", () => {
    expect(labelTextW("Edit")).toBe(28); // 4 × 7
    expect(labelTextW("Resend")).toBe(42); // 6 × 7
  });

  it("CJK + 拉丁混排", () => {
    expect(labelTextW("编辑 Edit")).toBe(59);
  });

  it("空字符返回 0", () => {
    expect(labelTextW("")).toBe(0);
  });
});

// ========== moreSlotW ==========

describe("moreSlotW", () => {
  it("「更多」文案宽 > min 时返回文案公式宽", () => {
    expect(moreSlotW("更多")).toBe(58);
  });

  it("短文案时返回 min 40", () => {
    expect(moreSlotW("M")).toBeGreaterThanOrEqual(40);
  });
});

// ========== calcOpStrip ==========

describe("calcOpStrip", () => {
  it("N=7 slots=5：4 行内 + 更多（下拉 3）", () => {
    expect(calcOpStrip(7, 5)).toEqual({ inlineOpCount: 4, showMore: true });
  });

  it("N=6 slots=6：折叠，全行内无更多", () => {
    expect(calcOpStrip(6, 6)).toEqual({ inlineOpCount: 6, showMore: false });
  });

  it("N=6 slots=5：4 行内 + 更多（下拉 2）", () => {
    expect(calcOpStrip(6, 5)).toEqual({ inlineOpCount: 4, showMore: true });
  });

  it("slots=1：仅「更多」槽，0 行内", () => {
    expect(calcOpStrip(5, 1)).toEqual({ inlineOpCount: 0, showMore: true });
  });

  it("N=2 slots=2：全行内", () => {
    expect(calcOpStrip(2, 2)).toEqual({ inlineOpCount: 2, showMore: false });
  });

  it("N=1 slots=1：仅「更多」", () => {
    expect(calcOpStrip(1, 1)).toEqual({ inlineOpCount: 0, showMore: true });
  });

  it("N=2 slots=1：0 行内 + 更多（下拉 2）", () => {
    expect(calcOpStrip(2, 1)).toEqual({ inlineOpCount: 0, showMore: true });
  });

  it("displaySlotCount<1 按 slots=1", () => {
    expect(calcOpStrip(3, 0)).toEqual({ inlineOpCount: 0, showMore: true });
    expect(calcOpStrip(1, -1)).toEqual({ inlineOpCount: 0, showMore: true });
  });
});

// ========== stripSceneW ==========

describe("stripSceneW", () => {
  const GAP = 8;
  const MORE = "更多";

  it("1 个按钮 slots=1：仅「更多」槽宽", () => {
    const w = stripSceneW([{ label: "编辑", hasIcon: false }], 1, GAP, MORE);
    expect(w).toBe(moreSlotW(MORE) + 4);
  });

  it("1 个按钮 slots=2：全行内无更多", () => {
    const w = stripSceneW([{ label: "编辑", hasIcon: true }], 2, GAP, MORE);
    expect(w).toBe(62);
  });

  it("4 个按钮 slots=2：1 行内 + 更多", () => {
    const descs = [
      { label: "管理信息", hasIcon: true },
      { label: "管理项目", hasIcon: true },
      { label: "项目资源绑定", hasIcon: true },
      { label: "删除", hasIcon: true },
    ];
    const w = stripSceneW(descs, 2, GAP, MORE);
    const inlineOnly = opItemW(descs[0]);
    expect(w).toBe(inlineOnly + GAP + moreSlotW(MORE) + 4);
  });

  it("2 个按钮 slots=2：全行内无更多", () => {
    const twoBtn = [
      { label: "编辑", hasIcon: true },
      { label: "删除", hasIcon: true },
    ];
    const w = stripSceneW(twoBtn, 2, GAP, MORE);
    expect(w).toBe(
      opItemW({ label: "编辑", hasIcon: true }) +
        opItemW({ label: "删除", hasIcon: true }) +
        GAP +
        4
    );
  });

  it("槽位数超出按钮数时全行内，无更多", () => {
    const w = stripSceneW(
      [
        { label: "编辑", hasIcon: false },
        { label: "删除", hasIcon: true },
      ],
      10,
      GAP,
      MORE
    );
    expect(w).toBe(
      opItemW({ label: "编辑", hasIcon: false }) +
        opItemW({ label: "删除", hasIcon: true }) +
        GAP +
        4
    );
  });

  it("slots=1 且 1 个按钮：与仅更多槽公式一致", () => {
    expect(stripSceneW([{ label: "编辑", hasIcon: false }], 1, GAP, MORE)).toBe(
      moreSlotW(MORE) + 4
    );
  });

  it("无操作项返回 0", () => {
    expect(stripSceneW([], 1, GAP, MORE)).toBe(0);
  });

  it("2 项 + slots=6 无更多", () => {
    const twoBtn = [
      { label: "管理边端设备", hasIcon: true },
      { label: "删除", hasIcon: true },
    ];
    const w = stripSceneW(twoBtn, 6, GAP, MORE);
    expect(w).toBe(176);
    expect(w).toBeLessThan(
      maxFromSlots(6, GAP, MORE, [
        [
          { label: "管理信息", hasIcon: true },
          { label: "管理项目", hasIcon: true },
          { label: "项目资源绑定", hasIcon: true },
          { label: "管理边端设备", hasIcon: true },
          { label: "删除", hasIcon: true },
        ],
      ])
    );
  });
});

// ========== scanOpButtons / dedupeByLbl ==========

describe.skipIf(typeof document === "undefined")("scanOpButtons", () => {
  it("跳过 operation-column-op-item--hidden", () => {
    const root = document.createElement("motionless-wrapper");
    root.innerHTML = `
      <span class="operation-column-op-item" data-op-label="可见"></span>
      <span class="operation-column-op-item operation-column-op-item--hidden" data-op-label="隐藏"></span>
    `;
    const descs = scanOpButtons(root);
    expect(descs.map((d) => d.label)).toEqual(["可见"]);
  });
});

describe("maxFromSlots", () => {
  const GAP = 8;
  const MORE = "更多";

  it("多场景取最宽：4 按钮 slots=3 含更多，宽于 2 按钮全行内", () => {
    const sparse = [
      { label: "编辑", hasIcon: true },
      { label: "删除", hasIcon: true },
    ];
    const rich = [
      { label: "编辑", hasIcon: true },
      { label: "添加子项", hasIcon: true },
      { label: "权限配置", hasIcon: true },
      { label: "删除", hasIcon: true },
    ];
    const w = maxFromSlots(3, GAP, MORE, [sparse, rich]);
    const sparseOnly = maxFromSlots(3, GAP, MORE, [sparse]);
    expect(w).toBeGreaterThan(sparseOnly);
  });
});

describe("pickProbeRows", () => {
  it("树表按 type 去重取样", () => {
    const rows = [
      { id: 1, type: "DIR", children: [{ id: 2, type: "PAGE" }] },
      { id: 3, type: "DIR" },
    ];
    const picked = pickProbeRows(rows);
    const types = picked.map((r) => (r as { type: string }).type);
    expect(types).toContain("DIR");
    expect(types).toContain("PAGE");
    expect(types.filter((t) => t === "DIR").length).toBe(1);
  });

  it("平表覆盖 showResendActivation 分支", () => {
    const rows = [
      { id: 1, showResendActivation: false },
      { id: 2, showResendActivation: true },
    ];
    const picked = pickProbeRows(rows);
    expect(picked.some((r) => (r as { showResendActivation?: boolean }).showResendActivation)).toBe(
      true
    );
  });

  it("平表按 status 去重取样", () => {
    const rows = [
      { id: 1, status: "active" },
      { id: 2, status: "active" },
      { id: 3, status: "disabled" },
      { id: 4, status: "locked" },
    ];
    const picked = pickProbeRows(rows);
    const statuses = picked.map((r) => (r as { status: string }).status);
    expect(statuses).toContain("active");
    expect(statuses).toContain("disabled");
    expect(statuses).toContain("locked");
    expect(statuses.filter((s) => s === "active").length).toBe(1);
  });

  it("flatForProbe DFS 展平", () => {
    const flat = flatForProbe([
      { id: 1, children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }] },
    ]);
    expect(flat.map((r) => (r as { id: number }).id)).toEqual([1, 2, 3, 4]);
  });
});

describe("tblProbeFp", () => {
  it("status 变更时指纹变化", () => {
    const before = tblProbeFp([{ id: 1, status: "disabled" }]);
    const after = tblProbeFp([{ id: 1, status: "active" }]);
    expect(before).not.toBe(after);
  });

  it("无关字段变更时指纹不变", () => {
    const a = tblProbeFp([{ id: 1, status: "active", phone: "1" }]);
    const b = tblProbeFp([{ id: 1, status: "active", phone: "2" }]);
    expect(a).toBe(b);
  });
});

describe("dedupeByLbl", () => {
  it("同 label 只保留首次", () => {
    const input = [
      { label: "删除", hasIcon: true },
      { label: "管理边端设备", hasIcon: true },
      { label: "删除", hasIcon: false },
    ];
    expect(dedupeByLbl(input).map((d) => d.label)).toEqual(["删除", "管理边端设备"]);
    expect(dedupeByLbl(input)[0].hasIcon).toBe(true);
  });
});
