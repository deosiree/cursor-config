# 跨仓 surface 决策

| 工作内容 | surface |
|---|---|
| 只改 nebula-ui 实现/examples/build | `nebula-ui` |
| 只改一个业务仓替换引用 | 该仓 `apex_dev` / `microfb` / `opsdeck` |
| 库 + ≥1 消费者同时改 | `cross-mfe` 或双 surface；**先问人** |
| 只改 Harness 地图 | `harness-meta` |

相关 skill：

- 跨仓抽取编排：`nebula-skills/封装npm依赖包`
- 库仓工程：`vue-skills/npm依赖包项目`

禁止：未标 surface 同时大改多仓；禁止擅自改 Bearer 会话。
