# 代码质量审查者提示模板

在调度代码质量审查者子代理时使用此模板。

**目的：** 验证实现构建良好（干净、经过测试、可维护）

**仅在规范合规性审查通过后调度。**

```
Task tool (superpowers:code-reviewer):
  使用 requesting-code-review/code-reviewer.md 中的模板

  WHAT_WAS_IMPLEMENTED: [来自实现者的报告]
  PLAN_OR_REQUIREMENTS: [plan-file] 中的任务 N
  BASE_SHA: [任务前的提交]
  HEAD_SHA: [当前提交]
  DESCRIPTION: [任务摘要]
```

**代码审查者返回：** 优势、问题（关键/重要/次要）、评估
