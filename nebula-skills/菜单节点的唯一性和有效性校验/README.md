# 菜单节点的唯一性和有效性校验

Nebula 专有巡检 skill：按《前端的表单校验规则》校验菜单唯一性/有效性，或对齐菜单表单挂载。

## 何时用

- 导出 YAML / JSON 菜单要做合规扫描
- 解读 `page.combo` 与单项目结果差异
- function 路由被同项目 path 误拦

## 怎么用（自然语言）

```text
使用「菜单节点的唯一性和有效性校验」按文档扫 docs/menu/t-cloud 的 YAML，分文件再合并解读。
```

```text
使用「菜单节点的唯一性和有效性校验」核对 MenuFormDialog 的 function 是否挂了 chkAncPath。
```

## 与 apex_dev 脚本对照

| 能力 | 仓库路径 |
|------|----------|
| 规则文档 | `nebula/docs/plans/前端的表单校验规则.md` |
| 业务规则 | `apex_dev/src/views/system/menu/utils/menu-formRules.ts` |
| 扫描核 | `apex_dev/src/views/system/menu/utils/scan-menu-rules.ts` |
| CLI | `apex_dev/scripts/scan-menu-rules.ts` + `pnpm scan:menu-rules` |
| YAML→JSON | `apex_dev/scripts/convert-menu-yaml-to-json.py` |
| 启动 | `apex_dev/scripts/run-vite-node.mjs` |
| 使用说明 | `apex_dev/scripts/README-scan-menu-rules.md` |

本目录**不复制**上述大文件；agent 在 `apex_dev` 执行并引用本 skill 口径。

## 交付提醒

扫描相关脚本若仍未纳入 apex_dev 仓库，实施扫描前确认 `scan-menu-rules` / `convert-menu-yaml-to-json.py` / `README-scan-menu-rules.md` 已落在工作树且可运行。
