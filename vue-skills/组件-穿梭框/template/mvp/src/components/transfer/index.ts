import type { App, Component } from "vue";
import Transfer from "./src/transfer.vue";

// 简单的 withInstall 实现
const withInstall = <T extends Component>(component: T) => {
  const comp = component as T & {
    install?: (app: App) => void;
  };

  comp.install = (app: App) => {
    app.component(comp.name || "ElTransfer", comp);
  };

  return comp;
};

export const ElTransfer = withInstall(Transfer);
export default ElTransfer;

export * from "./src/transfer";
