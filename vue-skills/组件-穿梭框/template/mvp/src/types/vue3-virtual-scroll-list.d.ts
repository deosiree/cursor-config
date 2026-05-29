declare module "vue3-virtual-scroll-list" {
  import { Component } from "vue";

  interface VirtualListProps {
    dataKey: string;
    dataSources: any[];
    dataComponent: Component | string;
    estimateSize?: number;
    style?: string | Record<string, any>;
    [key: string]: any;
  }

  const VirtualList: Component<VirtualListProps>;
  export default VirtualList;
}
