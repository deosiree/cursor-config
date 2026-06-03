# ssh-k8s-浏览后端日志

jump 机 + `kubectl logs` 查 seccenter Pod 日志，解析 ERRO 行与前端 `[100000]` toast 的映射关系。

## 结构

```
ssh-k8s-浏览后端日志/
├── SKILL.md          → 主文档（前置/流程/plink命令/会话样本/输出契约/踩坑）
├── README.md         → 本文档
├── evals/            → 触发/不触发条件
├── template/         → before（失败模式）+ after（成功输出参考）
└── assets/           → 排障样本输出
```

## 适用场景

- 前端 toast `[100000]未知错误`，Network 面板无完整 JSON
- `ImportProjectMenuTree` / 权限点 / seccenter 接口失败
- SSH 到 48/cloudtest 集群 jump 的 kubectl logs

## 关联父 skill

→ [`../../SKILL.md`](../../SKILL.md)
