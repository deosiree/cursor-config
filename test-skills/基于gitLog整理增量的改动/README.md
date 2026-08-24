# 基于 gitLog 整理增量改动

父子 skill 套件：多仓 git log → 主题问题树 Excel。

## 结构

- 父：`SKILL.md`（Agent 路由）
- intention：`分析-项目属性与harness`、`策略-整理gitLog增量`
- feature：抽取 / 标注 / 聚类 / 导出 / darwin
- 黄金样本：`assets/few-shot-example/nebula-0707-0807/`（内嵌，无仓外双链）

## 依赖

```bash
pip install openpyxl
```

## Nebula 默认

```bash
cd test-skills/基于gitLog整理增量的改动
python scripts/extract_commits.py --config configs/nebula-huiyan-0707-0807.config.json
python scripts/build_excel.py --config configs/nebula-huiyan-0707-0807.config.json
python scripts/verify_output.py --config configs/nebula-huiyan-0707-0807.config.json
```

产出：`nebula/humanDocs/自测单/gitLog/`（**106** 提交、29 问题根；verify 退出码 0）

## 跨项目

1. 触发 skill 并指定非 `nebula-huiyan` profile
2. Agent 读 harness（AGENTS / FEATURE_INTAKE / ARCHITECTURE）
3. **CHECKPOINT** 确认 author、主域、主责人、协作人、repos、outDir
4. 再跑脚本

## 相关 skill

- `../输出csv的测试用例/` — CSV 用例导出
- `../基于测试用例写后端的pytest自动化测试/` — 后端自动化

## 使用示例

```text
使用 $基于gitLog整理增量的改动，profile=nebula-huiyan，since=2026-07-07。
```
