# Harness Intake 清单（跨项目）

## 触发

- `targetRepoProfile != nebula-huiyan`
- 或 workspace 无 Nebula 特征（无 Meta `AGENTS.md` 负责人主域表）

## 必读（只读，不改 harness）

1. Meta `AGENTS.md` — 负责人主域 / surface 地图
2. `docs/FEATURE_INTAKE.md` — surface 分拣
3. 命中子仓 `{surface}/AGENTS.md`
4. `docs/ARCHITECTURE.md` — 仓边界、端口

## 属性确认表（CHECKPOINT 前输出）

| 属性 | 来源 | 必须用户确认 |
| --- | --- | --- |
| author | git / 用户 | 是 |
| since / until | 用户 | 是 |
| repos | ARCHITECTURE + 用户 | 是 |
| outDir | 用户习惯 | 是 |
| 主责主域列表 | AGENTS | 是 |
| 域名主责人 | AGENTS + 用户 | 是 |
| 我的角色（协作域） | AGENTS + 用户 | 是 |
| domain-dict / theme-rules | 复制默认后改 | 是 |

harness 无信息 → **AskQuestion**，禁止猜测杨欣静/叶倩等协作人。

## CHECKPOINT

用户确认表后，才允许跑 `scripts/extract_commits.py`。
