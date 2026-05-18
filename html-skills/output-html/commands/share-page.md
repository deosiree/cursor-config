---
description: 部署生成的 HTML 页面到 Vercel 并返回实时 URL
---

# 分享 HTML 可视化页面

通过 Vercel 即时分享 HTML 文件。当安装了 Pi 兼容的 `vercel-deploy` 技能时，无需认证即可返回实时 URL。

## 使用方法

```
/share-page <文件路径>
```

**参数：**
- `文件路径` - 要分享的 HTML 文件路径（必需）

**示例：**
```
/share-page ~/.agent/diagrams/my-diagram.html
```

## 工作原理

1. 找到当前环境下的 `visual-explainer` 技能目录
2. 将你的 HTML 文件复制到临时目录作为 `index.html`
3. 通过 Pi 兼容的 `vercel-deploy` 技能部署
4. 立即返回实时 URL

## 要求

- **vercel-deploy 技能** - 部署必需。在 Pi 中：`pi install npm:vercel-deploy`

无需 Vercel 账户、Cloudflare 账户或 API 密钥。部署是"可认领的"——你可以在之后将其转移到你的 Vercel 账户。

## 脚本位置

通过已安装的技能目录解析脚本，然后用 HTML 文件路径运行：

```bash
bash ~/.pi/agent/skills/visual-explainer/scripts/share.sh <file>
```

## 输出

```
分享 my-diagram.html...

✓ 分享成功！

实时 URL:  https://skill-deploy-abc123.vercel.app
认领 URL: https://vercel.com/claim-deployment?code=...
```

## 注意事项

- 部署是**公开的**——任何有 URL 的人都可以查看
- 预览部署有可配置的保留期（默认：30 天）
- 每次分享创建一个新的部署和唯一 URL
