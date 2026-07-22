# 菜单节点的唯一性和有效性校验

Nebula 专有巡检 skill：按规则工厂《菜单管理校验规则》校验菜单唯一性/有效性，或对齐菜单表单挂载。

扫描脚本住在**本目录 `scripts/`**，不进入 `apex_dev`。本 skill 是执行镜像，细则 SSOT 在规则工厂文。

## 何时用

- 导出 YAML / JSON 菜单要做合规扫描
- 解读 `route.combo` 与单项目结果差异
- function 路由被同项目 path 误拦

## 怎么用（自然语言）

```text
使用「菜单节点的唯一性和有效性校验」按文档扫 docs/menu/t-cloud 的 YAML，分文件再合并解读。
```

```text
使用「菜单节点的唯一性和有效性校验」核对 MenuFormDialog 的 function 是否挂了父链冲突检查。
```

## 路径对照

| 能力 | 路径 |
|------|------|
| 规则文档（SSOT） | `nebula/humanDocs/规则工厂/菜单管理校验规则.md` |
| Harness 薄入口 | `nebula/docs/product/menu-validation.md` |
| 扫描 CLI / 核 / YAML 转换 | 本 skill `scripts/`（见 `scripts/README.md`） |
| 表单产品代码（若改挂载） | `apex_dev/src/views/system/menu/...`（**不含** scan 脚本） |

## 快速命令

```bash
# cwd = 本 skill 根目录
python scripts/convert-menu-yaml-to-json.py <yamlDir> <jsonOutDir>
node scripts/scan-menu-rules.mjs --input <menu.json> [--out report.json]
```
