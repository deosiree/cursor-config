---
name: skill-tracker
description: 维护 Top-30 常用 skill 的 LFU 缓存淘汰。当需要追踪 skill 使用次数、启用新 skill、踢出低使用率 skill、或手动触发重平衡时使用。触发词：track skill、skill 计数、更新 skill 使用、skill 淘汰、启用 skill、禁用 skill、重平衡 skill、skill rebalance、top-30、skill usage、使用次数。
---

# Skill Tracker — LFU 缓存维护

维护 `~/.hermes/skill-track.tsv`（使用计数表）和 `skills.disabled`（config.yaml 的禁用列表），实现动态 Top-30 常用 skill 自动切换。

**核心理念**：只保留最常使用的 30 个 skill 在 `available_skills` 中，其余禁用 → 每轮推理节省 ~25K chars 的 skill 列表开销。

## 数据文件

| 文件 | 路径 | 格式 |
|------|------|------|
| track.tsv | `~/.hermes/skill-track.tsv` | Tab分隔: `name`, `count`, `last_used`, `pinned` |
| config.yaml | `~/.hermes/config.yaml` | `skills.disabled` 列表（YAML） |
| 重平衡脚本 | `~/.hermes/skills/devops/skill-tracker/scripts/skill-rebalance.sh` | 自动执行老化+重平衡 |

## 自动递增架构

> 🤖 **完全自动**——已在 Hermes 核心 `tools/skills_tool.py` 的 `_skill_view_with_bump` 中集成 Hook。

每次 agent 调用 `skill_view(name='xxx')` 成功加载 skill 后，自动触发三层记账：

```
bump_view()  ──→ .usage.json（view_count / last_viewed_at）   ──→ Hermes 原生 Curator
bump_use()   ──→ .usage.json（use_count / last_used_at）      ──→ Hermes 原生 Curator
increment.py ──→ skill-track.tsv（count / last_used）         ──→ LFU 排名（本系统）
```

**无需 agent 额外代码，无需用户手动触发**。详见 `[[references/hook-integration.md]]`。

## 操作

### 0. 自动递增（推荐方式）

**场景**：任何 main skill 被加载使用后自动计数，无需人工干预

**步骤**：
```bash
# 自动调用（单个 skill）
python3 ~/.hermes/scripts/skill-increment.py <skill_name>

# 批量调用（一次会话中加载了多个 skill）
python3 ~/.hermes/scripts/skill-increment.py skill-a skill-b skill-c

# bash 兼容版本（供 cron/aging.sh 调用）
bash ~/.hermes/scripts/skill-increment.sh <skill_name>
```

**示例**（本回合加载了 darwin-skill 和 write-skill，自动递增后输出）：
```
darwin-skill (+8→9), write-skill (+8→9)
```

**失败处理（三段式 HL-2）**：

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| skill 名不在 TSV 中 | 自动追加新行，count=1，last_used=today | 发警告 `"已追加 X (1)"` 告知用户，继续执行 |
| TSV 文件不存在 | 创建文件，写入表头 + 新行 | 报错 `"TSV 初始化失败"` 并提示运行初始化脚本 |
| 错误传参（无参数） | 打印 usage 信息到 stderr | 退出码 1，不修改任何文件 |

### 1. 使用计数 +1（手动替代方案）

**场景**：用户说"我用了一次 XXX skill"，或 agent 不方便自动触发时

**步骤**：
```
python3 ~/.hermes/scripts/skill-increment.py <skill_name>
```

### 2. 启用新 skill（替换最低频 skill）

**场景**：用户需要某个 disabled 的 skill，且 Top-30 已满

