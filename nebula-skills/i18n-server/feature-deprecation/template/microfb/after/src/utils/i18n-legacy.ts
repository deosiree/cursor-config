import { legacyZhCnLocale } from "@/lang-legacy";

/**
 * Transitional lookup helper.
 * Used only when migration needs to inspect legacy route keys.
 */
export function translateLegacyRouteTitle(title: string): string {
  const routeMap = (legacyZhCnLocale as any)?.route ?? {};
  return routeMap[title] ?? title;
}
