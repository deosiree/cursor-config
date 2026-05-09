import { createApp } from "vue";
import App from "./App.vue";
import i18n from "@/i18n";
import setupPlugins from "@/plugins";

// 暗黑主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "vxe-table/lib/style.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 过渡动画
import "animate.css";

// 自动为某些默认事件（如 touchstart、wheel 等）添加 { passive: true },提升滚动性能并消除控制台的非被动事件监听警告
import "default-passive-events";
import "@/assets/iconfont/iconfont.css";
import { registerQiankunLifecycle, renderStandalone } from "@/plugins/qiankun";
import "@/styles/fonts.scss";
import "element-plus/dist/index.css";
// 将原有配置逻辑封装成函数
function createAppInstance() {
  const app = createApp(App);
  app.use(i18n);
  app.use(setupPlugins);
  return app;
}

// 注册 qiankun 生命周期钩子
registerQiankunLifecycle(createAppInstance);

// 独立运行时直接挂载
renderStandalone(createAppInstance);
