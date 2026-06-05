#!/usr/bin/env python3
"""Hermes→Reasonix Intelligent Task Dispatcher.

Routes coding/QA/analysis requests to Reasonix (DeepSeek-powered) via keyword-based
intent detection, prepends skill activations, extracts file operations from output.
"""

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

# ── Intent Classification ──────────────────────────────────────────────

KEYWORDS_CODE = {
    '写', '改', '修', '建', '实现', '重构', 'fix', 'bug', 'debug',
    'create', 'edit', 'refactor', 'implement', '修改', '编写',
}
KEYWORDS_QA = {
    '分析', '调研', '比较', '为什么', '怎么', '原理', '架构',
    'compare', 'why', 'how', 'analyze', '解释', '描述', '说明',
}
KEYWORDS_ORCHESTRATION = {
    '发消息', 'cron', 'config', 'skill管理', '飞书', '推送', '启动',
    '部署', 'git', '调度', '任务', '定时',
}


def classify(query: str) -> str:
    """Return one of 'code', 'qa', 'analysis', 'orchestration'.

    Uses pure keyword matching — zero LLM calls.
    """
    q_lower = query.lower()

    code_set = {w.lower() for w in KEYWORDS_CODE}
    qa_set = {w.lower() for w in KEYWORDS_QA}
    orch_set = {w.lower() for w in KEYWORDS_ORCHESTRATION}

    def contains_any(text: str, kws: set) -> bool:
        return any(kw in text for kw in kws)

    if contains_any(q_lower, orch_set):
        return 'orchestration'
    if contains_any(q_lower, code_set):
        return 'code'
    if contains_any(q_lower, qa_set):
        return 'qa'
    return 'analysis'


# ── Skill Bridge ───────────────────────────────────────────────────────

def _resolve_skill_dir(skill_name: str):
    """Search ~/.hermes/skills/**/<skill_name>/SKILL.md."""
    skills_root = Path.home() / '.hermes' / 'skills'
    if not skills_root.is_dir():
        return None
    for candidate in skills_root.rglob(f'{skill_name}/SKILL.md'):
        if candidate.is_file():
            return candidate
    return None


def _load_skill_context(skill_name: str) -> str | None:
    """Read SKILL.md content for a skill, return as string or None."""
    skill_path = _resolve_skill_dir(skill_name)
    if skill_path is None:
        return None
    try:
        return skill_path.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return None


def _build_reasonix_task(query: str, loaded_skills: list[str]) -> str:
    """Prepend '/skill <name> && ' for each loaded skill."""
    task = query
    for skill_name in reversed(loaded_skills):
        task = f'/skill {skill_name} && {task}'
    return task


# ── File Operation Extraction ─────────────────────────────────────────

_FILE_BLOCK_RE = re.compile(
    r'```(?P<filename>[^\n]*?)\n(?P<content>.*?)```',
    re.DOTALL
)


def _extract_file_ops(text: str) -> list[dict]:
    """Parse Reasonix output for code blocks with filenames.

    Returns list of {"action": "write", "path": ..., "content": ...}.
    """
    ops = []
    for match in _FILE_BLOCK_RE.finditer(text):
        filename = match.group('filename').strip()
        content = match.group('content')
        if filename and content:
            if '/' in filename or '.' in filename:
                ops.append({
                    'action': 'write',
                    'path': filename,
                    'content': content,
                })
    return ops


# ── Reasonix Execution ────────────────────────────────────────────────

def is_available() -> bool:
    """Check if 'reasonix' command is on PATH and executable."""
    try:
        subprocess.run(
            ['reasonix', '--version'],
            capture_output=True,
            timeout=5,
        )
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired, Exception):
        return False


def _run_reasonix(task: str, cwd: str | None = None) -> dict:
    """Execute `reasonix run <task>` with timeout.

    Returns dict with keys: exit_code, stdout, stderr.
    """
    try:
        proc = subprocess.run(
            ['reasonix', 'run', task],
            capture_output=True,
            timeout=180,
            cwd=cwd,
            text=True,
        )
        return {
            'exit_code': proc.returncode,
            'stdout': proc.stdout or '',
            'stderr': proc.stderr or '',
        }
    except FileNotFoundError:
        return {'exit_code': -1, 'stdout': '', 'stderr': 'reasonix not found'}
    except subprocess.TimeoutExpired:
        return {'exit_code': -2, 'stdout': '', 'stderr': 'timeout (180s)'}
    except Exception as e:
        return {'exit_code': -3, 'stdout': '', 'stderr': str(e)}


