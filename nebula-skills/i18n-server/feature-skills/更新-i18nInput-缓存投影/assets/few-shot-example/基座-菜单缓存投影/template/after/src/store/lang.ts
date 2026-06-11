import { defineStore } from "pinia";
import i18n from "@/i18n";
import { LANG_STORAGE_KEY } from "@/i18n/messages";

import type { Lang } from "@/i18n/messages";
import { refreshMenuCacheProjection } from "@/services/menu/menu-repo";

export const useLangStore = defineStore("lang", {
  state: () => ({
    lang: "zh-CN" as Lang,
  }),

  actions: {
    setLang(lang: Lang) {
      i18n.global.locale.value = lang;
      this.lang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      void refreshMenuCacheProjection();
    },
    init() {
      const saved = (localStorage.getItem(LANG_STORAGE_KEY) as Lang) || null;
      if (saved) {
        i18n.global.locale.value = saved;
        this.lang = saved;
      }
    },
  },
});
