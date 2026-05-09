/**
 * 旧版 i18n 资源
 * 第一阶段弃用：运行时不再调用，仅保留用于迁移时的路径映射（对照）。
 */
import type { App } from "vue";
import { createI18n } from "vue-i18n";
// 本地语言包
import enLocale from "./package/en";
import zhCnLocale from "./package/zh-cn";

const messages = {
  "zh-cn": {
    ...zhCnLocale,
  },
  en: {
    ...enLocale,
  },
};

const i18n = createI18n({
  legacy: false,
  locale: "zh-CN",
  messages,
  globalInjection: true,
});

// 全局注册 i18n
export function setupI18n(app: App<Element>) {
  app.use(i18n);
}

export default i18n;
