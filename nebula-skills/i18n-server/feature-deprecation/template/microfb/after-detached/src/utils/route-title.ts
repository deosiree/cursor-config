import { ROUTE_TITLE_TEXT } from "@/constants/ui-text";

export function resolveRouteTitle(title: string): string {
  return ROUTE_TITLE_TEXT[title as keyof typeof ROUTE_TITLE_TEXT] ?? title;
}
