import i18n from "@/i18n";

export function translateRouteTitle(title: any) {
  if (typeof title !== "string") {
    return "";
  }

  const hasKey = i18n.global.te(title);
  if (hasKey) {
    const translatedTitle = i18n.global.t(title);
    return translatedTitle;
  }
  return title;
}
