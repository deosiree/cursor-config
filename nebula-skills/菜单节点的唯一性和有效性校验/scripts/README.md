# scripts（本 skill 自包含）

菜单扫描工具住在本目录，**不**依赖、也**不**写入 `apex_dev`。

## 命令

在任意工作目录均可；以下假设 cwd 为本 skill 根目录。

```bash
# YAML(snake_case) → MenuVO JSON（文件名作 projectId）
python scripts/convert-menu-yaml-to-json.py <yamlDir> <jsonOutDir>

# 只读扫描
node scripts/scan-menu-rules.mjs --input <menu.json> [--out report.json] [--project-id <id>]
node scripts/scan-menu-rules.mjs --help
```

退出码：`0` 无违规 · `1` 有违规 · `2` 参数/读文件错误。

## 文件

| 路径 | 作用 |
|------|------|
| `scan-menu-rules.mjs` | CLI |
| `lib/scan-menu-rules.mjs` | 扫描核 |
| `lib/menu-path-rules.mjs` | `chkPathDup` / `chkAncPath` |
| `lib/path-syntax.mjs` | 轻量 path 语法（不绑 apex formRules） |
| `convert-menu-yaml-to-json.py` | YAML→JSON |
| `fixtures/menu-rules-sample.json` | 样例输入 |

依赖：Node.js ≥18；转换脚本需 `PyYAML`（`pip install pyyaml`）。

## 注意

- `route.syntax` 为本 skill 轻量实现；与 apex 表单逐字文案可能略有差异，唯一性/耦合规则以文档为准。
- 禁止写接口、禁止把脚本再拷回 `apex_dev/src`。
