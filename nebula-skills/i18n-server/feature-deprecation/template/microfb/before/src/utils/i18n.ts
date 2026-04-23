import i18n from "@/lang/index";

export function translateRouteTitle(title: any) {
  const hasKey = i18n.global.te("route." + title);
  if (hasKey) {
    return i18n.global.t("route." + title);
  }
  return title;
}
