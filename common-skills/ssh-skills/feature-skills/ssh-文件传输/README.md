# ssh-文件传输

SSH 文件传输 — 通过 pscp/scp/kubectl cp 在本地与 jump/集群间拉取日志、推送配置、跨跳板机搬运。

## 结构

```
ssh-文件传输/
├── SKILL.md          → 主文档（RED/何时不要/前置/5种传输模式/会话样本/踩坑/输出契约）
├── README.md         → 本文档
├── evals/            → 触发/不触发条件
├── template/         → before（失败模式）+ after（成功输出参考）
└── assets/           → 排障样本输出
```

## 适用场景

- `kubectl logs --tail` 不够用 → pscp 拉完整日志文件到本地
- 推送 YAML/配置到 jump 机或 Pod
- `kubectl cp` 导出 Pod 内文件
- 跨跳板机搬运文件

## 关联父 skill

→ [`../../SKILL.md`](../../SKILL.md)
