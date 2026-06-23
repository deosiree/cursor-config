#!/usr/bin/env node
/**
 * 菜单树 API 缺口检查：源码 views→gateway→api 与菜单 YAML 按 scope diff。
 *
 * 用法:
 *   node check-menu-api-gap.node.js --repo <apex_dev> --menu <菜单树.yaml> [--scope default] [--out <report.md>]
 *
 * 退出码: 0=无P0 | 1=有P0 | 2=输入/脚本错误
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_SCOPE = {
  首页: { route: "/Apex/dashboard", views: "src/views/dashboard" },
  租户管理: { route: "/Apex/tenant", views: "src/views/tenant" },
  用户管理: { route: "/Apex/system/user", views: "src/views/system/user" },
  角色管理: { route: "/Apex/system/role", views: "src/views/system/role" },
  安全配置: { route: "/Apex/system/securityConfig", views: "src/views/system/securityConfig" },
  菜单管理: { route: "/Apex/system/menu", views: "src/views/system/menu" },
};

const EXCLUDE_ROUTES = new Set(["/Apex/profile"]);

const STALE_PREFIX = "/api/v2/";

/** Gateway.method → 业务 API 路径（归一化后，无 forward/direct 前缀） */
const GATEWAY_API_MAP = {
  "UserGateway.getPage": ["/seccenter/v2/user/list", "/seccenter/v2/config/security/detail"],
  "UserGateway.getStatusStatsV2": ["/seccenter/v2/user/statusStats"],
  "UserGateway.create": ["/seccenter/v2/user/create"],
  "UserGateway.update": ["/seccenter/v2/user/update"],
  "UserGateway.disableUser": ["/seccenter/v2/user/disable"],
  "UserGateway.enableUser": ["/seccenter/v2/user/enable"],
  "UserGateway.unlockUser": ["/seccenter/v2/user/unlock"],
  "UserGateway.resendActivation": ["/seccenter/v2/user/resendActivation"],
  "UserGateway.resetPassword": ["/seccenter/v2/user/resetPassword"],
  "UserGateway.deleteByIds": ["/seccenter/v2/user/delete"],
  "UserGateway.getProfile": ["/seccenter/v2/user/detail"],
  "UserGateway.updateProfile": ["/seccenter/v2/user/update"],
  "UserGateway.changePassword": ["/seccenter/v2/user/updatePassword"],
  "UserGateway.bindOrChangeMobile": ["/seccenter/v2/user/update"],
  "UserGateway.bindOrChangeEmail": ["/seccenter/v2/user/update"],
  "UserGateway.getInfo": ["/seccenter/v2/user/detail"],
  "UserGateway.getPwdPolicy": ["/seccenter/v2/config/security/detail"],
  "RoleGateway.getPage": ["/seccenter/v2/role/list"],
  "RoleGateway.create": ["/seccenter/v2/role/create"],
  "RoleGateway.update": ["/seccenter/v2/role/update"],
  "RoleGateway.deleteById": ["/seccenter/v2/role/delete"],
  "RoleGateway.getDetail": ["/seccenter/v2/role/detail"],
  "RoleGateway.getRoleMenuList": ["/seccenter/v2/menu/tree"],
  "RoleGateway.assignMenuPermissions": ["/seccenter/v2/role/assignMenuPermissions"],
  "RoleGateway.assignDevices": ["/seccenter/v2/role/assignDevices"],
  "RoleGateway.getOptions": ["/seccenter/v2/role/list"],
  "TenantGateway.getPageV2": ["/seccenter/v2/tenant/list", "/seccenter/v2/config/security/detail"],
  "TenantGateway.getStatusStatsV2": ["/seccenter/v2/tenant/statusStats"],
  "TenantGateway.createV2": ["/seccenter/v2/tenant/create"],
  "TenantGateway.updateV2": ["/seccenter/v2/tenant/update"],
  "TenantGateway.deleteV2": ["/seccenter/v2/tenant/delete", "/devmgr/device/list", "/devmgr/device/activate"],
  "TenantGateway.getProjectsV2": ["/seccenter/v2/tenant/projects"],
  "TenantGateway.getDetailV2": ["/seccenter/v2/tenant/detail"],
  "TenantGateway.assignProjectsV2": ["/seccenter/v2/tenant/assignProjects", "/dbres/project/list"],
  "TenantGateway.updateStatusV2": ["/seccenter/v2/tenant/updateStatus"],
  "ConfigGateway.detail": ["/seccenter/v2/config/security/detail", "/seccenter/v2/config/session/detail"],
  "ConfigGateway.update": ["/seccenter/v2/config/security/update", "/seccenter/v2/config/session/update"],
  "ConfigGateway.detailConfig": ["/seccenter/v2/config/security/detail"],
  "ConfigGateway.updateConfig": ["/seccenter/v2/config/security/update"],
  "ConfigGateway.detailSession": ["/seccenter/v2/config/session/detail"],
  "ConfigGateway.updateSession": ["/seccenter/v2/config/session/update"],
  "ConfigGateway.getPwdPolicy": ["/seccenter/v2/config/security/detail"],
  "MenuGateway.getPageDetail": ["/seccenter/v2/menu/detail"],
  "MenuGateway.getPageFunc": ["/seccenter/v2/menu/tree"],
  "MenuGateway.getPermissionSubtree": ["/seccenter/v2/menu/tree"],
  "MenuGateway.getTreeByPage": ["/seccenter/v2/menu/tree"],
  "MenuGateway.getTree": ["/seccenter/v2/menu/tree"],
  "MenuGateway.getFuncApis": ["/seccenter/v2/menu/detail"],
  "MenuGateway.addFuncApi": ["/seccenter/v2/menu/api/add"],
  "MenuGateway.updateFuncApi": ["/seccenter/v2/menu/api/update"],
  "MenuGateway.deleteFuncApi": ["/seccenter/v2/menu/api/delete"],
  "MenuGateway.getPageFuncByList": ["/seccenter/v2/menu/list"],
  "MenuGateway.getPageByProjectPage": ["/seccenter/v2/menu/list"],
  "MenuGateway.getPageByProjectDir": ["/seccenter/v2/menu/list"],
  "MenuGateway.getListByPage": ["/seccenter/v2/menu/list"],
  "MenuGateway.getList": ["/seccenter/v2/menu/list"],
  "MenuGateway.getRoutes": ["/seccenter/v2/menu/list"],
  "MenuGateway.create": ["/seccenter/v2/menu/create"],
  "MenuGateway.update": ["/seccenter/v2/menu/update"],
  "MenuGateway.deleteById": ["/seccenter/v2/menu/delete", "/seccenter/v2/menu/list", "/seccenter/v2/menu/detail"],
  "MenuGateway.exportMenuTreeAll": ["/seccenter/v2/menu/export"],
  "MenuGateway.importMenuTreeAll": ["/seccenter/v2/menu/import"],
  "MenuGateway.exportMenuTree": ["/seccenter/v2/menu/project/export"],
  "MenuGateway.importMenuTree": ["/seccenter/v2/menu/project/import"],
  "MenuGateway.importMenuTreePreview": ["/seccenter/v2/menu/project/import"],
  "MenuGateway.importMenuTreeReal": ["/seccenter/v2/menu/project/import"],
  "DeviceGateway.getBind": ["/devmgr/device/list"],
  "DeviceGateway.getUnbind": ["/devmgr/device/list"],
  "DeviceGateway.getBindPage": ["/devmgr/device/list"],
  "DeviceGateway.deviceActivate": ["/devmgr/device/activate"],
  "DeviceGateway.unbindAllByTenantId": ["/devmgr/device/list", "/devmgr/device/activate"],
  "ProjectGateway.getProjectList": ["/dbres/project/list"],
  "ProjectGateway.getProjectOptions": ["/dbres/project/list"],
  "ProjectGateway.getTenantProjectOptions": ["/dbres/project/list"],
  "ProjectGateway.getTenantProjects": ["/dbres/project/list"],
  "ProjectGateway.getProjectResourceList": ["/dbres/project/resource/list"],
  "ProjectGateway.getDeviceBindInfo": ["/dbres/devicebind/list"],
  "ApiWhitelistGateway.listWhitelists": ["/seccenter/v2/apiWhitelist/list"],
  "ApiWhitelistGateway.createWhitelist": ["/seccenter/v2/apiWhitelist/create"],
  "ApiWhitelistGateway.updateWhitelist": ["/seccenter/v2/apiWhitelist/update"],
  "ApiWhitelistGateway.deleteWhitelist": ["/seccenter/v2/apiWhitelist/delete"],
  "ApiWhitelistGateway.deleteWhitelistsByIds": ["/seccenter/v2/apiWhitelist/delete"],
  "ApiWhitelistGateway.getWhitelist": ["/seccenter/v2/apiWhitelist/get"],
};

