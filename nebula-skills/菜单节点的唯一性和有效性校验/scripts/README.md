# scripts（跳转清单）

本 skill **不**内嵌业务扫描实现。一律在 `nebula/apex_dev` 执行。

## 命令清单

```bash
# 工作目录：apex_dev
python scripts/convert-menu-yaml-to-json.py <yamlDir> <jsonOutDir>
pnpm scan:menu-rules -- --help
pnpm scan:menu-rules -- --input <path/to/menu.json> [--out report.json] [--project-id <id>]
```

## 跳转

| 用途 | 路径 |
|------|------|
| CLI 入口 | `scripts/scan-menu-rules.ts` |
| YAML 转换 | `scripts/convert-menu-yaml-to-json.py` |
| vite-node 包装 | `scripts/run-vite-node.mjs` |
| 人类说明 | `scripts/README-scan-menu-rules.md` |
| 样例 fixture | `scripts/fixtures/menu-rules-sample.json` |
| 扫描实现 | `src/views/system/menu/utils/scan-menu-rules.ts` |
| 表单业务规则 | `src/views/system/menu/utils/menu-formRules.ts` |

口径与格式细节见 `../references/命令与输入格式.md`。
