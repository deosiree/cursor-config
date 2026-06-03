#!/usr/bin/env python3
"""
通用网页剪藏提取器 - 将 URL 内容保存为 Obsidian 笔记。
不依赖三方库，仅用 Python 标准库。

用法：
  python3 clip_web.py https://example.com/article
  python3 clip_web.py https://mp.weixin.qq.com/s/xxx -o /path/to/vault/Clippings/
"""
import re
import os
import sys
import json
import html
import urllib.request
import urllib.error
from datetime import date
from pathlib import Path


def fetch_html(url: str) -> str:
    """下载网页 HTML，带 User-Agent 绕过基础反爬"""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
        # 尝试从 header 获取编码
        charset = resp.headers.get_content_charset() or "utf-8"
        return raw.decode(charset, errors="replace")


def extract_title(content: str) -> str:
    """从 HTML 中提取标题"""
    patterns = [
        r'var msg_title\s*=\s*["\'](.*?)["\']',
        r'<meta\s+property="og:title"\s+content="(.*?)"',
        r'<title>(.*?)</title>',
        r'<h1[^>]*>(.*?)</h1>',
        r'"title":"(.*?)"',
        r'"headline":"(.*?)"',
    ]
    for pat in patterns:
        m = re.search(pat, content, re.DOTALL | re.IGNORECASE)
        if m:
            t = m.group(1).strip()
            if t:
                return html.unescape(t)
    return "未知标题"


def extract_author(content: str) -> str:
    """从 HTML 中提取作者"""
    patterns = [
        r'var msg_author\s*=\s*["\'](.*?)["\']',
        r'<meta\s+name="author"\s+content="(.*?)"',
        r'"author":"(.*?)"',
        r'byline.*?>(.*?)<',
    ]
    for pat in patterns:
        m = re.search(pat, content, re.DOTALL | re.IGNORECASE)
        if m:
            a = m.group(1).strip()
            if a:
                return html.unescape(a)
    return ""


def extract_body(content: str) -> str:
    """从 HTML 中提取正文"""
    # 优先尝试微信公众号的 js_content
    m = re.search(r'id="js_content"[^>]*>(.*?)</div>', content, re.DOTALL)
    if m:
        inner = m.group(1)
    else:
        # 尝试其他常见容器
        for div_id in ["article-content", "article", "content", "main", "post"]:
            m = re.search(
                rf'id="{div_id}"[^>]*>(.*?)</div>', content, re.DOTALL
            )
            if m:
                inner = m.group(1)
                break
            m = re.search(
                rf'class="[^"]*{div_id}[^"]*"[^>]*>(.*?)</div>',
                content, re.DOTALL,
            )
            if m:
                inner = m.group(1)
                break
        else:
            # 降级到 body
            m = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
            inner = m.group(1) if m else content

    # 清洗 HTML → 近似 Markdown
    inner = re.sub(r'<br\s*/?>', "\n", inner)
    inner = re.sub(r'<p[^>]*>', "\n\n", inner)
    inner = re.sub(r'</p>', "", inner)
    inner = re.sub(r'<section[^>]*>', "\n\n", inner)
    inner = re.sub(r'</section>', "", inner)
    inner = re.sub(r'<div[^>]*>', "\n", inner)
    inner = re.sub(r'</div>', "\n", inner)
    inner = re.sub(r'<strong[^>]*>', "**", inner)
    inner = re.sub(r'</strong>', "**", inner)
    inner = re.sub(r'<em[^>]*>', "*", inner)
    inner = re.sub(r'</em>', "*", inner)
    inner = re.sub(r'<h([1-6])[^>]*>', lambda m: "\n" + "#" * int(m.group(1)) + " ", inner)
    inner = re.sub(r'</h[1-6]>', "", inner)
    inner = re.sub(r'<li[^>]*>', "- ", inner)
    inner = re.sub(r'</li>', "", inner)
    inner = re.sub(r'<[^>]+>', "", inner)  # 移除剩余标签
    inner = html.unescape(inner)
    # 合并多余空行
    inner = re.sub(r"\n{4,}", "\n\n", inner)
    inner = re.sub(r"[ \t]+", " ", inner)
    return inner.strip()


def safe_filename(title: str, max_len: int = 80) -> str:
    """将标题转为安全的文件名"""
    # 替换非法字符
    safe = re.sub(r'[\\/:*?"<>|]', "-", title)
    safe = re.sub(r"\s+", " ", safe).strip()
    safe = safe.replace('"', "'")
    if len(safe) > max_len:
        safe = safe[:max_len].rstrip("- ")
    return safe


def make_note(url: str, title: str, author: str, body: str) -> str:
    """组装 Obsidian Markdown 笔记"""
    today = date.today().isoformat()
    parts = [
        "---",
        f'source: "{url}"',
        f'title: "{title}"',
        f"clipped: {today}",
        "tags: [clipped, web]",
        "---",
        "",
        f"# {title}",
        "",
        body,
        "",
        "---",
        f"*原文链接：{url}*",
        "",
    ]
    if author:
        parts.insert(4, f'author: "{author}"')
    return "\n".join(parts)


def main():
    if len(sys.argv) < 2:
        print("用法: python3 clip_web.py <URL> [-o <输出目录>]")
        sys.exit(1)

    url = sys.argv[1]
    output_dir = Path(
        sys.argv[sys.argv.index("-o") + 1]
        if "-o" in sys.argv
        else "/mnt/d/FILE/Obsidian Vault/Clippings"
    )

    print(f"📥 正在下载: {url}")
    html_content = fetch_html(url)
    print(f"✅ 下载完成 ({len(html_content)} chars)")

    title = extract_title(html_content)
    author = extract_author(html_content)
    body = extract_body(html_content)

    print(f"📝 标题: {title}")
    if author:
        print(f"👤 作者: {author}")
    print(f"📄 正文: {len(body)} chars")

    if len(body) < 100:
        print("⚠️  正文过短（<100 字），可能是动态 SPA 页面")
        print("   建议使用 browser 工具获取渲染后内容")

    # 限制正文长度
    if len(body) > 50000:
        body = body[:50000] + "\n\n*[内容已截断，超过 50000 字符]*"
        print("⚠️  正文已截断至 50000 字符")

    note = make_note(url, title, author, body)
    filename = safe_filename(title) + ".md"
    filepath = output_dir / filename

    output_dir.mkdir(parents=True, exist_ok=True)
    filepath.write_text(note, encoding="utf-8")
    print(f"💾 已保存: {filepath}")
    print(f"✅ 完成! ({len(note)} chars)")


if __name__ == "__main__":
    main()
