# after · en2ru 成功流程

## 标准命令

```bash
cd translateTool-skills/translate
npm install
node translateCsv.js "f:\DownLoads\qt通用语言.xlsx" "f:\DownLoads" --mode en2ru --limit 20 --debugPrompt
```

全量（人工确认试跑后再跑）：

```bash
node translateCsv.js "f:\DownLoads\qt通用语言.xlsx" "f:\DownLoads" --mode en2ru
```

## 预期行为

1. CLI 解析 `--mode en2ru`：源列 `英文翻译`（空则 fallback `词条`），目标列 `俄文翻译`。
2. 跳过中文术语库、中文规范性检查、comment 大小写纠正。
3. 已有俄文内容默认跳过（`skipIfFilled`），支持断点续跑。
4. 仅输出 `f:\DownLoads\qt通用语言_ru.xlsx`（不写 CSV）。
5. 占位符 `%1`/`%2`/`{}` 经 `validateTranslation` 校验；失败记入 `备注1` 与 `_errors.log`。

## 验收检查清单

- [ ] 输出列数 = 输入列数（可额外有 `备注1`）
- [ ] 试跑 20 条中，含 `%1`/`%2` 的条目占位符通过率 ≥ 95%
- [ ] 已填俄文列不覆盖（除非后续显式 `--force`）
- [ ] `--debugPrompt` 生成 `*_prompt_debug.md`，system/user 文案为英→俄
