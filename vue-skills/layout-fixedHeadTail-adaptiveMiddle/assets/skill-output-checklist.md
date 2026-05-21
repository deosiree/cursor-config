# Skill 输出验收清单

交付或更新本 skill 时逐项勾选：

## 结构

- [ ] `SKILL.md` 含中文 `name` / `description`
- [ ] `SKILL.md` 含 RED / GREEN / REFACTOR / 验收清单 / 使用示例
- [ ] `README.md` 声明 frontmatter 模式与 commit 溯源
- [ ] `agents/openai.yaml` 含 `display_name` 与 `default_prompt`
- [ ] `template/before/` 与 `template/after/` 含真实文件实体（非空壳说明）
- [ ] `references/` 至少 3 篇且与主流程互链
- [ ] `assets/few-shot-example/` 含可复现会话样本
- [ ] `evals/evals.json` 与 `should-trigger-prompts.md` 齐全

## 内容质量（反空心化）

- [ ] 主 `SKILL.md` 不堆长 diff，样本在 `template/`
- [ ] GREEN 流程可独立执行，不依赖 README 才能懂
- [ ] 明确「何时不要使用」与关联 skill（extract-shell 等）
- [ ] before/after 样本 UTF-8 中文未乱码

## 触发边界

- [ ] should-trigger 覆盖：缩放裁切、max-height 无效、固定首尾
- [ ] should-not-trigger 覆盖：PageTabShell、弹窗、非 el-table
- [ ] 含形态 A/B 判定与形态 B reference（`split-layout-parent-child.md`）
- [ ] `test-prompts.json` 含租户/用户分裂布局用例

## 技术一致性

- [ ] 强调 `height` prop + `useTableBodyHeight` + flex 三段
- [ ] 不推荐 `calc(100% - Npx)` 作为首选方案
- [ ] 验收含 100%/125%/150% 缩放与 resize
