# 示例：develop 草稿 → 本地审查 → revert → 最终版

场景：前端先推一版给后端对接口，自己还要大改冗余与命名；`develop` 禁止强推。

## 阶段 A · 推草稿

```text
当前在 develop，改动已可给后端看。请 commit + push 草稿，并记下 SHA。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

期望动作摘要：

1. 分析现状 → `phase=push_draft`
2. CHECKPOINT 后：`commit` + `push origin develop`（无 force）
3. 输出 `draftSha=<full>`

## 阶段 B · 本地审查回滚

```text
草稿 SHA 是 abc1234eeee。请建 temp/review-after-draft，mixed reset 收回改动，我要改命名。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

期望：

```bash
git checkout -b temp/review-after-draft
git reset HEAD~1
# 用户编辑…
git add … && git commit -m "feat: 审查后的最终版本"
# 得到 finalSha=def5678ffff
```

## 阶段 C · revert 并推最终

期间同事可能已往 develop 推了无关模块提交。

```text
审查完了。final=def5678ffff。develop 上 pull，revert abc1234eeee，
cherry-pick final，push，再删 temp/review-after-draft。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

期望远端历史：

```text
… → abc1234 (draft) → (colleague) → revert(abc1234) → def5678 (final)
```

## 反例（不要这样做）

```text
直接 git push --force-with-lease 把草稿盖掉。
```

本套件应 `phase=handoff_force_push` 并 STOP。
