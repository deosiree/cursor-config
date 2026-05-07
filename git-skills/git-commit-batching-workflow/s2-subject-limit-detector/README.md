# S2 subject_limit 探测

## 作用
为每个仓库产出 `subject_limit`（标题长度上限）作为唯一来源。

## 输入
- 读取 `${artifact_root}/${run_id}/S1/ctx_pack.yaml`（其中包含 `ctx_repos`）

## 输出
- 写入 `${artifact_root}/${run_id}/S2/limit_subject.yaml`（含来源与证据）

## 与下游
- `limit_subject` 在 S7/S8 通过固定路径读取（见父级 `README.md` §7）。

## 规则优先级
1. commitlint
2. CONTRIBUTING/.gitmessage/docs 规则
3. 审查规则显式限制
4. 全缺失 => `unbounded`

## 单写点
标题长度限制只在 S2 定义。

## 不做
不写标题，不改配置。
