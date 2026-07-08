# 写说明书

编写 Nebula 云平台**云边版用户使用说明书**的 nebula skill。

## 能力范围

- **改版**：有企业版原稿的模块（租户/用户/角色/菜单管理等），对照 apex_dev 现行实现更新为云边版
- **新建**：企业版全册未收录的模块（个人中心、安全配置等），参考同类说明书结构 + 源码从零编写

## 目录结构

```text
写说明书/
├── SKILL.md
├── README.md
├── assets/
│   ├── frontmatter-template.yaml
│   ├── skill-output-checklist.md
│   └── few-shot-example/
├── references/
│   ├── 说明书格式约束.md
│   ├── 模块说明书编写指南.md
│   └── enterprise-manual/    # 企业版全册 md + docx 副本
└── evals/
```

## 关键路径

| 用途 | 路径 |
|------|------|
| 云边版原稿（输出） | `F:/Documents/Default-Obsidian/思源/云平台/说明书/云边版/原稿/` |
| 企业版真源 | `F:/Documents/Default-Obsidian/思源/云平台/说明书/企业版/` |
| 模块盘点（内部） | `F:/Documents/Repertory/Sieyuan/nebula/docs/menu/模块盘点/` |
| 默认源码仓 | `F:/Documents/Repertory/Sieyuan/nebula/apex_dev` |

## frontmatter 模式

本地中文模式：`name` 与 `description` 均为中文。

## 维护

企业版说明书更新后，重新复制到 `references/enterprise-manual/`，更新 `目录索引.md` 与 `enterprise-manual/README.md` 中的 `lastSynced` 日期。
