import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";
import { store } from "./store";
import { useLangStore } from "./store/lang";
import { registerApps } from "./plugins/qiankun/apps";
import "./styles/index.scss";
import "./styles/fonts.scss";
import "virtual:svg-icons-register";
import SvgIcon from "@/components//SvgIcon/index.vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { setupPermission } from "@/plugins/permission.ts";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(store);
app.use(router);
app.use(ElementPlus);
app.use(i18n);
// 基座专用：启动时初始化并回填全局语言（同步 i18n 与本地持久化状态）
useLangStore().init();
app.component("svg-icon", SvgIcon);
setupPermission();

app.mount("#app");
// 等待路由准备好后再启动 qiankun，确保容器已存在
router.isReady().then(async () => {
  await registerApps();
});
