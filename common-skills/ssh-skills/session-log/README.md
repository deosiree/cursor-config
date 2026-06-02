# Session Log — SSH 排障自生长回路

每次 SSH 排障完成后，将关键经验沉淀到本目录。

## 命名约定

```
YYYY-MM-DD-场景简述.md
```

如：`2026-06-02-菜单导入-100000-排障.md`

## 沉淀模板

| 字段 | 说明 |
|------|------|
| 场景 | 排障场景描述 |
| 集群 | 48/47/cloudtest |
| SSH 命令 | 实际执行的 plink/ssh 命令（密码用 `$env:SSH_JUMP_PASSWORD`） |
| ERRO 行 | 核心错误日志原文 |
| 根因 | 是什么导致的 |
| 修复 | 怎么修的 |
| 踩坑 | 这次踩了什么坑 |
| 沉淀建议 | 哪些值得更新进 skill 或 config |

## 定期回写

沉淀物应定期（月/季）回写入以下位置：

| 沉淀内容 | 写入目标 |
|----------|----------|
| 新的 grep 模式 | `config/ssh.config.json` → `grepPatterns` |
| 新集群/差异 | `config/ssh.config.json` → `multiCluster` |
| 新的 ERRO → 根因映射 | 对应 `feature-skills/*/SKILL.md` 的「2026-06-02 会话样本」节 |
| 新的排障场景 | 新建 `feature-skills/<新场景>/SKILL.md` |
| 新的踩坑记录 | 对应 `feature-skills/*/SKILL.md` 的「踩坑」表 |

## 前提

- 不包含真实密码/密钥/敏感信息
- 命令中用 `$env:SSH_JUMP_PASSWORD` 替代真实密码
- Pod 名使用 `<POD_NAME>` 占位符，除非对排障过程关键
