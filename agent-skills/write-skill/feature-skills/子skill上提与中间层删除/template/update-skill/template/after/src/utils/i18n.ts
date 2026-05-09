// translate router.meta.title, be used in breadcrumb sidebar tagsview
/**
 * 判断是否存在国际化配置，如果没有原生返回（现已退化）
 * @param title
 * @returns
 */
export function translateRouteTitle(title: unknown) {
  return typeof title === "string" ? title : "";
}