**步骤**：
```
📋 当前活跃快照：
   cat ~/.hermes/skill-track.tsv | sort -t$'\t' -k2 -rn | head -5

1. cat ~/.hermes/skill-track.tsv | sort -t$'\t' -k2 -n | head -5
   → 找到 count 最低且 pinned=false 的 skill Y
   
2. 🔴 CHECKPOINT 🛑 STOP：向用户展示"准备踢出 Y（count=N），启用 X"
   等待用户确认后再继续

3. sed 从 skills.disabled 中移除 Y：
   sed -i '/  - Y$/d' ~/.hermes/config.yaml

4. sed 向 skills.disabled 添加 X（在 disabled: 行后插入）：
   sed -i '/^  disabled:/a\  - X' ~/.hermes/config.yaml

5. track.tsv：Y.count = 0，X.count = 1，X.last_used = today

6. ✅ 验证：python3 -c "import yaml; yaml.safe_load(open('/root/.hermes/config.yaml'))"
```

**失败处理（三段式 HL-2）**：

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 所有 candidate 都被 pinned | 告诉用户 "所有 skill 都已固定，无法自动淘汰"，贴出 pinned 列表 | 请用户手动 unpin 后再试 |
| sed 修改 config.yaml 后 YAML 格式损坏 | `python3 -c "import yaml; yaml.safe_load(open('/root/.hermes/config.yaml'))"` 验证 | 从 `~/.hermes-config/config.yaml` 恢复备份；回退 Y.count 还原 |
| Y 和 X 同名（自替换） | 不做任何操作，打印 "X 已在活跃列表中" | 跳过本轮淘汰，询问用户是否仍要手动启用

### 3. 手动重平衡

**场景**：用户说"帮我把 Top-30 重新算一遍"

**步骤**：
```
📋 当前活跃快照：
   cat ~/.hermes/skill-track.tsv | sort -t$'\t' -k2 -rn | head -5

1. 运行重平衡脚本（dry-run 模式预览）：
   bash ~/.hermes/skills/devops/skill-tracker/scripts/skill-rebalance.sh --dry-run

2. 🔴 CHECKPOINT 🛑 STOP：展示将要发生的变化：
   - 哪些 skill 会被启用
   - 哪些会被禁用
   等待用户确认

3. 运行正式重平衡：
   bash ~/.hermes/skills/devops/skill-tracker/scripts/skill-rebalance.sh
```

**失败处理（三段式 HL-2）**：

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 脚本找不到 TSV | 提示用户运行初始化流程（Phase 1） | 退出，不修改任何文件 |
| 脚本修改后 config.yaml YAML 损坏 | 从 `~/.hermes-config/config.yaml` 恢复备份 | 打印 `"YAML_CHECK_FAILED"` 标签供用户搜索，退出码 2 |
| 重平衡后活跃数 ≠ 30 | 打印警告 `"活跃数≠30: N个活跃"` | 运行 `--dry-run` 验证，让用户人工确认 |

### 4. 查看当前状态

**步骤**：
```
1. 统计 active skills：
   awk -F'\t' 'NR>2 && $2+0 > 0 {count++} END {print count}' ~/.hermes/skill-track.tsv

2. 显示 Top-30（含 pinned 标记）：
   tail -n +3 ~/.hermes/skill-track.tsv | awk -F'\t' '$2 > 0' | sort -t$'\t' -k2 -rn | head -30 | awk -F'\t' '{pf=""; if($4=="true") pf="📌"; printf "%-30s %-5s %-12s %s\n", $1, $2, $3, pf}'

3. 显示累计总使用次数：
   tail -n +3 ~/.hermes/skill-track.tsv | awk -F'\t' '{sum+=$2} END {print sum " 次"}'
```

## 不做什么（反例红名单）

