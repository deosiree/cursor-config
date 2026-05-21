import request from "@/utils/request";
import { buildXxxV2Url } from "./route-channel";

export interface DomainWireModel {
  id: string;
  name?: string;
  status?: number;
}

export interface ListDomainV2Request {
  pagination?: PaginationV2;
  keyword?: string;
  status?: number;
}

export interface ListDomainV2Response {
  items: DomainWireModel[];
  pagination: PaginationInfoV2;
}

const DomainV2API = {
  list(data: ListDomainV2Request) {
    return request<any, ListDomainV2Response>({
      url: buildXxxV2Url("domain", "list"),
      method: "post",
      data,
    });
  },
};

export default DomainV2API;
