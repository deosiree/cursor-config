---
name: reasonix-dispatcher
description: 智能任务分发引擎。编码/问答/分析类任务**必须**自动路由到 Reasonix 执行（利用 DeepSeek prefix cache），Gateway 类任务留在 Hermes。触发词：用 Reasonix、派 Reasonix、分发任务、dispatch、自动路由、省 token、缓存优化、推理优先、跑代码、分析代码、debug、重构、写脚本、**排名、排行、排序、查询、统计、count、排行榜**。
---

# Reasonix Dispatcher — 智能路由引擎

当收到编码/问答/分析类请求时，自动通过 `reasonix-dispatcher.py` 路由到 Reasonix 执行，利用其 Immutable Prefix + Append-Only Log 实现 >90% 前缀缓存命中。Hermes 只做轻量编排。

## 核心理念

```mermaid
flowchart TD
    User[用户提问] --> Classify{classify()}
    Classify -->|orchestration| Hermes[Hermes 主模型<br/>轻量回复]
    Classify -->|code/qa/analysis| Check{is_available?}
    Check -->|否| Hermes
    Check -->|是| Loaded{已有 skill?}
    Loaded -->|有| Bridge[skill-bridge 同步<br/>SKILL.md → .skills/]
    Loaded -->|无| Dispatch[dispatch]
    Bridge --> Dispatch
    Dispatch --> Reasonix[reasonix run<br/>cache >55% after warmup]
    Reasonix -->|成功| Reply[整理输出 → 回复用户]
    Reasonix -->|失败| Fallback[hermes_fallback<br/>Hermes 主模型兜底]
```

**关键约束**：每次 decision point 使用 `classify()`（零 LLM 规则引擎），不消耗 token。reasonix 不可用时透明 fallback，零侵入。

## 前置条件

- Reasonix 已安装: `reasonix --version`
- 环境变量: `DEEPSEEK_API_KEY`（通过 Hermes .env 继承）

## 操作

### 1. 使用 Dispatcher（推荐方式）

```python
# 引入
from scripts.reasonix_dispatcher import dispatch, classify, is_available

# 检测意图
intent = classify("帮我写个 Python 脚本")
# → "code"

# 分发任务（带 skill 桥接）
result = dispatch(
    query="帮我写个 Python 脚本读取 CSV",
    loaded_skills=["write-skill"],  # 可选：传入已加载的 Hermes skill
    workdir="/root/.hermes"
)
# → result = {"route": "reasonix", "intent": "code", "skill_used": "write-skill", ...}

# 检查 Reasonix 是否可用
if is_available():
    # 走 reasonix
    pass
else:
    # 静默回退 Hermes
    pass
```

### 2. CLI 模式

```bash
# 基础分发
python3 ~/.hermes/skills/devops/reasonix-dispatcher/scripts/reasonix-dispatcher.py \
  "帮我写个脚本" --workdir /root/.hermes

# 带 skill 桥接
python3 ~/.hermes/skills/devops/reasonix-dispatcher/scripts/reasonix-dispatcher.py \
  "分析这个架构" --skill darwin-skill --workdir /mnt/c/.../repo
```

### 3. Skill Bridge（Hermes skill → Reasonix playbook）

当 Hermes 加载了一个 skill 且命中 Reasonix 意图时，把 skill 内容同步到 Reasonix 的 `.skills/` 目录，使 Reasonix 的 `/skill <name>` 命令也能加载它：

```bash
# 桥接到项目目录
bash ~/.hermes/skills/devops/reasonix-dispatcher/scripts/skill-bridge.sh \
  reasonix-dispatcher /mnt/c/.../repo

# 然后在 Reasonix 中：
# /skill reasonix-dispatcher && 帮我写个脚本
```

## Agent 自动执行规则（强制）

> 🚨 **本 skill 被加载后，必须对每条用户消息执行以下检查。违反规则直接使用 `terminal()`/`patch()`/`write_file()` 跳过 dispatch 是违规操作，会烧 token。**

### 步骤 A：意图检测（每次回复前必做）

对用户本次消息调用：

```python
from scripts.reasonix_dispatcher import classify, dispatch, is_available
intent = classify(用户消息)
```

| 返回 | 含义 | 必须执行 |
|------|------|---------|
| `'code'` | 编码类 | ↓ 继续步骤 B |
| `'qa'` | 问答类 | ↓ 继续步骤 B |
| `'analysis'` | 分析类 | ↓ 继续步骤 B |
| `'orchestration'` | 编排/网关 | ⛔ 跳过，走 Hermes 主模型 |

