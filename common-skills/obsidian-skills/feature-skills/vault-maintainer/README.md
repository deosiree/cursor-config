# vault-maintainer

> OpenClaw 出品，安装量 374K，安全评分 100。

## 作用

维护 Obsidian Vault 的兼容性：确保 wikilink、frontmatter、文件名全规范。

## 安装方式

### 方式一：Hermes Agent（推荐）

```bash
hermes skills install vault-maintainer
```

安装后文件位于 `~/.hermes/skills/vault-maintainer/`

### 方式二：手动复制

从已安装 Hermes 的机器上复制 `~/.hermes/skills/vault-maintainer/` 到此目录。

### 方式三：查找独立 repo

在 GitHub 搜索 `vault-maintainer openclaw` 查找最新版本。

## 路由状态

route-obsidian 路由表中 vault-maintainer 是 **Vault 维护类**的唯一首选，不可用时会走 Human Loop。
