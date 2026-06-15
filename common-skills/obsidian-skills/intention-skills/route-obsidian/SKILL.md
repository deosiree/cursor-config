---
name: route-obsidian
description: Obsidian 技能路由器 — 根据请求类型 single-dispatch 到最合适的 feature skill，失败时切换人类回环而非链式 fallback。触发词：读/写/搜/修复 Obsidian 笔记、知识库管理。
---

# route-obsidian — Obsidian 技能路由器

> ⚡ **Single Dispatch**：每次调用只派发到一个子 skill，不做链式自动 fallback。
> 🚨 **Human Loop**：如果 dispatched skill 运行时失败，**不**自动尝试下一个，而是报告给用户做决策。
> 💰 **Token 止损**：如果累计 >20 个工具调用仍未解决 → 停止并给出中间结论。

---

## 任务分类

当用户请求涉及 Obsidian / 笔记 / 知识库时，先判断属于哪个类别：

| 类别 | 用户说的话（示例） |
|------|------------------|
| **读写笔记** | "新建笔记" "帮我读一下那篇" "把这段文本存到 Obsidian" "记录这个" |
| **检索知识** | "关于 X 我知道什么" "搜一下" "查资料" "找笔记" |
| **Vault 维护** | "修复 wikilink" "检查 frontmatter" "文件命名规范" " vault 体检" |
| **摄入知识** | "把这个网页存进来" "把这篇 PDF/文章摄入知识库" "剪藏" |
| **综合/对比/编译** | "总结一下关于 X 的内容" "对比 A 和 B" "用大白话解释" |

---

## 派发规则（严格遵循）

### 规则 A：Single Dispatch（强制）

根据上表选 **一个** 最匹配的类别，dispatch 到该类别对应的 **首选 skill**。

```
✅ 正确做法：
  分类 → load 一个 skill → 让它执行 → 等结果

❌ 错误做法：
  分类 → load skill A → 执行失败 → 自动 load skill B → load skill C → ...
```

### 规则 B：Max 1 Auto-Fallback（仅限可行性检查）

只有以下情况允许**一次**自动回退到次选：
- skill 的依赖未安装（如 Python 包缺失、CLI 工具不存在）
- skill 的配置文件不存在（如 `VAULT_ROOT` 未设置、`.env` 缺失）

**运行时失败**（skill 加载成功但执行结果报错）→ **不自动回退**，走规则 C。

### 规则 C：失败 → Human Loop（强制）

如果 dispatched skill 运行失败，按以下模板报告用户：

```
[skill名称] 尝试后失败，原因是：[具体原因]

可选方案：
- 试用 [次选 skill 名称]（不同实现路径）
- 自行手动操作
- 调整方案后重试

建议怎么做？
```

### 规则 D：Token 硬止损

如果你已经调用了超过 **20 个工具**仍未完成用户请求，停止并报告：

```
已尝试了多个方法仍未解决。当前进度：[中间结论]
需要你帮助决定下一步方向。
```

---

## 路由表

| 类别 | 首选 skill（← dispatch 目标） | 次选（仅可行性检查失败时） |
|------|-----------------------------|--------------------------|
| 📝 **读写笔记** | `feature-skills/obsidian-vault/SKILL.md`（文件 API，安全评分 90） | `feature-skills/llm-wiki/skills/wiki/SKILL.md` save 动词 |
| 🔍 **检索知识** | `feature-skills/llm-wiki/skills/wiki/SKILL.md` query 动词（4-Tier 检索链） | `feature-skills/qmd/SKILL.md`（如已安装）|
| 🔧 **Vault 维护** | `feature-skills/vault-maintainer/SKILL.md`（安全评分 100） | 无（失败即走 Human Loop）|
| 📥 **摄入知识** | `feature-skills/llm-wiki/skills/wiki/SKILL.md` ingest 动词（Gold In 过滤器） | `feature-skills/obsidian-vault/SKILL.md` |
| 🧠 **综合/对比/编译** | `feature-skills/llm-wiki/skills/wiki/SKILL.md` (synthesize / critique / compare / eli5) | 无（走 Human Loop）|

> **路径约定**：所有 `feature-skills/X` 是相对 `obsidian-skills/` 的相对路径。
> 完整路径：`common-skills/obsidian-skills/feature-skills/<skill-name>/SKILL.md`
> 注：llm-wiki 的 SKILL.md 位于 `feature-skills/llm-wiki/skills/wiki/SKILL.md`（submodule 内置路径）

---

## 执行流程

```
收到 Obsidian 相关请求
    ↓
Step 1: 判断类别（读写 / 检索 / 维护 / 摄入 / 综合）
    ↓
Step 2: 按路由表找到首选 skill（single dispatch）
    ↓
Step 3: 可行性检查
    ├─ 通过 → LOAD & RUN（跳 Step 4）
    └─ 失败 → Max 1 Fallback → 检查次选 skill 的可行性
        ├─ 次选通过 → LOAD & RUN
        └─ 次选也失败 → 走 Human Loop（报告用户）
    ↓
Step 4: skill 执行
    ├─ 成功 → 返回结果。✅ 完成
    └─ 失败 → 走 Human Loop（报告原因，询问是否试次选）
    ↓
Step 5: Token 监控
    累计 >20 工具调用仍未解决 → 停止并报告中间结论
```

---

## 注意事项

- **不要加载路由表之外的 skill**：如果你觉得另一个 skill 也能做，**不行**。只走路由表。
- **不要自己做**：route-obsidian 只做分发，**不执行具体操作**（不读文件、不写笔记、不执行命令）。
- **次选不是备胎**：次选只在可行性检查失败时使用。运行时失败 ≠ 自动换 skill。
- **每次只 dispatch 一次**：完成一个请求后，这个 route 的生命周期就结束了。下次请求重新走路由。
