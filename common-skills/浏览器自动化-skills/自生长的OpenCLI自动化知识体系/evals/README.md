# 持续评估

## 实跑记录

每次执行任一子 skill 的 E2E 后，Agent **必须**在 `实跑记录.tsv` 追加一行：

```
date	skill	result	env	notes
```

| 字段 | 说明 |
|:-----|:------|
| date | YYYY-MM-DD |
| skill | 子 skill 目录名（如 opencli-ux-role-tab-validation） |
| result | PASS / FAIL / PARTIAL |
| env | local / cloud / t-cloud |
| notes | 关键踩坑或通过条件 |

**规则：**
- PASS / FAIL / PARTIAL 都记
- 不要只记成功，FAIL 更有价值（说明哪步断了）
- 每次实跑只追加，不修改历史行

## 快速查询

```powershell
# 最近 5 条记录
Get-Content .\evals\实跑记录.tsv | Select-Object -Last 5

# 按 skill 筛选
Select-String "opencli-ux-api-whitelist" .\evals\实跑记录.tsv

# 只看 FAIL
Select-String "FAIL" .\evals\实跑记录.tsv

# PASS 率统计
python -c "
with open('evals/实跑记录.tsv') as f:
    lines = [l.strip().split('\t') for l in f if l.strip() and not l.startswith('date')]
    total = len(lines)
    passed = sum(1 for l in lines if l[2] == 'PASS')
    print(f'总实跑: {total}  通过: {passed}  通过率: {passed/total*100:.0f}%')
"
```

## 谁在消费

| 消费方 | 用途 |
|:-------|:------|
| Agent（Session-End 自检 #6） | 实跑后追加一行 |
| 你（回顾） | 回答「这个 skill 到底跑没跑通过」 |
| Darwin 评估（dim8） | 实测表现从 dry_run → 有据可查的 full_test |
