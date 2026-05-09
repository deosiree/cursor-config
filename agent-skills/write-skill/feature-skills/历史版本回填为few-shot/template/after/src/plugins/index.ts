import type { App } from "vue";

import { setupDirective } from "@/directive";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import { setupElIcons } from "./icons";
import { InstallCodeMirror } from "codemirror-editor-vue3";
import { setupSplitPanel } from "@/plugins/splitPanel";
import { isQiankunEnv } from "@/plugins/qiankun";
// import { setupPermission } from "./permission";
// import { setupWebSocket } from "./websocket";
// import { setupVxeTable } from "./vxeTable";

export default {
  install(app: App<Element>) {
    // 路由(router)
    setupRouter(app);
    // 状态管理(store)
    setupStore(app);
    // 自定义指令(directive)
    setupDirective(app);
    // Element-plus图标
    setupElIcons(app);
    // 路由守卫
    if (!isQiankunEnv()) {
      //  setupPermission();
    }
    // WebSocket服务
    // setupWebSocket();
    // vxe-table
    // setupVxeTable(app);
    setupSplitPanel(app);
    // 注册 CodeMirror
    app.use(InstallCodeMirror);
  },
};
