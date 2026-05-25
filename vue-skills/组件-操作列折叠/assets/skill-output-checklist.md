# Skill 输出验收清单

交付或更新本 skill 时逐项勾选：

## 结构

- [ ] `SKILL.md` 含中文 `name` / `description`、槽位语义指针
- [ ] `template/mvp/` 五件套 + `__tests__/operationWidth.test.ts` 与 apex_dev 一致
- [ ] `template/mvp/operationWidth.ts` 含 `calcOpStrip`、`mkWidthCoord`，无 `reserveMoreSlot`
- [ ] `template/after/`：tenant、user 全表；menu 两 fragment；role fragment
- [ ] `references/slot-semantics.md`、`column-width-probe.md`、`anti-patterns.md`
- [ ] `assets/few-shot-example/` 含 role-table-replace
- [ ] `evals/` 与 `test-prompts.json` 槽位数已更新

## 内容质量

- [ ] 无「行内个数不含更多」作为当前语义
- [ ] 无 `collectProbeRowsFromTableData` 等旧 API 作为现行路径（代码样本中）
- [ ] 子 skill 可独立执行

## 触发边界

- [ ] should-trigger：槽位、`calcOpStrip`、启用用户后操作列刷新
- [ ] should-not-trigger：纯布局高度、i18n 全量迁移

## 技术一致性

- [ ] `OpItem` 而非 slot 内 `el-button`
- [ ] 仅 `list-data-length`；无 `probe-data-rows`
- [ ] grep skill：`OPERATION_COLUMN_WIDTH_KEY`、`globalMaxBtn`、`reserveMoreSlot` 仅出现在 anti-pattern「勿恢复」类表述（如有）
