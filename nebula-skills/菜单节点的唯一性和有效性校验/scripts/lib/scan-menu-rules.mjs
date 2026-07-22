/**
 * 菜单规则只读扫描核（skill 自包含）。
 * 口径：humanDocs/规则工厂/菜单管理校验规则.md；禁止 seccenter「perm 全表唯一」。
 */
import { getFuzzyPathError, getRoutePathError } from "./path-syntax.mjs";
import { chkAncPath, chkPathDup } from "./menu-path-rules.mjs";

const isPage = (t) => String(t) === "page";
const isFunction = (t) => String(t) === "function";
const isDirOrPage = (t) => t === "directory" || t === "page";

function displayName(node) {
  const raw = node.menuName ?? node.name;
  if (typeof raw === "string") {
    if (raw.trim().startsWith("{")) {
      try {
        const map = JSON.parse(raw);
        return map["zh-CN"] || map["zh_CN"] || map["en-US"] || Object.values(map)[0] || raw;
      } catch {
        return raw;
      }
    }
    return raw;
  }
  if (raw && typeof raw === "object") {
    return raw["zh-CN"] || raw["zh_CN"] || raw["en-US"] || Object.values(raw)[0] || "";
  }
  return "";
}

export function flatMenus(nodes, projectId = "") {
  const out = [];
  const walk = (list = [], inheritProjectId) => {
    for (const node of list) {
      const pid = String(node.projectId ?? inheritProjectId ?? "");
      out.push({
        id: node.id != null ? String(node.id) : "",
        type: String(node.type ?? ""),
        name: displayName(node),
        routePath: String(node.routePath ?? "").trim(),
        perm: String(node.perm ?? "").trim(),
        parentId: node.parentId != null && node.parentId !== "" ? String(node.parentId) : "",
        projectId: pid,
        params: normalizeParams(node.params),
        node,
      });
      if (node.children?.length) walk(node.children, pid);
    }
  };
  walk(Array.isArray(nodes) ? nodes : [], projectId);
  return out;
}

export function normalizeParams(raw) {
  if (raw == null || raw === "") return [];
  let value = raw;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t || t === "[]") return [];
    try {
      value = JSON.parse(t);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.map((p) => ({
    key: String(p?.key ?? "").trim(),
    value: String(p?.value ?? "").trim(),
  }));
}

/** @deprecated 旧名；请用 routeComboKey */
export function pageComboKey(routePath, params) {
  return routeComboKey(routePath, params);
}

export function routeComboKey(routePath, params) {
  const list = normalizeParams(params)
    .filter((p) => p.key || p.value)
    .map((p) => ({ key: p.key, value: p.value }))
    .sort((a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value));
  return `${routePath.trim()}\n${JSON.stringify(list)}`;
}

function hasParams(params) {
  return normalizeParams(params).some((p) => p.key || p.value);
}

function collectPermDupIds(nodes) {
  const byParent = new Map();
  for (const n of nodes) {
    if (!isFunction(n.type) || !n.perm) continue;
    const key = `${n.projectId}::${n.parentId || "__root__"}`;
    const list = byParent.get(key) ?? [];
    list.push(n);
    byParent.set(key, list);
  }
  const bad = new Set();
  for (const list of byParent.values()) {
    const seen = new Map();
    for (const n of list) {
      const prev = seen.get(n.perm);
      if (prev) {
        bad.add(n.id);
        bad.add(prev);
      } else {
        seen.set(n.perm, n.id);
      }
    }
  }
  return bad;
}

/** 全库 directory|page 的 (route_path, params) 冲突 id → detail */
function collectRouteComboDupIds(nodes) {
  const bad = new Map();
  const seen = new Map();
  for (const n of nodes) {
    if (!isDirOrPage(n.type) || !n.routePath) continue;
    const key = routeComboKey(n.routePath, n.params);
    const prev = seen.get(key);
    if (prev) {
      bad.set(
        n.id,
        `与 id=${prev} 冲突: path=${n.routePath} params=${JSON.stringify(normalizeParams(n.params))}`
      );
      if (!bad.has(prev)) {
        bad.set(
          prev,
          `与 id=${n.id} 冲突: path=${n.routePath} params=${JSON.stringify(normalizeParams(n.params))}`
        );
      }
    } else {
      seen.set(key, n.id);
    }
  }
  return bad;
}

function paramsError(params) {
  const list = normalizeParams(params);
  if (list.length === 0) return undefined;
  if (list.some((p) => !p.key || !p.value)) return "存在未填写的路由参数";
  const charOk = /^[a-zA-Z0-9_-]+$/;
  if (list.some((p) => !charOk.test(p.key) || !charOk.test(p.value))) return "包含非法字符";
  const keys = list.map((p) => p.key);
  if (new Set(keys).size !== keys.length) return "路由参数名重复";
  return undefined;
}

