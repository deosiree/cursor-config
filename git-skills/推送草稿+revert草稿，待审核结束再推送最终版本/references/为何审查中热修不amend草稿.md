# 为何审查中热修不 amend 草稿，以及为何整包收回

## 不 amend / 不强推

草稿 B 已在共享分支。热修打成新提交 H，历史为 `B → H`。

## 回来审查不是 pop 旧 WIP

旧 stash =「发现 bug **之前**」的本地状态，**不含** H 的修复。

正确审查基线：

```text
checkout -B temp <series_tip>   # tip 含 B+H
reset <draft>^                  # mixed：工作区 = A..tip 整包
```

即：在**已经修完 bug** 的代码整体上，对「草稿以来全部改动」做审查优化。

## publish 时

对新→旧 revert 系列（H… 再 B），再推最终版 F；F 必须自带仍需要的修复（否则 revert H 后修复会丢）。
