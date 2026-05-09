# 受控试跑模板

这套模板用于第一次把 `达尔文式技能优化` 落到真实仓库时，执行一次**仅评估不改**的受控试跑。

## 模板内容

- `test-prompts.json`
  - 一组真实可运行的测试提示词
- `results.tsv`
  - 评分与动作记录格式样例
- `baseline-report.md`
  - 一次 baseline 评估输出样板

## 使用方式

1. 先把 `targetSkillPath` 替换成你的真实目标 skill
2. 先跑 `evaluate-only`
3. 如果 baseline 输出稳定，再进入 `controlled-trial`

## 当前样例说明

本模板默认使用当前仓库中的：

```text
.cursor/nebula-skills/gen-perms-apis/SKILL.md
```

作为单 skill 受控试跑样例。  
这个选择不是强绑定，只是为了让第一次复用时有一套真实路径、真实 prompt 和真实结果记录格式。