export function splitTreesByProject(forest) {
  const map = new Map();
  const cloneWithProject = (node, inherit) => {
    const pid = String(node.projectId ?? inherit ?? "") || "__none__";
    const children = Array.isArray(node.children)
      ? node.children.map((c) => cloneWithProject(c, pid))
      : node.children;
    return {
      ...node,
      projectId: node.projectId ?? (pid === "__none__" ? undefined : pid),
      children,
    };
  };
  for (const root of forest) {
    const pid = String(root.projectId ?? "") || "__none__";
    const cloned = cloneWithProject(root, pid);
    const key = String(cloned.projectId ?? "") || "__none__";
    const list = map.get(key) ?? [];
    list.push(cloned);
    map.set(key, list);
  }
  return map;
}

export function scanMenuRules(tree, options = {}) {
  const globalScope = options.globalScope !== false;
  const all = flatMenus(tree);
  const nodes = options.projectId
    ? all.filter((n) => n.projectId === String(options.projectId))
    : all;

  const projectTrees = splitTreesByProject(Array.isArray(tree) ? tree : []);
  const hits = [];
  const permSiblingDup = collectPermDupIds(nodes);
  const routeComboDup = globalScope ? collectRouteComboDupIds(nodes) : new Map();

  for (const n of nodes) {
    const projectTree = projectTrees.get(n.projectId || "__none__") ?? tree ?? [];
    const base = {
      id: n.id,
      type: n.type,
      name: n.name,
      routePath: n.routePath,
      perm: n.perm,
      parentId: n.parentId,
      projectId: n.projectId,
    };

    if (n.routePath) {
      if (isFunction(n.type)) {
        const syn = getFuzzyPathError(n.routePath);
        if (syn) hits.push({ ...base, code: "route.syntax", source: "frontend", message: syn });
        try {
          chkAncPath(n.routePath, n.parentId || null, projectTree);
        } catch (e) {
          hits.push({ ...base, code: "route.anc", source: "doc", message: e.message });
        }
      } else if (isDirOrPage(n.type)) {
        const syn = getRoutePathError(n.routePath);
        if (syn) hits.push({ ...base, code: "route.syntax", source: "frontend", message: syn });
        if (n.routePath.includes("*") && !syn) {
          hits.push({
            ...base,
            code: "route.syntax",
            source: "doc",
            message: "directory/page 不支持*通配",
          });
        }
        try {
          chkPathDup(n.routePath, n.id, projectTree);
        } catch (e) {
          hits.push({ ...base, code: "route.dup", source: "doc", message: e.message });
        }
      }
    }

    if (isFunction(n.type)) {
      if (!n.perm) {
        hits.push({ ...base, code: "perm.empty", source: "doc", message: "请输入权限码" });
      } else if (permSiblingDup.has(n.id)) {
        hits.push({
          ...base,
          code: "perm.sibling",
          source: "doc",
          message: "权限标识不能重复（同 parent_id）",
        });
      }
    } else if (n.perm) {
      hits.push({
        ...base,
        code: "perm.mustEmpty",
        source: "doc",
        message: "非 function 不能设置 perm",
      });
    }

    if (isPage(n.type)) {
      const pe = paramsError(n.params);
      if (pe) hits.push({ ...base, code: "params.invalid", source: "frontend", message: pe });
    } else if (hasParams(n.params)) {
      hits.push({
        ...base,
        code: "params.mustEmpty",
        source: "doc",
        message: "非 page 的 params 必须为空",
      });
    }

    if (isDirOrPage(n.type)) {
      const comboDetail = routeComboDup.get(n.id);
      if (comboDetail) {
        hits.push({
          ...base,
          code: "route.combo",
          source: "doc",
          message: "路由路径与路由参数组合已存在（directory|page 全库）",
          detail: comboDetail,
        });
      }
    }
  }

  const seen = new Set();
  return hits.filter((h) => {
    const k = `${h.id}|${h.code}|${h.message}|${h.detail ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function parseMenuDump(raw) {
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    const first = raw[0];
    if (first && Array.isArray(first.menus)) {
      return raw.flatMap((p) =>
        (p.menus || []).map((m) => ({
          ...m,
          projectId: m.projectId ?? p.projectId,
        }))
      );
    }
    return raw;
  }
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.result)) return raw.result;
    if (Array.isArray(raw.menus)) return raw.menus;
    if (Array.isArray(raw.data)) return parseMenuDump(raw.data);
  }
  throw new Error("无法识别菜单 JSON：需要数组，或 { result|menus|data }");
}
