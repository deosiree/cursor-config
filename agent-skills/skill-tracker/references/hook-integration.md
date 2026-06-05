# 自动递增 Hook 集成说明

## 架构概览

```
skill_view(name="xxx")          # Agent 调用
        │
        ▼
_skill_view_with_bump(args)     # tools/skills_tool.py:1492 — Hermes 原生包装
        │
        ├──▶ bump_view()        # tools/skill_usage.py:408 — 记录 view_count + last_viewed_at
        ├──▶ bump_use()         # tools/skill_usage.py:416 — 记录 use_count + last_used_at
        └──▶ skill-increment.py # ~/.hermes/scripts/skill-increment.py — 同步 track.tsv
                                    ↑ 本 LFU 系统追加的 Hook
```

## 关键发现

Hermes 核心代码已经内置了 skill 使用统计机制，无需从头造轮子：

| 组件 | 位置 | 作用 |
|------|------|------|
| `_skill_view_with_bump` | `tools/skills_tool.py:1492` | skill_view 的包装函数，每次成功加载后触发统计 |
| `bump_use()` | `tools/skill_usage.py:416` | 递增 `use_count`、更新 `last_used_at` |
| `bump_view()` | `tools/skill_usage.py:408` | 递增 `view_count`、更新 `last_viewed_at` |
| `.usage.json` | `~/.hermes/skills/.usage.json` | 侧边 JSON 文件，持久化所有 skill 的统计记录 |

## 本系统追加的 Hook 代码

在 `tools/skills_tool.py` 的 `_skill_view_with_bump` 函数末尾追加（第1512-1518行）：

```python
# Also increment our LFU skill-track.tsv (best-effort)
import subprocess, os
_increment_script = os.path.expanduser("~/.hermes/scripts/skill-increment.py")
if os.path.exists(_increment_script):
    subprocess.run(
        ["python3", _increment_script, str(resolved)],
        capture_output=True, timeout=10,
    )
```

## 设计原则

- **Best-effort**：整个追加代码包裹在 `try/except: pass` 中，脚本失败不阻塞 skill_view
- **幂等**：skill-increment.py 的 TSV 操作是幂等的——同名 skill 重复调用只 +1
- **双轨并行**：Hermes 原生 `.usage.json`（curator 使用）+ 本系统 track.tsv（LFU 排名使用）互不干扰
- **无状态损失**：即使 track.tsv 被误删，.usage.json 仍保留完整历史，可从 curator 数据重建
