---
name: 策略-整理gitLog增量
description: 编排 extract→标注→聚类→Excel→verify；串联 feature-skills。
---

# Intention：策略 - 整理 gitLog 增量

## 何时触发

- `targetRepoProfile` 与 config 已就绪
- 跨项目已完成 `分析-项目属性与harness` CHECKPOINT

## 执行步骤（顺序）

1. → `feature-skills/抽取-四仓提交/SKILL.md`
   ```bash
   python scripts/extract_commits.py --config configs/{profile}.config.json
   ```
2. → `feature-skills/标注-域名与主域/SKILL.md`（build 内 tag_domain）
3. → `feature-skills/聚类-主题问题树/SKILL.md`（build 内 cluster）
4. → `feature-skills/导出-Excel邻接表/SKILL.md`
   ```bash
   python scripts/build_excel.py --config configs/{profile}.config.json
   ```
5. → `feature-skills/质量-输出验收/SKILL.md`
   ```bash
   python scripts/verify_output.py --config configs/{profile}.config.json
   ```
6. 人工对照 `assets/few-shot-example/nebula-0707-0807/after/acceptance.md`（跨仓 P003/P004 等）
7. 若 `allowDarwin=true` → `feature-skills/darwin质量评估与迭代/SKILL.md`

**🔴 CHECKPOINT · 步骤 5 失败**：`passed=false` → **STOP**，不宣称交付完成。

## 失败模式（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| PermissionError 写 xlsx | 关闭 Excel 重跑 build | 改 `xlsxName` |
| 某仓 path 不存在 | 记 SKIP，核对 repos | 更新 config repos |
| verify passed=false | 读 JSON 报告字段 | 禁止 mark DONE |
| 问题根=域名 | 读 theme-cluster-rules | 对照 before/RED-baseline |

## 输出契约

| 产物 | 路径 |
| --- | --- |
| raw | `{outDir}/commits_raw.json` |
| xlsx | `{outDir}/{xlsxName}` |
| qualityReport | verify_output JSON |

## 使用示例

```text
profile=nebula-huiyan，跑完整流水线并 verify 106/29/4。
```
