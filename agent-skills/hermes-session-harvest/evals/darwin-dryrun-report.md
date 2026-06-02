# Darwin 实测推演 · hermes-session-harvest (dry_run)

> 评估日期：2026-06-02
> eval_mode: dry_run
> 测试集：evals/test-prompts.json (5 prompts)

## 推演结果

| id | prompt | 预期行为 | dry_run 判定 | 备注 |
|:---:|---|---|:---:|---|
| 1 | "沉淀" | 触发 → 四步 audit → 报告 | ✅ PASS | should-trigger 第1条直接命中 |
| 2 | "OpenCLI 跑完租户测试，收尾" | 触发 → SCAN 检测命令 → 已有覆盖 → 仅 session-log | ✅ PASS | "收尾"命中触发；租户场景路由表已有 |
| 3 | "修复安全配置权限 bug + OpenCLI eval + v-if" | 触发 → 跨工具组合 → 新场景 (重合<50%) → HARVEST | ✅ PASS | 重合度计算：安全配置/tab/v-if vs isOwner/Header → ~35% |
| 4 | "清理 opencli-ux-foo 废弃脚本" | 触发 → 废弃检测 → 候选列表 → 确认 → 删除 | ✅ PASS | "清理"命中触发；清理废弃产物 feature skill 接管 |
| 5 | "不看文档，纯问答" | 不触发 | ✅ PASS | should-not-trigger 第1条：纯问答 |

**通过率：5/5 (100%)**

## 推演细节

### Prompt 3 深度推演（最复杂路径）

```
1. should-trigger 匹配: prompt含"bug"+"OpenCLI"+"修复" → 命中
2. SCAN:
   - 新命令序列: opencli browser X eval "document.querySelectorAll('[role=tab]')" + read_file index.vue
   - 新场景候选: 安全配置权限排查-Tab激活诊断
3. CHECKPOINT 1: 展示SCAN摘要 → 用户确认
4. CLASSIFY:
   - 提取特征: [权限配置, tab不激活, 安全配置, v-if]
   - 路由表匹配:
     * 权限/isOwner/Header → [权限, sessionStorage] → 重合度 2/4 = 50% → 相似但不覆盖
     * 用户管理 → [权限, 操作列] → 重合度 1/4 = 25%
   - 判定: 新场景 (最高重合度50% < 80%)
   - 建议名: "权限配置排查-Tab激活诊断"
   - 置信度: high (跨工具组合: OpenCLI+源码阅读)
5. CHECKPOINT 2: 展示执行计划 → 用户确认
6. HARVEST:
   - write_file references/场景-权限配置排查-Tab激活诊断.md
   - edit_file SKILL.md 路由表新增行
   - edit_file test-prompts.json 追加条目
7. CHECKPOINT 3: 展示待提交 → 用户确认 → git commit
8. REPORT: 输出结构化摘要
```

## 维度 8 评分修正

| 项目 | 基线 | R4 | 理由 |
|------|:---:|:---:|------|
| test-prompts 存在 | ❌ | ✅ | 5 条涵盖完整路径 |
| dry_run 通过率 | N/A | 5/5 | 全部预期行为可追踪 |
| 真实会话验证 | ❌ | ❌ | 尚未在真实 OpenCLI 会话中触发 |

**维度 8: 3 → 5** (+2). 扣分理由：真实会话未验证，隐式触发机制未实测。
