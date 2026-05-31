#!/usr/bin/env python3
"""格式化飞书文档 Markdown：提升时间范围和星期几为对应标题层级。

规则：
  - 周时间范围（5.6-5.9、5.11-5.15 等）→ ## 二级标题
  - 入职第X周 → ## 二级标题
  - 星期几（周一~周六）→ ### 三级标题
  - 下周计划 → ### 三级标题
  - 挂车起号思路 → ## 二级标题
  - 第一周无显式标题时自动补 ## 入职第一周
  - 已有 ## 或 ### 的行不重复处理
"""

import re
import sys
import argparse
from pathlib import Path


def format_headings(text: str) -> tuple[str, list[str]]:
    """对 markdown 文本逐行应用标题格式化规则。
    
    Returns:
        (formatted_text, changes) — 格式化后的文本和变更日志
    """
    lines = text.split('\n')
    changes = []
    output = []
    first_week_added = False
    
    for i, line in enumerate(lines):
        original = line
        stripped = line.strip()
        
        # 跳过已经是标题的行和代码块
        if stripped.startswith('#') or stripped.startswith('```'):
            output.append(line)
            continue
        
        # 跳过空行
        if not stripped:
            output.append(line)
            continue
        
        # Rule 1: 周时间范围（含加粗变体）→ ##
        # 支持三种日期格式：5.11-5.15 / 5.18-22 / 5.6-5.9
        # 只匹配：独立日期范围 / 日期范围+第X周 / 日期范围+工作记录
        # 排除：日期范围+任务描述（如 **5.20-6.10 号邮寄...**，跨月=任务项）
        DATE_RANGE = r'\d+\.\d+-\d+(?:\.\d+)?'  # 5.18-22 or 5.18-5.22
        WEEK_SUFFIX = r'(?:第[一二三四五六七八九十]+周.*|工作记录.*)'
        
        # 加粗格式：**5.11-5.15** 或 **5.18-22 第三周工作记录**
        m = re.match(
            fr'^\*\*({DATE_RANGE})\s*({WEEK_SUFFIX})?\*\*$',
            stripped)
        if m:
            suffix = m.group(2) or ''
            output.append(f'## {m.group(1)} {suffix}'.rstrip())
            inner = stripped.strip('*')
            changes.append(f'L{i+1}: **{inner}** → ##')
            continue
        
        # 非加粗独立行：5.6-5.9 工作记录
        m = re.match(
            fr'^({DATE_RANGE})\s+({WEEK_SUFFIX})$',
            stripped)
        if m:
            output.append(f'## {m.group(1)} {m.group(2)}')
            changes.append(f'L{i+1}: {stripped} → ##')
            continue
        
        # Rule 2: 入职第X周 → ##
        m = re.match(r'^(入职第[一二三四五六七八九十百]+周.*)$', stripped)
        if m:
            output.append(f'## {m.group(1)}')
            changes.append(f'L{i+1}: {m.group(1)} → ##')
            continue
        
        # Rule 3: 星期几 → ###（兼容 **周一** 加粗格式）
        m = re.match(r'^\*{0,2}(周[一二三四五六日](?:\s*\+\s*周[一二三四五六日])?)(?:：.*)?\*{0,2}$', stripped)
        if m:
            output.append(f'### {m.group(1)}')
            changes.append(f'L{i+1}: {m.group(1)} → ###')
            # Rule 4: 第一个 ### 之前如果没有 ## 则插入 ## 入职第一周
            if not first_week_added:
                # 检查前面所有 output 行中是否有 ## 
                has_h2 = any(ol.strip().startswith('## ') for ol in output[:-1])
                if not has_h2:
                    # 在第一个 ### 之前插入
                    output.insert(-1, '## 入职第一周')
                    changes.append(f'L{i+1}: 自动补 ## 入职第一周')
                    first_week_added = True
            continue
        
        # Rule 5: 下周计划 → ###
        if stripped == '下周计划':
            output.append('### 下周计划')
            changes.append(f'L{i+1}: 下周计划 → ###')
            continue
        
        # Rule 6: 挂车起号思路 → ##
        if stripped == '挂车起号思路':
            output.append('## 挂车起号思路')
            changes.append(f'L{i+1}: 挂车起号思路 → ##')
            continue
        
        # 保持原样
        output.append(line)
    
    return '\n'.join(output), changes


def main():
    parser = argparse.ArgumentParser(description='格式化飞书文档 Markdown 标题层级')
    parser.add_argument('--input', '-i', required=True, help='输入 Markdown 文件路径')
    parser.add_argument('--inplace', action='store_true', help='原地覆盖输入文件')
    parser.add_argument('--output', '-o', help='输出文件路径（默认覆盖输入文件）')
    args = parser.parse_args()
    
    input_path = Path(args.input)
    if not input_path.exists():
        print(f'错误：输入文件不存在 {args.input}', file=sys.stderr)
        sys.exit(1)
    
    text = input_path.read_text(encoding='utf-8')
    formatted, changes = format_headings(text)
    
    output_path = Path(args.output) if args.output else input_path
    
    output_path.write_text(formatted, encoding='utf-8')
    
    print(f'格式化完成：{input_path.name}')
    print(f'变更 {len(changes)} 处：')
    for c in changes:
        print(f'  {c}')
    print(f'输出：{output_path}')


if __name__ == '__main__':
    main()
