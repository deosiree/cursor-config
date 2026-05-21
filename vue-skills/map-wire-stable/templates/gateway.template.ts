import type { DomainForm, DomainQuery, DomainStableStatus, DomainVO } from "@/types/domain";
import DomainV2API from "@/api/xxx/domain.v2.api";

export function mapWire2StableDomainStatus(status?: number | null): DomainStableStatus {
  switch (status) {
    case 1:
      return "active";
    case 2:
      return "locked";
    case 3:
      return "disabled";
    case 4:
      return "activation";
    default:
      return "unspecified";
  }
}

export function mapStable2WireDomainStatus(status?: DomainStableStatus): number | undefined {
  switch (status) {
    case "active":
      return 1;
    case "locked":
      return 2;
    case "disabled":
      return 3;
    case "activation":
      return 4;
    case "unspecified":
      return 0;
    default:
      return undefined;
  }
}

function mapWireRowToStableVO(row: { id?: string; name?: string; status?: number }): DomainVO {
  return {
    id: String(row?.id ?? ""),
    name: row?.name,
    status: mapWire2StableDomainStatus(row?.status),
  };
}

const DomainGateway = {
  async getPage(query: DomainQuery): Promise<PageResult<DomainVO[]>> {
    const res = await DomainV2API.list({
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
      },
      keyword: query.keywords,
      status: mapStable2WireDomainStatus(query.status),
    });

    const list = (res?.items || []).map(mapWireRowToStableVO);
    return {
      list,
      result: list,
      total: res?.pagination?.totalCount || 0,
      totalCount: res?.pagination?.totalCount || 0,
    };
  },

  async update(data: DomainForm) {
    return Promise.resolve(data);
  },
};

export default DomainGateway;
