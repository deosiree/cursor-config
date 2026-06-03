# ssh-端口转发

SSH 端口转发隧道 — 通过 jump 机访问内网未暴露服务：数据库隧道、Actuator/JMX、内部管理页面、SOCKS 代理。

## 结构

```
ssh-端口转发/
├── SKILL.md          → 主文档（RED/何时不要/前置/3种转发模式/断连重连/会话样本/踩坑/输出契约）
├── README.md         → 本文档
├── evals/            → 触发/不触发条件
├── template/         → before（失败模式）+ after（成功输出参考）
└── assets/           → 排障样本输出
```

## 适用场景

- 内网服务无 ingress/公网入口 → `-L` 本地转发
- 数据库隧道（MySQL:3306、Redis:6379）→ Navicat/DBeaver
- 浏览器访问内网管理后台 → `-D` SOCKS 代理

## 关联父 skill

→ [`../../SKILL.md`](../../SKILL.md)
