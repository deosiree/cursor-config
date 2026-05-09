import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";
import { registerApps } from "./plugins/qiankun/apps";
import "./styles/index.scss";
import "./styles/fonts.scss";
import "virtual:svg-icons-register";
import SvgIcon from "@/components//SvgIcon/index.vue";
import { setupI18n } from "@/lang";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { setupPermission } from "@/plugins/permission.ts";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(store);
app.use(router);
app.use(ElementPlus);
app.component("svg-icon", SvgIcon);
setupI18n(app);
setupPermission();

app.mount("#app");
// 等待路由准备好后再启动 qiankun，确保容器已存在
router.isReady().then(async () => {
  await registerApps();
});
