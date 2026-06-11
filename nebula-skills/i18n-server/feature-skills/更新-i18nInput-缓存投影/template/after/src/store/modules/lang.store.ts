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
    /** 仅对齐 store 与当前 i18n locale，不修改 locale（qiankun 主应用已同步后使用） */
    syncFromI18n() {
      this.lang = i18n.global.locale.value as Lang;
    },
    init(options?: { qiankun?: boolean }) {
      if (options?.qiankun) {
        this.syncFromI18n();
        return;
      }
      const saved = (localStorage.getItem(LANG_STORAGE_KEY) as Lang) || null;
      if (saved) {
        this.setLang(saved);
      } else {
        this.syncFromI18n();
      }
    },
  },
});
