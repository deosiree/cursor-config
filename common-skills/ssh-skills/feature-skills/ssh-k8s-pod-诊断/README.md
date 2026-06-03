# ssh-k8s-pod-诊断

K8s Pod 深度诊断 — CrashLoopBackOff、OOMKilled、ImagePullBackOff 等状态的 `kubectl describe`/`events`/`exec`/`top` 全链路排查。

## 结构

```
ssh-k8s-pod-诊断/
├── SKILL.md          → 主文档（RED/何时不要/前置/6步流程/退出码速查/会话样本/踩坑/输出契约）
├── README.md         → 本文档
├── evals/            → 触发/不触发条件
├── template/         → before（失败模式）+ after（成功输出参考）
└── assets/           → 排障样本输出
```

## 适用场景

- Pod `CrashLoopBackOff`、`OOMKilled`、`ImagePullBackOff`、`Init:Error`
- `kubectl logs` 正常但 Pod 仍重启 → 需要 `--previous` / `describe`
- 需要查 CPU/内存使用率或 exec 进容器

## 关联父 skill

→ [`../../SKILL.md`](../../SKILL.md)
