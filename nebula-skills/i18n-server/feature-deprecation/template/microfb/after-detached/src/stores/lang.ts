import { defineStore } from "pinia";

export const useLangStore = defineStore("lang", {
  state: () => ({
    lang: "zh-cn",
  }),

  actions: {
    setLang(lang: string) {
      this.lang = lang;
      localStorage.setItem("language", lang);
    },

    init() {
      const saved = localStorage.getItem("language");
      if (saved) this.lang = saved;
    },
  },
});
