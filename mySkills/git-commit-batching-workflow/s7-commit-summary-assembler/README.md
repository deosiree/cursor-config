# S7 summary 组装与裁剪

## 作用
生成 **首行可用的短 `summary_final`**，并在超预算时裁剪；**不**把主题与问题—解决写进首行（正文由 S8 写）。

## 输入
- 从固定 artifact 文件读取：
  - `${artifact_root}/${run_id}/S2/limit_subject.yaml`
  - `${artifact_root}/${run_id}/S6/map_notes.yaml`（作为主题/问题/解决/价值素材来源）

## 输出
- 写入 `${artifact_root}/${run_id}/S7/summary_parts.yaml`

## 与 S8 衔接
- S8 从固定路径读取 `${artifact_root}/${run_id}/S7/summary_parts.yaml`，再从 `${artifact_root}/${run_id}/S6/*` 读取补全渲染所需素材。

## 结构
- **产出**：短句 `summary_final`（动词 + 宾语）
- **内部素材**（可选）：`主题；问题+解决；分批子任务` 仅作草稿，须再压成短句（分隔符优先级：`；` > `+`）

## 单写点
summary 裁剪策略只在 S7 定义。

## 不做
不探测 `subject_limit`，不写完整标题。
