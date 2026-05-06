# skill 输出检查清单

## 基础结构
- [ ] 存在 `README.md`
- [ ] 存在 `SKILL.md`
- [ ] 存在 `template/`
- [ ] 存在 `assets/`
- [ ] 存在 `references/`
- [ ] 存在 `evals/`

## frontmatter 模式
- [ ] `SKILL.md` 的 `name` 为中文
- [ ] `SKILL.md` 的 `description` 为中文触发描述
- [ ] `README.md` 已声明采用“本地中文模式”

## 资源分层
- [ ] `template/` 只放给人类看的 before/after 示例
- [ ] `assets/` 只放给 agent 按需读取的素材
- [ ] `references/` 只放长说明与边界讨论
- [ ] 主 `SKILL.md` 没有堆放大段示例正文

## 更新型任务匹配
- [ ] `template/before` 存在
- [ ] `template/after` 存在
- [ ] before/after 足以展示兼容层退化前后差异

## 内容检查
- [ ] 主 `SKILL.md` 保留 `RED`、`GREEN`、`REFACTOR`
- [ ] 主 `SKILL.md` 使用双链引用 `template/`、`assets/`、`references/`
- [ ] `evals/evals.json` 覆盖 should-trigger 与 should-not-trigger
- [ ] 明确保留一条 non-trigger 指向 `gateway-version-control`
