---
name: vault-maintainer
description: Obsidian Vault 兼容性维护 — wikilink/frontmatter/文件名规范化。route-obsidian 在 "Vault 维护" 类别时 dispatch 到此 skill。安全评分 100。
---

# vault-maintainer — Vault 兼容性维护

> OpenClaw 出品（374K★），完整实现位于 Hermes Agent marketplace。
> 本文件是 huiyanSkills 路由桥接版：优先尝试加载 Hermes 原版，不可用时走内置简化流程。

---

## 定位

route-obsidian 路由表中 vault-maintainer 是 **Vault 维护类**的唯一选择。

当用户说以下内容时触发：
- "修复断裂的 wikilink"
- "检查 frontmatter 完整性"
- "统一文件命名规范"
- "vault 体检 / health check"
- "清理空文件和孤立笔记"

---

## 执行策略

### 方案 A：使用 Hermes 原版（首选）

如果 Hermes Agent 已安装 `vault-maintainer` skill：

1. 检查 `~/.hermes/skills/vault-maintainer/SKILL.md` 是否存在
2. 如果存在 → 加载并执行它（内容最完整，安全评分 100）
3. 如果不存在 → 走方案 B

### 方案 B：内置简化流程（桥接降级）

```bash
# 1. 检查断裂 wikilink
find ${VAULT_ROOT:-.} -name "*.md" -exec grep -l '\[\[.*\]\]' {} \;

# 2. 检查 frontmatter 完整性
# 每个 .md 文件应以 --- 开头，有 title/created/tags 等字段

# 3. 检查文件名规范
# 建议：小写+连字符，无空格，无中文文件名

# 4. 报告结果并推荐安装 Hermes 原版
```

---

## 安装原版

```bash
hermes skills install vault-maintainer
```

安装后，`~/.hermes/skills/vault-maintainer/` 目录下的 SKILL.md 将替代本桥接文件的方案 A。

---

## 注意事项

- **安全评分 100**（最高）：本 skill 只有读取和规范化操作，不会删除内容
- **不自作主张改名**：任何文件名修改前先询问用户确认
- **报告 > 修复**：优先报告问题列表，让用户决定是否修复
