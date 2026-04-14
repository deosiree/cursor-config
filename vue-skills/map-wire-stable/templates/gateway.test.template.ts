import { describe, expect, it } from "vitest";

import {
  mapStable2WireDomainStatus,
  mapWire2StableDomainStatus,
} from "@/gateway/xxx/domain.gateway";

describe("domain wire/stable mapping", () => {
  it("maps wire codes to stable values", () => {
    expect(mapWire2StableDomainStatus(0)).toBe("unspecified");
    expect(mapWire2StableDomainStatus(1)).toBe("active");
    expect(mapWire2StableDomainStatus(2)).toBe("locked");
    expect(mapWire2StableDomainStatus(3)).toBe("disabled");
    expect(mapWire2StableDomainStatus(4)).toBe("activation");
  });

  it("maps stable values to wire codes", () => {
    expect(mapStable2WireDomainStatus("unspecified")).toBe(0);
    expect(mapStable2WireDomainStatus("active")).toBe(1);
    expect(mapStable2WireDomainStatus("locked")).toBe(2);
    expect(mapStable2WireDomainStatus("disabled")).toBe(3);
    expect(mapStable2WireDomainStatus("activation")).toBe(4);
  });
});
