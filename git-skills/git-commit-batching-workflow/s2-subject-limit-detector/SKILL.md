---
name: git-commit-batching-workflow-s2-subject-limit-detector
description: Detect subject length limit per repo from authoritative rules; fallback to unbounded.
---

# S2：subject_limit 探测

## 职责（单写点）
仅产出 `limit_*`，作为后续标题预算单一来源。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）

由执行方从固定 artifact 文件读取 `ctx_repos`：
- `${artifact_root}/${run_id}/S1/ctx_pack.yaml`

## 规则来源优先级
1. commitlint（`header-max-length`）
2. 仓库提交规范（`CONTRIBUTING.md` / `.gitmessage` / `docs/commit*.md`）
3. 审查规则中的显式限制
4. 全缺失 => `unbounded`

## 输出（固定写入 artifact）
- 写入 `${artifact_root}/${run_id}/S2/limit_subject.yaml`

## 标题预算含义（自包含）
- `subject_limit` 约束的是 **commit 首行（subject / header 第一行）可接受的最大字符长度**。
- 只要首行超过该值就可能触发 `commitlint`/hook 失败；正文 body 长度不属于此字段的约束范围（但仍应换行避免单行太长）。

## 探测规则细则（自包含）
对每个 `repo_name`，按优先级依次探测；命中即停止：

1. **commitlint 规则**
   - 优先查找仓库根目录下的：
     - `commitlint.config.{js,cjs,mjs,ts}`
     - `.commitlintrc*`
     - `package.json` 中的 commitlint 配置
   - 提取 `header-max-length`（数值）。
   - 若同时存在多个数字来源：
     - 取**最小正数**作为 `subject_limit`（更保守、降低失败概率）
   - `limit_evidence` 至少包含：文件路径 + `header-max-length` 的数值片段摘要。

2. **仓库提交规范**
   - 查找：`CONTRIBUTING.md`、`.gitmessage`、`docs/commit*.md` 等
   - 从文本中提取“subject/header 最大长度”的明确数字（若出现）
   - 若仅出现非数字描述（如“尽量短”），视为未命中该层级，继续下一层或最终 unbounded。
   - `limit_evidence`：记录文件路径 + 命中的关键句摘要。

3. **审查/静态规则中的显式限制**
   - 查找其它规则文件中对 header/subject 最大长度的明确数字
   - 同样以命中的最小正数为准

4. **全缺失降级**
   - 若上述层级都未命中明确数字：
     - `subject_limit = unbounded`
     - `limit_source = unbounded-default`
     - `limit_evidence = 没找到显式 header/subject 长度限制（降级为 unbounded）`

## 失败策略（自包含）
- 若读取规则文件失败、解析失败或仓库不完整：
  - 仍输出该 repo 的 `limit_subject`，但设置为 `unbounded`
  - `limit_source = unbounded-default`
  - `limit_evidence` 说明读取失败原因摘要

## 不做
- 不写标题
- 不改仓库配置
