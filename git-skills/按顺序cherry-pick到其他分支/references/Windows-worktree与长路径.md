# Windows：脏主仓时用 worktree 沙盒实跑

主工作区不干净时，**不要**为测试而 stash 已落地 commit，也**不要**在脏树上直接 cherry-pick。可用独立 worktree 在历史干净点做沙盒验证。

## 已观测失败：Filename too long

在 Windows 上，对本仓（`huiyanSkills`）执行：

```bash
git worktree add <长路径> <commit>
```

若路径落在 `F:\Documents\Default-Obsidian\...` 一类深目录下，可能报错：

```text
error: unable to create file ... Filename too long
fatal: Could not reset index file to revision 'HEAD'.
```

会导致 worktree 半残（目录/分支残留），须 `worktree remove --force` / `worktree prune` / `branch -D` 清场后再重试。

## 推荐做法

1. **短物理路径**：优先仓外短目录，例如 `f:\wt\cp`（避免再嵌一层很长的文档路径）。
2. **临时开启 longpaths（不改持久 config）**：

```bash
git -c core.longpaths=true worktree add -b test/cp-sandbox f:\wt\cp <base_commit>
```

后续在该 worktree 内的 checkout / cherry-pick 也可带同一前缀：

```bash
git -c core.longpaths=true cherry-pick <oldest>^..<newest>
```

3. **不要**为一次沙盒测试去改用户的 `git config core.longpaths`（持久配置），除非用户明确要求。
4. 测完：`git worktree remove --force <path>`，再删测试分支；确认主 worktree 仍停在原分支且脏文件未被动。

## 与本 skill 的关系

- 沙盒 worktree 满足「工作树干净」硬约束，使 cherry-pick 流程可测。
- 正式把临时分支落到 `main` 仍须在**主意图对应的干净树**上执行（或先提交干净），沙盒测通 ≠ 正式合入已完成。

## 实跑记录（2026-07-15）

- 失败路径：`f:\Documents\Default-Obsidian\_wt_huiyanSkills_cp_test`
- 成功路径：`f:\wt\cp` + `-c core.longpaths=true`
- 区间：`b798e35^..ad99f42`（基座 `c36a720`）→ 成功后清理 worktree 与 `test/cp-sandbox`