🔴 **CHECKPOINT：intent 为 `code`|`qa`|`analysis` 时，**必须**调用 `dispatch()`，不得跳过。**

### 步骤 B：调 Dispatcher

```python
if intent in ('code', 'qa', 'analysis'):
    result = dispatch(
        query=用户消息,
        loaded_skills=[当前已加载的 skill 名列表],  # 忠实传入
        workdir="/root/.hermes"
    )
```

### 步骤 C：检查返回值

🛑 **STOP：dispatch 返回后，检查 `result["route"]`：**

| route | 必须做的事 |
|-------|-----------|
| `'reasonix'` | 用 `result["reasonix_output"]` 的内容回复用户 |
| `'hermes'` | intent=orchestration 的正常回退 |
| `'hermes_fallback'` | Reasonix 失败，走 Hermes 主模型兜底 |

### 违规检查清单

在回复用户之前，逐项自查：

```
□ 我对用户消息调用了 classify()    ← 必须做
□ 如果 intent='code'|'qa'|'analysis'，我调用了 dispatch()  ← 必须做，不可跳过
□ 我没有直接用 terminal/patch/write_file 代替 dispatch
□ 如果不确定命中哪个 skill → 先 skill_view 加载，再 dispatch(loaded_skills=[...])
```

> 任何一项为 ❌ → **先执行 dispatch，再回复**。

## 失败处理

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| reasonix 未安装 | `is_available()` 返回 False | 静默回退 Hermes，不报错 |
| reasonix run 超时（>180s） | 中断执行，返回 `route: hermes_fallback` | 走 Hermes 主模型处理 |
| reasonix run 非零退出 | `[WARN]` 输出到 stderr | `route: hermes_fallback` |
| reasonix 返回空输出 | 检查 stderr 是否有实际错误 | 空输出时走 Hermes 再试一次 |
| skill SKILL.md 找不到 | 跳过 skill 桥接（仍走纯 Reasonix） | 不影响主流程 |
| dispatcher 内部异常 | catch-all，不崩溃 | `route: hermes` + error 字段 |
| 网络/代理问题（reasonix 超时级联） | 重试 1 次（总计 timeout=180s） | 仍失败 → `hermes_fallback` |
| `classify()` 误判（orchestration 错判为 code） | 非破坏性——最多多花一次编排 token | 用户不会感知异常 |

## 不做什么

| 反模式 | 为什么不做 |
|--------|-----------|
| 用 LLM 做 intent detection | 本为了省 token，先花一笔判断 |
| dispatch 飞书/Gateway 任务 | Gateway 不需要 DeepSeek cache |
| 不设 timeout | reasonix run 可能卡死 |
| 忽略 Reasonix 原生 skill 机制 | `/skill <name>` 是 Reasonix 原生能力，应该用 |
| 多个任务塞进同一 reasonix run | 混在一起 → cache 失效 |
| 修改 Hermes system prompt 动态内容 | 破坏 DeepSeek 字节级 prefix cache |
| 在 reasonix run task 里混入 WSL 特有路径 | Reasonix 可能在其他环境执行，路径不通用 |
| **dispatcher.py 不检查 intent gate**（orchestration 仍走 Reasonix） | 白烧 token，`classify()` 已返回 orchestration 但 dispatch() 忽略 |
| **Agent 绕过 dispatch，直接用 `terminal()`/`patch()`/`write_file()` 执行任务** | 本 skill 的核心价值就失效了——省 token 的逻辑从未被执行 |

## 关联文件

| 文件 | 用途 |
|------|------|
| `[[scripts/reasonix-dispatcher.py]]` | 核心分发引擎 |
| `[[scripts/skill-bridge.sh]]` | SKILL.md → Reasonix .skills/ 桥接 |
| `[[assets/frontmatter-template.yaml]]` | frontmatter 模板 |
| `[[references/intent-gate-architecture.md]]` | intent gate 架构决策记录（含 bug 发现过程） |
| `[[templates/before]]` | 改前：Hermes 全程跑 |
| `[[templates/after]]` | 改后：Reasonix 委派 |

## 使用示例

```text
用户：帮我用 Python 写个脚本分析 CSV
Agent：
  1. classify → "code"
  2. is_available → True
  3. dispatch(query="帮我用 Python 写个脚本分析 CSV")
  4. result["route"] = "reasonix"
  5. 把 result["reasonix_output"] 整理后回复用户
  （推理在 Reasonix 里完成，Hermes 只编排和转发）
```
