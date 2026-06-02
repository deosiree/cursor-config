---
name: Obsidian-剪藏网页
description: 使用 curl + Python 提取网页正文，保存为 Obsidian 笔记到 Vault Clippings 目录。支持微信公众号文章、普通博客、技术文档等。适用于将任意网页内容剪藏到本地 Obsidian 知识库。触发词：剪藏网页、网页剪藏、Obsidian 剪影、web clipping、save to obsidian、clip page。
should-trigger:
  - prompt 含 "剪藏"/"剪影" + URL
  - prompt 含 "保存到 Obsidian" + URL
  - prompt 含 "clip page" 或 "web clipping" + URL
  - prompt 含 "下载网页" + "Obsidian" + URL
  - "把 [URL] 存到 Obsidian"
should-not-trigger:
  - 用户只给了 URL 不要求保存（如 "看看这个网站"）
  - 用户要求保存到本地文件系统而非 Obsidian
  - 用户要求下载视频/音频而非网页文本
  - prompt 不含 URL
---

# Obsidian-剪藏网页

> **定位：** 将 URL 网页内容提取为结构化 Markdown，保存到 Obsidian Vault 的 Clippings/ 目录。
> **依存：** curl + Python3 标准库（无需额外安装）

## RED（失败基线）

- 直接用 `curl URL` 拿到公众号 SPA 空壳 → 无正文
- 对动态页面只用正则提取 → 丢失格式
- 用临时文件名保存 → 无法溯源到原文

## GREEN（执行主线）

### 前置条件

```bash
# curl 和 python3 应可用
curl --version >/dev/null 2>&1 && python3 --version >/dev/null 2>&1
```

### 步骤 1：下载 HTML

```bash
curl -s -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -H "Accept: text/html,application/xhtml+xml" \
  "$URL" -o /tmp/wechat_clip.html
```

### 步骤 2：Python 提取正文

```python
import re, html, json

with open('/tmp/wechat_clip.html', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# 提取标题
title = ''
for pat in [r'var msg_title = ["\'](.*?)["\']', r'<title>(.*?)</title>', 
            r'og:title.*?content="(.*?)"', r'<h1[^>]*>(.*?)</h1>']:
    m = re.search(pat, content, re.DOTALL)
    if m: title = m.group(1).strip(); break

# 提取正文（优先微信公众号 js_content）
for div_id in ['js_content', 'article-content', 'article', 'content', 'main']:
    pat = rf'id="{div_id}"[^>]*>(.*?)</div>'
    m = re.search(pat, content, re.DOTALL)
    if m:
        inner = m.group(1)
        break
else:
    # 降级：body 全文
    m = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    inner = m.group(1) if m else content

# 清洗 HTML → Markdown 风格
inner = re.sub(r'<br\s*/?>', '\n', inner)
inner = re.sub(r'<p[^>]*>', '\n', inner)
inner = re.sub(r'</p>', '', inner)
inner = re.sub(r'<strong[^>]*>', '**', inner)
inner = re.sub(r'</strong>', '**', inner)
inner = re.sub(r'<[^>]+>', '', inner)
inner = html.unescape(inner)
inner = re.sub(r'\n{3,}', '\n\n', inner)
inner = re.sub(r'[ \t]+', ' ', inner)
inner = inner.strip()
```

### 步骤 3：写入 Obsidian Clippings

```bash
VAULT_DIR="/mnt/d/FILE/Obsidian Vault/Clippings"
# 清理文件名（去除特殊字符，限制长度）
SAFE_NAME=$(echo "$TITLE" | sed 's/[\\/:*?"<>|]//g' | cut -c1-80)
python3 -c "
import os
note = '''---
source: \"$URL\"
title: \"$TITLE\"
clipped: $(date +%Y-%m-%d)
tags: [clipped, web]
---

# $TITLE

$(cat /tmp/cleaned_body.txt)

---
*原文链接：$URL*
'''
path = os.path.join('$VAULT_DIR', '$SAFE_NAME.md')
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w', encoding='utf-8') as f:
    f.write(note)
print(f'Saved: {path}')
"
```

### 步骤 4：验证

```bash
ls -la "/mnt/d/FILE/Obsidian Vault/Clippings/$SAFE_NAME.md"
# 检查文件大小 > 0
# 检查 frontmatter 完整性
```

## 微信公众号文章特殊处理

WeChat 文章 (`mp.weixin.qq.com`) 特征：

1. 正文在 `<div id="js_content">` 中
2. 标题在 `var msg_title = '...'` 变量中
3. 作者在 `var msg_author = '...'` 变量中
4. 有时需要处理 HTML 实体编码
5. 部分文章需要 `poc_token` 参数 → 需从页面重定向获取

**回退策略：** 如果 js_content 为空，尝试用浏览器工具（browser_navigate + browser_snapshot）获取动态渲染内容。

## 检查点

- **URL 验证：** 确认 `URL` 变量已设置，格式 `http://` 或 `https://`
- **编码检测：** 如果正文乱码，检查 charset，尝试 `--data-binary` 带 charset
- **空内容：** 提取正文<100 字 → 警告+切换 browser 方案
- **重复剪藏：** 检查 Clippings 目录是否已有同名文件，补充时间戳

## 约束

- 文件路径必须在 `/mnt/d/FILE/Obsidian Vault/Clippings/` 下
- 文件名≤80 字符，仅保留字母数字中文和 `-_`
- 正文超过 50000 字符时自动截断
- 不处理登录后页面（需要 cookie 的 URL 会失败）

## Pitfalls

| 陷阱 | 表现 | 解决 |
|------|------|------|
| 公众号反爬 | curl 返回验证页面 | 换 User-Agent 或使用 browser 工具 |
| 动态渲染 SPA | 正文为空 | 回退到 browser_navigate 方案 |
| 编码问题 | 中文乱码 | 用 `chardet` 检测或 `errors='replace'` |
| 路径空格 | shell 脚本报错 | 用双引号包路径，或在 Python 内处理 |
| 标题含 `/` | 创建子目录 | 用 sed 替换 `/` 为 `-` |

## REFACTOR（维护者参考）

- 新增网站类型（如知乎、掘金）→ 在步骤 2 添加对应 `div_id` 识别
- 提取逻辑变长 → 独立为 `references/` 子文件
