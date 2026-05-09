import { t } from "@/i18n";

export function translateRouteTitle(title: unknown) {
  if (typeof title === "string") {
    return t(`route.${title}`, title);
  }
  return "";
}