# ── Public API ─────────────────────────────────────────────────────────

def dispatch(
    query: str,
    loaded_skills: list[str] | None = None,
    workdir: str | None = None,
) -> dict:
    """Main dispatch function.

    Args:
        query: The user query / task description.
        loaded_skills: Optional list of skill names to activate.
        workdir: Working directory for subprocess (default: None).

    Returns:
        dict with keys: route, intent, skill_used, reasonix_output,
                        file_ops, elapsed_seconds, error, cache_hint
    """
    start_time = time.time()
    result: dict = {
        'route': 'hermes',
        'intent': 'analysis',
        'skill_used': None,
        'reasonix_output': None,
        'file_ops': [],
        'elapsed_seconds': 0.0,
        'error': None,
        'cache_hint': 'Reasonix immutable prefix ≥95% after warmup',
    }

    try:
        intent = classify(query)
        result['intent'] = intent

        # Skill bridge
        skill_used = None
        final_task = query
        if loaded_skills and len(loaded_skills) > 0:
            skill_used = loaded_skills[0]
            final_task = _build_reasonix_task(query, loaded_skills)
            skill_context = _load_skill_context(skill_used)
            if skill_context:
                final_task += f'\n\n# Skill context ({skill_used}):\n{skill_context}'

        result['skill_used'] = skill_used

        # ⛔ Intent gate: orchestration 类不走 Reasonix（省 token，不走 Cache）
        if intent == 'orchestration':
            result['route'] = 'hermes'
            return result

        if not is_available():
            result['route'] = 'hermes'
            result['error'] = 'reasonix command not found on PATH'
            return result

        exec_result = _run_reasonix(final_task, workdir)
        elapsed = time.time() - start_time
        result['elapsed_seconds'] = round(elapsed, 3)

        exec_code = exec_result['exit_code']
        stdout = exec_result['stdout']
        stderr = exec_result['stderr']

        if exec_code == -1:
            result['route'] = 'hermes'
            result['error'] = 'reasonix not found'
        elif exec_code == -2:
            result['route'] = 'hermes_fallback'
            result['reasonix_output'] = '[TIMEOUT]'
            result['error'] = 'Reasonix execution timed out (180s)'
        elif exec_code != 0:
            warning_msg = f'Reasonix exit code {exec_code}: {stderr[:500]}'
            print(f'[WARN] {warning_msg}', file=sys.stderr)
            result['route'] = 'hermes_fallback'
            result['reasonix_output'] = stdout or stderr
            result['error'] = warning_msg
        else:
            result['route'] = 'reasonix'
            result['reasonix_output'] = stdout

        if stdout:
            file_ops = _extract_file_ops(stdout)
            result['file_ops'] = file_ops

    except Exception as e:
        result['route'] = 'hermes'
        result['error'] = f'Unhandled exception in dispatcher: {e}'
        if result['elapsed_seconds'] == 0.0:
            result['elapsed_seconds'] = round(time.time() - start_time, 3)

    return result


# ── CLI Mode ───────────────────────────────────────────────────────────

def _cli():
    import argparse

    parser = argparse.ArgumentParser(
        description='Hermes→Reasonix Dispatcher CLI'
    )
    parser.add_argument('query', help='Task / query to dispatch')
    parser.add_argument(
        '--skill', '-s',
        help='Comma-separated list of loaded skill names',
        default='',
    )
    parser.add_argument(
        '--workdir', '-w',
        help='Working directory for Reasonix subprocess',
        default=None,
    )
    args = parser.parse_args()

    skills = [s.strip() for s in args.skill.split(',') if s.strip()] if args.skill else []
    result = dispatch(args.query, loaded_skills=skills, workdir=args.workdir)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    _cli()
