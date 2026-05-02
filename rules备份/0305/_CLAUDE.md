# Claude 规则（nebula）

## 通用约束
1. 所有回复与规则说明统一使用中文。
2. 若任务存在可用 skill，优先按 skill 执行。

## Skill 目录约束（强制）
1. nebula 项目级（业务耦合）skill 必须放在 `.cursor/nebula-skills`。
2. 通用可复用 skill 放在 `.cursor/mySkills`。
3. 若两边存在同名或近似 skill，优先使用 `.cursor/nebula-skills`。
4. 项目级 skill（`SKILL.md` 与 `agents/openai.yaml`）必须使用中文。

## 规则文件同步机制（强制）
1. 后续新增或修改“规则”时，必须同步检查并更新以下全部规则文件：
   - `.cursorrules`
   - `.cursor/.cursorrules`
   - `.codexrules`
   - `CLAUDE.md`
2. 若上述文件不存在，必须先创建再同步写入规则。
3. 规则落地前必须完成一次全量核对，确认四处内容一致或明确差异说明。
4. 所有规则文件统一使用中文撰写（标题、条款、示例说明均为中文）。
