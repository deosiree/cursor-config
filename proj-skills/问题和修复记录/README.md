# 问题和修复记录

发版前人工核对问题记录的分层 skill 套件。输入文档、参考仓库、开发人员和目标列可逐次覆盖；默认值集中在 `assets/default-profile.yaml`。

## 使用示例

```text
使用 $问题和修复记录：
- recordDocument: 当前问题记录表链接
- referenceRepos: [前端仓库, 后端仓库]
- repoRefs:
  - repoPath: 后端仓库
    baseRef: v2.3.0
    targetRef: release/2.4
- developerName: 惠岩
- targetColumns: [改动方案说明, 开发自测结果]
- targetVersion: 2.4.0

静态核对指定版本并生成 Markdown 报告；不要修改源码或线上表格，也不要运行测试。
```

## 套件结构

```text
问题和修复记录/
├── SKILL.md
├── intention-skills/编排-版本前问题核对/
├── feature-skills/
│   ├── 读取问题记录文档/
│   ├── 扫描参考仓库/
│   └── 生成指定列报告/
├── assets/default-profile.yaml
├── assets/few-shot-example/β1代表性样例.md
├── references/证据分级与只读边界.md
├── template/问题和修复记录报告.md
└── evals/
    ├── evals.json
    └── darwin/          # 父级 skill 的质量评估记录
```

## 边界

- 父级只负责参数解析、默认值覆盖、输入校验和唯一意图分派。
- 意图层编排一次完整扫描；三个功能节点各自负责一种数据读取、代码证据收集或报告生成职责。
- 运行时只创建报告文件，不触碰来源文档、仓库源码或线上表格。
- Evals 是静态评估用例；本套件未执行它们，也不执行目标仓库测试或构建。

## 记录定位与代码快照

对已筛选的 Excel/表格视图，可在本次输入中使用 `sourceRows: [{sheet, row}]` 精确指定物理来源行；物理行号只用于追溯，不当作业务记录 ID。问题记录的 `targetVersion` 与代码证据的 `targetRef` 是两个范围；没有确认二者对应时，只能说明目标 commit 的状态，不能推断历史发布状态。仓库扫描始终读取解析后的 commit refs。工作区脏状态会写入报告并从证据中排除；如果用户要求包含未提交改动，先固定可复查快照。

原表中的开发自测、内测或验收结果按各自列名分别保留；它们不代替本轮实际验证结果。

## 默认配置

默认来源、仓库、开发人员、列和报告目录见 `[[assets/default-profile.yaml]]`。当前调用显式参数优先；目标版本每次必填。多仓库默认各自解析最近可达发布 tag 到各自的 `HEAD`，也可用 `repoRefs` 单独覆盖某个仓库。报告默认按 `<项目>/<版本>-<YYYYMMDD>.md` 分目录保存。

## 质量评估

- `evals/evals.json` 保存触发边界和流程评估用例；本轮只编写与检查格式，没有运行这些用例。
- `evals/darwin/` 记录父级 `SKILL.md` 的 baseline、合成提示词 dry-run 和逐轮评分；这些记录不代表访问过钉钉或扫描过参考仓库。
