import { defineI18nExtractConfig } from "vue-i18n-kit-sy/extractor";

export default defineI18nExtractConfig({
  srcDir: "src",
  localeDir: "src/i18n/locales",
  languages: [
    { code: "zh_CN", defaultValue: "key" },
    { code: "en_US", defaultValue: "" },
  ],
  sort: true,
  removeUnused: true,
});
