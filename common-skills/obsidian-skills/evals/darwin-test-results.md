# Darwin 评估：实跑结果

## 实测范围（本次补跑后）

| 功能 | 实测方式 | 结果 | 发现 |
|------|---------|:----:|------|
| VAULT_ROOT .env 加载 | source .env + test -d | ✅ | VAULT_ROOT=F:/Documents/Default-Obsidian |
| route-obsidian dispatch | 验证 4 个 feature skill 文件可达 | ✅ | 全部 132/278/268/90 行 |
| llm-wiki lint | 检查孤立页 + frontmatter | ✅ | 4 页全部有 frontmatter，0 真孤立页 |
| llm-wiki ingest | 写入 10_Raw/ 源文件 | ✅ | session-darwin-optimization 已捕获 |
| llm-wiki query | grep 搜索 20_Wiki | ✅ | darwin 相关内容可检索 |
| obsidian-vault-mgt daily note | 实际运行 create-daily-note.py | ✅ | 20260716.md 已创建，frontmatter 完整 |
| obsidian-vault-mgt orphan detect | 实际运行 find-orphan-notes.py | ⚠️ 可用 | 3640/3870 孤立（web-clip vault 特征）|
| obsidian-vault-mgt tag overview | 实际运行 tag-overview.py | ❌ GBK 编码错误 | Windows GBK 终端不兼容 UTF-8 emoji |

## 实测覆盖率：8/18 = 44%（从 22% 提升到 44%）

## 关键发现

### 脚本兼容性问题（需要修复）
1. **`python3` vs `python`**：Hermes 原版脚本硬编码 `python3`，但在 Windows 上 `python3` 触发 Microsoft Store 假死（exit 49），实际需用 `python`
2. **GBK 编码**：`tag-overview.py` 写入含 emoji 的输出时崩溃（`UnicodeEncodeError: 'gbk' codec can't encode`），需要在 Windows 上设置 `PYTHONIOENCODING=utf-8`
3. **PARA 目录需预创建**：脚本假设 `06 - Daily/YYYY/MM/` 已存在，否则静默失败

### 当前未覆盖（P2）
- llm-wiki synthesize（需编译知识）
- llm-wiki compare（需有对比对象）
- vault-weekly-review（需 7 天活动数据）
- vault-duplicate-detection（需重复内容）
- qmd search（qmd 二进制未安装）
- Human Loop 交互式测试（需人工介入）

## 建议

1. 给 obsidian-vault-management SKILL.md 加一条 Windows 兼容说明（`python3` → `python`，`PYTHONIOENCODING=utf-8`）
2. 未覆盖的 P2 项需要特定前提条件（7 天数据、重复内容、qmd 安装），建议有真实场景时再测
