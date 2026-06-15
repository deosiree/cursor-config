---
name: obsidian-vault
description: Obsidian 笔记读写 — 文件 API 创建/读取/搜索/编辑笔记。route-obsidian 在 "笔记读写" 类别时 dispatch 到此 skill。安全评分 90。
---

# obsidian-vault — 笔记读写

> NousResearch 出品（153K★），完整实现位于 Hermes Agent marketplace。
> 本文件是 huiyanSkills 路由桥接版：优先尝试加载 Hermes 原版，不可用时走内置简化流程。

---

## 定位

route-obsidian 路由表中 obsidian-vault 是 **笔记读写类**的首选。

当用户说以下内容时触发：
- "新建一篇笔记"
- "帮我读一下 X 笔记"
- "把这段文本存到 Obsidian"
- "记录这个 / 记一下"
- "搜索笔记内容"

---

## 执行策略

### 方案 A：使用 Hermes 原版（首选）

如果 Hermes Agent 已安装 `obsidian-vault` skill：

1. 检查 `~/.hermes/skills/obsidian-vault/SKILL.md` 是否存在
2. 如果存在 → 加载并执行它（文件 API 而非 shell 命令，安全评分 90）
3. 如果不存在 → 走方案 B

### 方案 B：内置简化流程（桥接降级）

```bash
# 1. 创建新笔记
# 路径：${VAULT_ROOT}/笔记类别/日期-标题.md
# 模板：YAML frontmatter + 正文

# 2. 读取笔记
# 使用 cat 或 head 读取

# 3. 搜索笔记
# grep -r "关键词" ${VAULT_ROOT} --include="*.md"
```

---

## 安装原版

```bash
hermes skills install obsidian-vault
```

安装后，`~/.hermes/skills/obsidian-vault/` 目录下的 SKILL.md 将替代本桥接文件的方案 A。

---

## 与 llm-wiki 的边界

| 场景 | 用 obsidian-vault | 用 llm-wiki |
|------|------------------|-------------|
| 快速记一条笔记 | ✅ 首选 | ❌ |
| 读一篇已有笔记 | ✅ | ❌ |
| 摄入资料到知识库 | ❌ | ✅ ingest |
| 搜索 + 综合回答 | ❌ | ✅ query |
| 修改/追加笔记 | ✅ | ❌ |

这条边界在 route-obsidian 的路由表中已经定义。如果 dispatch 出错，请检查路由分类。
