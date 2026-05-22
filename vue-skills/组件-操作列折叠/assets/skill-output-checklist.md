# Skill 输出验收清单

交付或更新本 skill 时逐项勾选：

## 结构

- [ ] `SKILL.md` 含中文 `name` / `description`
- [ ] `SKILL.md` 含 RED / 路由表 / 验收清单 / 使用示例
- [ ] `template/mvp/` 含 OperationColumn 五件套（与目标仓库实现对齐）
- [ ] `template/before/` 与 `template/after/` 含租户 + 用户双表样本；菜单含 after 操作列片段
- [ ] `references/optional-i18n.md` 存在且子 skill 不强制拷 locale
- [ ] `feature-skills/` 含新增、更新两个子 skill
- [ ] `references/` 含 `column-width-probe`、`op-item-api`、`anti-patterns`
- [ ] `assets/few-shot-example/` 含 `operation-column-mvp`、`tenant-table-replace`、`user-table-replace`、`menu-table-replace`
- [ ] `evals/` 齐全（归档用，非执行依赖）

## 内容质量（反空心化）

- [ ] 主 `SKILL.md` 可独立完成「新增 vs 更新」判定与委派
- [ ] 子 skill 可独立执行，不依赖通读 README
- [ ] 明确「何时不要使用」与关联 skill
- [ ] 无「活源码 / 冻结 commit / v1.x 差异表」作为执行路径

## 触发边界

- [ ] should-trigger 覆盖：操作列折叠、更多、OperationColumn、OpItem
- [ ] should-not-trigger 覆盖：纯布局高度、i18n 全量迁移

## 技术一致性

- [ ] 强调 `OpItem` 而非 slot 内 `el-button`
- [ ] `list-data-length` 必填；业务不传 `probe-data-rows`
- [ ] `template/mvp/index.vue` 含 inject，无 `PROBE_ROWS`
- [ ] `column-width-probe.md` 指向 `template/mvp` 而非仓库外链
