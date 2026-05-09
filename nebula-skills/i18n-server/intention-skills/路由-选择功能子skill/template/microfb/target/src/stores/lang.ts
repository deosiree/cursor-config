import { defineStore } from "pinia";
import i18n from "@/i18n";
import { LANG_STORAGE_KEY, type Lang } from "@/i18n/messages";

export const useLangStore = defineStore("lang", {
  state: () => ({
    lang: "zh-CN" as Lang,
  }),

  actions: {
    setLang(lang: Lang) {
      i18n.global.locale.value = lang;
      this.lang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    },

    init() {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
      if (!saved) return;
      i18n.global.locale.value = saved;
      this.lang = saved;
    },
  },
});