| # | 反模式 | 为什么不能做 | 正确做法 |
|---|--------|-------------|---------|
| 1 | **禁用 pinned skill** | pinned=true 表示用户手动保留，强行淘汰会丢失 user intent | 跳过 pinned skill，选下一个最低 count 的 |
| 2 | **一次踢多个 skill** | 用户只要求"启用一个"，一次性踢多个会丢失 session 连续性 | 严格 1 in 1 out |
| 3 | **在用户未确认时直接改 config.yaml** | `skills.disabled` 变动影响所有后续对话，不可撤销 | 所有 config 修改前加 🔴 CHECKPOINT 等确认 |
| 4 | **编辑 config.yaml 时不验证 YAML** | sed 误操作可能破坏 YAML 结构，导致 Hermes 启动失败 | 每次改完后 `python3 -c "import yaml; yaml.safe_load(open(...))"` 验证 |
| 5 | **把非 main skill 加入 track.tsv** | feature-skills、intention-skills、templates、assets 不应单独计数 | 主 skill 被启用时，其子树自动可用；子 skill 不单独进出 |
| 6 | **在 Gateway 运行中重启 Hermes** | 从当前对话内重启会触发保护机制，拒绝执行 | config 修改后告诉用户"下次 Gateway 重启生效"或通过 cron 在 4am 自动重启 |
| 7 | **频繁触发重平衡** | 每改一次 config.yaml 都会变动 prompt context | 一天一次足够（配合 session_reset 的 4am）|
| 8 | **手动修改 track.tsv 的列格式** | Python/cron 脚本依赖固定的 4 列 tab 分隔 | 始终用 `\t` 分隔，不要加多余空格或逗号 |
| 9 | **运行 increment.py 但忘记先加载 skill** | 计数涨了但 skill 并未被实际调入 `available_skills`，产生虚假活跃数据 | 先 `skill_view(name)` 加载，再 `increment.py` 递增 |
| 10 | **auto-increment 生效后仍手动重复调用** | 幂等性保证了不会重复加，但会产生无意义的递增历史干扰老化曲线 | 信任自动递增；手动作为自动未触发时的备用手段 |

## 辅助脚本

| 脚本 | 路径 | 用途 |
|------|------|------|
| 自动递增 | `~/.hermes/scripts/skill-increment.py` | 加载 main skill 后自动 +1 计数 |
| bash 包装壳 | `~/.hermes/scripts/skill-increment.sh` | cron/aging.sh 兼容调用 |
| 重平衡 | `[[scripts/skill-rebalance.sh]]` | 非交互式重平衡，供 cron 调用 |

## 使用示例

```
用户：我用了 write-skill 写了个新 skill
→ 执行操作0（自动递增）：python3 ~/.hermes/scripts/skill-increment.py write-skill
→ track.tsv：write-skill count = 10 → 11

用户：我需要用 gen-README，但它不在 Top-30
→ 执行操作2：查找最低 count 的 skill（count=3）
→ 🔴 展示给用户确认
→ 踢出 Y，启用 gen-README，config.yaml 更新
```

## 频率控制

- 计数更新：**内核级自动触发**——Hermes 原生 `_skill_view_with_bump` Hook 在每次 `skill_view()` 成功后调用 `skill-increment.py`，零人工干预
- 重平衡（Top-30 变动）：由 cron 每天凌晨 4 点执行
- 老化衰减（count × 0.85）：每天凌晨 4 点由重平衡脚本自动执行
- 手动补救：若 Hook 因环境原因未生效，可手动执行 `python3 ~/.hermes/scripts/skill-increment.py <skill_name>`

## 关联文件

| 文件 | 用途 |
|------|------|
| `[[references/design-rationale.md]]` | LFU/LRU 选型、老化因子、Top-30 确定原理 |
| `[[references/hook-integration.md]]` | Hermes 原生 Hook 架构、代码修改位置、双轨并行原理 |
| `~/.hermes/scripts/skill-increment.py` | 自动递增 Python 核心脚本 |
| `~/.hermes/scripts/skill-increment.sh` | bash 包装壳（cron 兼容） |
| `[[scripts/skill-rebalance.sh]]` | 重平衡 bash 脚本 |
| `[[assets/test-prompts.json]]` | 测试 prompt 集 |
| `[[assets/results.tsv]]` | Darwin 评估记录 |
