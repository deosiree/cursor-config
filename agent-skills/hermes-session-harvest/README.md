# Hermes Session Harvest

> 会话结束时自动沉淀有价值内容，清理废弃产物——不做垃圾站。

## 这是什么

一个通用的 session-end audit 引擎。在每次有价值的编码/测试/修复会话结束时，自动：
1. 扫描本次会话产生的命令序列、场景、脚本
2. 分类：有价值 → 沉淀 / 废弃 → 清理 / 重复 → 跳过
3. 执行沉淀（写场景文件、更新路由表、git commit）或清理
4. 输出结构化摘要报告

## 快速开始

```
用户说: "沉淀" / "收尾" / "harvest" / "保存经验"
Agent: 自动执行四步 audit → 输出报告
```

## 文件结构

```
hermes-session-harvest/
├── SKILL.md                      # 核心引擎
├── README.md                     # 本文件
├── feature-skills/
│   ├── 检测新增命令序列/SKILL.md
│   ├── 检测未覆盖场景/SKILL.md
│   └── 清理废弃产物/SKILL.md
├── evals/
│   ├── should-trigger.md
│   ├── should-not-trigger.md
│   ├── darwin-baseline-report.md
│   └── test-prompts.json
├── references/
│   └── harvest-pipeline.md
└── template/
    └── session-harvest-report.md
```

## 与 OpenCLI 自生长系统的关系

本 skill 是**流程引擎**（管什么时候沉淀、沉淀什么、删什么）。
OpenCLI 自生长系统是**知识仓库**（管沉淀到哪里、路由如何更新）。

两者通过 `references/harvest-pipeline.md` 定义对接规范。
