# 批线协议与换行哨兵

## 问题

批量翻译 prompt 约定「**一行一条** + 序号」。若源文（如 Qt `Could not write\n%1`）含真实换行，按 `\n` 拆响应时会把**一条源文拆成多行**，后续序号整体错位，出现「俄文是另一条英文的译文」。

## 协议

1. **入模前 mask**（`protectUndistinguishablePlaceholders`）  
   - `\r\n` / `\r` → `\n`  
   - 所有 `\n` → 固定哨兵 **`⟦__NL__⟧`**  
   - 再保护 `{}` / `{:.3f}` → `⟦__PH_CURLY_n__⟧`

2. **模型约束**（`prompts/prompt-batch*.md`）  
   - 必须原样保留 `⟦__NL__⟧`  
   - 输出仍严格 `1. …` / `2. …` 一行一条，禁止在单条内插入真实换行

3. **解析**（`parseBatchTranslationResponse`）  
   - 只收编号行；要求序号 `1..N` 齐全且无重复  
   - 否则返回空数组 → `translateBatch` **抛错**，禁止补空/截断当成功

4. **出模后 restore**  
   - 先还原花括号 token，再把 `⟦__NL__⟧`（及偶发变体）还原为 `\n`

5. **落盘门禁**  
   - `%N` / `{}` 校验失败 → **不写入**目标列（可留空便于 resume）

## 回归

```bash
node evals/batch-wire-multiline.js
```
