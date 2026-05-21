#!/usr/bin/env python3
"""校验播客朗读稿结构（通用性回归）。"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

BANNED_LABELS = ("定义", "问题", "解决", "价值")
BANNED_SPOKEN = tuple(f"{x}：" for x in BANNED_LABELS)


def parse_frontmatter(text: str) -> dict[str, str]:
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    out: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            out[k.strip()] = v.strip()
    return out


def expected_k(n: int) -> int:
    return min(max(3, n), 7)


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)

    if "knowledge_points" not in fm:
        errors.append("缺少 frontmatter: knowledge_points")
    else:
        try:
            n = int(fm["knowledge_points"])
        except ValueError:
            errors.append("knowledge_points 非整数")
            n = 0
        if "quick_qa_count" in fm:
            try:
                k = int(fm["quick_qa_count"])
                if k != expected_k(n):
                    errors.append(f"quick_qa_count={k} 应为 min(max(3,N),7)={expected_k(n)}")
            except ValueError:
                errors.append("quick_qa_count 非整数")

    if "卷首" not in text and "卷首要点" not in text:
        errors.append("缺少卷首区块（## 卷首要点）")
    if "快问快答" not in text:
        errors.append("缺少卷尾快问快答区块")

    for label in BANNED_SPOKEN:
        if label in text:
            errors.append(f"含禁止口播标签: {label}")

    if "**主播**" not in text or "**嘉宾**" not in text:
        errors.append("须含 **主播** 与 **嘉宾** 对白")

    if not re.search(r"###\s*铺垫", text) and "铺垫" not in text:
        errors.append("正文建议含「铺垫」小节（至少一处）")

    if fm.get("doc_type") and fm["doc_type"] not in (
        "面经",
        "技术方案",
        "教程",
        "参考",
    ):
        errors.append(f"doc_type 非常规值: {fm['doc_type']}")

    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description="校验播客朗读稿")
    parser.add_argument("md_path", type=Path)
    args = parser.parse_args()
    path = args.md_path.resolve()
    if not path.is_file():
        print(f"文件不存在: {path}", file=sys.stderr)
        sys.exit(2)

    errors = validate(path)
    if errors:
        print(f"校验失败: {path}")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    print(f"校验通过: {path}")


if __name__ == "__main__":
    main()
