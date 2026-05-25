# 文档转播客

创建型 skill：中文技术 MD → **听记对话稿**（称「播客」指可朗读稿，非静态博文）；可选 MP3/SRT/详细解答。

> 原目录名 `tech-doc-to-podcast`，Skill ID：`文档转播客`。

## 架构要点

- **创作**：主 agent + [`SKILL.md`](SKILL.md) + MVP/Snapshot few-shot
- **合成**：本地脚本 Tool（edge-tts），见 [`references/tools.md`](references/tools.md) — **不用**子 agent、**不用**商用 TTS API
- **评测**：默认 [`main_agent_dual_track`](test-run/README.md)；子 agent 仅可选

## 默认行为（所有调用）

- **输出目录**：源文 `{dir}/{basename}.md` → 产物写入 `{dir}/{stem}/`（`stem` = 文件名去 `.md`）；**禁止**默认使用 `podcast/` 目录名
- **交付模式**：用户仅提供文档路径（含 `$文档转播客` + md）→ **完整**四件套，**不**二次确认模式；用户明确「只要稿」「不要音频」等关键词时按 [`SKILL.md`](SKILL.md) 检查点 B 判定

示例：`…/在字节食堂打饭….md` → `…/在字节食堂打饭…/播客朗读稿-*.md`

## 上游：QA转面经（可选）

面经由 [`../../agent-skills/QA转面经`](../../agent-skills/QA转面经) 产出后，用户确认可进入本 skill：

- 输入：刚生成的面经 `.md`
- 输出目录：同上 `{面经父目录}/{stem}/`（例 `…/MCP全景对比/MCP全景对比/播客朗读稿-*.md`）
- `doc_type` / N / K 由 QA转面经 步骤 1.5 传入；交付模式未指定 → **完整**（不再检查点 B 确认）

## 快速入口

| 文档 | 说明 |
| --- | --- |
| [SKILL.md](SKILL.md) | 主流程 + Tool 节点 |
| [_shared 契约](../../_shared/references/技术文档-NK与doc_type契约.md) | N/K、doc_type、检查点 A |
| [references/tools.md](references/tools.md) | validate / TTS 命令与排障 |
| [template/mvp/](template/mvp/) | 轻量 few-shot |
| [template/snapshot/](template/snapshot/) | 完整 few-shot（面经 + 教程 + N>7） |
| [test-run/](test-run/) | Darwin 双轨评测 |
| [evals/README.md](evals/README.md) | eval_mode 说明 |
| [scripts/validate-podcast-md.py](scripts/validate-podcast-md.py) | Tool: 朗读稿校验 |
| [scripts/md-podcast-to-mp3.py](scripts/md-podcast-to-mp3.py) | Tool: MP3 + SRT |
