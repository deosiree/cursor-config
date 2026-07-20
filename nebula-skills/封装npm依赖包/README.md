# 封装npm依赖包

Nebula 专有 skill：把业务仓可复用 UI 抽进 `@nebula/ui`（nebula-ui），完成边界判定、入库、examples、本地联调、发版与消费者升版。

## 与 `npm依赖包项目` 的分工

| Skill | 目录 | 管什么 |
|---|---|---|
| **本 skill** | `nebula-skills/封装npm依赖包` | 跨仓「抽不抽、怎么抽完」 |
| `npm依赖包项目` | `vue-skills/npm依赖包项目` | 库仓目录/build/examples/宿主接入工程细节 |

## 快速开始

```text
使用 $封装npm依赖包，sourceRepo=apex_dev，
sourceComponentPath=src/.../GuardedSecretInput，
componentName=NeSecretInput，publishMode=link。
```

路由会先进入 `路由-封装任务`，再 Single Dispatch 到 `分析-可抽离边界` 或 `编排-组件入库发版`。

## 目录

```text
封装npm依赖包/
  SKILL.md
  README.md
  intention-skills/
  feature-skills/
  assets/few-shot-example/NeSecretInput-入库/
  references/
  evals/
```

## 真实样本

本会话沉淀：`NeSecretInput`（默认 CSS 掩码 + 可选 `nativePwd` 开启浏览器密码提示）。详见 few-shot 与 `references/NeSecretInput踩坑.md`。
