# 示例：审查中热修后整包收回（js-yaml）

## 用户意图（纠正后的正确语义）

不是 pop 回「修 bug 前」的审查 WIP；而是：

1. 先把 bug 修到 `develop` 并推远端（往前推进）  
2. 再把 **草稿 B + 热修 H…** 的全部代码改动收回临时审查分支工作区  
3. 在**已含修复**的整包 diff 上继续审查优化  
4. 最终一版 F 推上去时，远端对 B+H… **整段 revert**，再上 F  

## 用户说法

```text
统编缺 js-yaml。先补依赖推 origin/upstream；回来后不要恢复热修前的改动，
要把草稿和这次热修的提交都收回本地，基于修完 bug 的代码做整批审查。
提交：fix(views): 菜单管理的导入v2-demo，补充js-yaml依赖，后端暂未支持api的预览，先前端实现
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

## 期望动作

1. stash（仅防切分支丢文件；事后默认 drop）  
2. develop 对齐 → 加依赖 → commit + 双推 → `hotfixSha`  
3. `checkout -B temp <series_tip>` → `reset <draft>^`（mixed）  
4. 工作区 = A..tip 整包；继续审查  

## 日后 publish

`revert` 顺序新→旧：先 H 再 B（或确认后的系列列表）；再 cherry-pick F（F 内须仍含 js-yaml 等必要修复）。