const DIRECT_API_PATTERNS = [
  { re: /DeviceAPI\.overview\s*\(/, apis: ["/devmgr/device/overview"] },
  { re: /TenantAPI\.getStatusStatsV2\s*\(/, apis: ["/seccenter/v2/tenant/statusStats"] },
  { re: /TypeAPI\.list\s*\(/, apis: ["/devmgr/device/type/list"] },
];

function parseArgs(argv) {
  const args = { scope: "default", out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--repo") args.repo = argv[++i];
    else if (a === "--menu") args.menu = argv[++i];
    else if (a === "--scope") args.scope = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--help") args.help = true;
  }
  return args;
}

async function loadYamlParser(repoPath) {
  const pkgJson = path.join(repoPath, "package.json");
  if (fs.existsSync(pkgJson)) {
    try {
      const req = createRequire(pkgJson);
      return req("yaml");
    } catch {
      /* fall through */
    }
  }
  const pnpmDir = path.join(repoPath, "node_modules", ".pnpm");
  if (fs.existsSync(pnpmDir)) {
    for (const name of fs.readdirSync(pnpmDir)) {
      if (!name.startsWith("yaml@")) continue;
      const yamlRoot = path.join(pnpmDir, name, "node_modules", "yaml");
      const entry = path.join(yamlRoot, "dist", "index.js");
      if (fs.existsSync(entry)) {
        return await import(`file://${entry.replace(/\\/g, "/")}`);
      }
    }
  }
  throw new Error(`无法解析 yaml 包：请在 ${repoPath} 执行 pnpm install，或确保 vite/unocss 等依赖已安装`);
}

function normalizeApiUrl(url) {
  let u = String(url || "").trim();
  u = u.replace(/^(direct|forward)\//, "/");
  if (!u.startsWith("/")) u = `/${u}`;
  return u;
}

function walkFiles(dir, ext = [".ts", ".vue"]) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walkFiles(p, ext));
    else if (ext.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

function findPageByRoute(nodes, routePath) {
  if (!nodes) return null;
  for (const n of nodes) {
    if (n.route_path === routePath && n.type === "page") return n;
    const found = findPageByRoute(n.children, routePath);
    if (found) return found;
  }
  return null;
}

function collectMenuPermApis(pageNode) {
  const perms = {};
  const allApis = new Set();
  const stale = [];

  function walkFunctions(nodes) {
    if (!nodes) return;
    for (const n of nodes) {
      if (n.type === "function" && n.perm) {
        const apis = (n.apis || []).map((a) => normalizeApiUrl(a.api_url)).filter(Boolean);
        if (!perms[n.perm]) perms[n.perm] = new Set();
        apis.forEach((a) => {
          perms[n.perm].add(a);
          allApis.add(a);
          if (a.startsWith(STALE_PREFIX)) stale.push({ perm: n.perm, api: a });
        });
      }
      if (n.children) walkFunctions(n.children);
    }
  }
  walkFunctions(pageNode.children || []);
  return { perms, allApis, stale };
}

function traceSourceApis(repoPath, viewsRel) {
  const apis = new Set();
  const unmapped = new Set();
  const viewDir = path.join(repoPath, viewsRel);

  for (const file of walkFiles(viewDir)) {
    const content = fs.readFileSync(file, "utf8");

    for (const [key, urls] of Object.entries(GATEWAY_API_MAP)) {
      const [gw, method] = key.split(".");
      const re = new RegExp(`\\b${gw}\\.${method}\\s*\\(`, "g");
      if (re.test(content)) urls.forEach((u) => apis.add(u));
    }

    for (const { re, apis: directApis } of DIRECT_API_PATTERNS) {
      if (re.test(content)) directApis.forEach((u) => apis.add(u));
    }

    for (const m of content.matchAll(/\b(\w+Gateway)\.(\w+)\s*\(/g)) {
      const key = `${m[1]}.${m[2]}`;
      if (!GATEWAY_API_MAP[key]) unmapped.add(key);
    }
  }
  return { apis, unmapped };
}

function resolveScope(scopeArg) {
  if (scopeArg === "default") return { ...DEFAULT_SCOPE };
  const parts = scopeArg.split(",").map((s) => s.trim()).filter(Boolean);
  const result = {};
  for (const p of parts) {
    if (DEFAULT_SCOPE[p]) {
      result[p] = DEFAULT_SCOPE[p];
      continue;
    }
    for (const [name, cfg] of Object.entries(DEFAULT_SCOPE)) {
      if (cfg.route === p) {
        result[name] = cfg;
        break;
      }
    }
  }
  if (Object.keys(result).length === 0) throw new Error(`无法解析 scope: ${scopeArg}`);
  return result;
}

function buildReport(results, meta) {
  const lines = [];
  const date = new Date().toISOString().slice(0, 10);
  lines.push("---");
  lines.push(`检查时间: ${date}`);
  lines.push(`targetRepo: ${path.basename(meta.repo)}`);
  lines.push(`menuTreeYaml: ${meta.menu}`);
  lines.push(`focusModules: ${meta.scopeLabel}`);
  lines.push(`excludeRoutes: ${[...EXCLUDE_ROUTES].join(", ")}`);
  lines.push("---");
  lines.push("");
  lines.push("# 菜单树 API 缺口检查报告");
  lines.push("");
  lines.push("## 口径说明");
  lines.push("");
  lines.push("- 真源：源码 views → gateway → api 真实调用");
  lines.push("- 对照：菜单树各 page 下 function 的 `apis[]` 并集");
  lines.push("- P0：源码有调用、该 page 下所有 perm 均未收录");
  lines.push("- P1：菜单含 `/api/v2/*` 等前端未使用的 stale 路径");
  lines.push("");

  const totalP0 = results.reduce((s, r) => s + r.p0.length, 0);
  const totalP1 = results.reduce((s, r) => s + r.stale.length, 0);

  lines.push("## 汇总");
  lines.push("");
  lines.push("| 级别 | 数量 |");
  lines.push("|------|------|");
  lines.push(`| P0 | ${totalP0} |`);
  lines.push(`| P1 stale | ${totalP1} |`);
  lines.push("");
  if (totalP0 === 0) {
    lines.push("**结论**：范围内无 P0 功能 API 遗漏。");
  } else {
    lines.push("**结论**：存在 P0 遗漏，需补菜单树 API。");
  }
  lines.push("");

  for (const r of results) {
    lines.push(`---`);
    lines.push("");
    lines.push(`## ${r.name} (\`${r.route}\`)`);
    lines.push("");
    lines.push(`- 菜单 function 数：${Object.keys(r.menuPerms).length}`);
    lines.push(`- 源码 API 数：${r.sourceApis.size}`);
    lines.push(`- 菜单 API 并集：${r.menuAllApis.size}`);
    lines.push("");

    if (r.p0.length) {
      lines.push("### P0 遗漏");
      lines.push("");
      for (const api of r.p0) lines.push(`- \`${api}\``);
      lines.push("");
    } else {
      lines.push("✅ 无 P0");
      lines.push("");
    }

    if (r.stale.length) {
      lines.push("### P1 stale（建议删除）");
      lines.push("");
      lines.push("| perm | api_url |");
      lines.push("|------|---------|");
      for (const s of r.stale) lines.push(`| \`${s.perm}\` | \`${s.api}\` |`);
      lines.push("");
    }

    if (r.unmappedGateway.size) {
      lines.push("### 待扩展 gateway 映射");
      lines.push("");
      for (const g of [...r.unmappedGateway].sort()) lines.push(`- \`${g}\``);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push("## 排除项");
  lines.push("");
  for (const ex of EXCLUDE_ROUTES) {
    lines.push(`- \`${ex}\`：全局访问/白名单，未纳入检查`);
  }
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.repo || !args.menu) {
    console.log(`用法: node check-menu-api-gap.node.js --repo <apex_dev> --menu <yaml> [--scope default] [--out report.md]`);
    process.exit(args.help ? 0 : 2);
  }

  const repo = path.resolve(args.repo);
  const menuPath = path.resolve(args.menu);
  if (!fs.existsSync(repo)) {
    console.error(`repo 不存在: ${repo}`);
    process.exit(2);
  }
  if (!fs.existsSync(menuPath)) {
    console.error(`menu 不存在: ${menuPath}`);
    process.exit(2);
  }

  const yaml = await loadYamlParser(repo);
  const menuData = yaml.parse(fs.readFileSync(menuPath, "utf8"));
  const menus = menuData.menus || menuData;
  const scope = resolveScope(args.scope);

  const results = [];
  let hasP0 = false;

  for (const [name, cfg] of Object.entries(scope)) {
    if (EXCLUDE_ROUTES.has(cfg.route)) continue;

    const pageNode = findPageByRoute(menus, cfg.route);
    if (!pageNode) {
      console.warn(`WARN: 菜单树未找到 page ${cfg.route}`);
      continue;
    }

    const { perms, allApis, stale } = collectMenuPermApis(pageNode);
    const menuPerms = {};
    for (const [p, set] of Object.entries(perms)) menuPerms[p] = [...set];

    const { apis: sourceApis, unmapped } = traceSourceApis(repo, cfg.views);
    const p0 = [...sourceApis].filter((a) => !allApis.has(a)).sort();

    if (p0.length) hasP0 = true;

    results.push({
      name,
      route: cfg.route,
      menuPerms,
      menuAllApis: allApis,
      sourceApis,
      p0,
      stale,
      unmappedGateway: unmapped,
    });
  }

  const report = buildReport(results, {
    repo,
    menu: menuPath,
    scopeLabel: args.scope === "default" ? "default（6 模块）" : args.scope,
  });

  if (args.out) {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, report, "utf8");
    console.log(`报告已写入: ${outPath}`);
  } else {
    console.log(report);
  }

  const p0Count = results.reduce((s, r) => s + r.p0.length, 0);
  const p1Count = results.reduce((s, r) => s + r.stale.length, 0);
  console.error(`\nSUMMARY: P0=${p0Count} P1=${p1Count} modules=${results.length}`);
  process.exit(hasP0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
