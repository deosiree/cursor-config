# npm依赖包项目

以 **nebula-ui（`@nebula/ui`）** 为真实样本的 Vue3 组件库工程 skill：目录、Vite lib、peer、examples、宿主接入、Artifactory 发版。

## 与 `封装npm依赖包` 的分工

| Skill | 管什么 |
|---|---|
| **本 skill** | 库仓怎么建、怎么接、怎么发 |
| `封装npm依赖包` | 跨仓抽不抽、抽完怎么升消费者 |

## 快速开始

```text
使用 $npm依赖包项目，taskKind=consume，consumerRepo=apex_dev，
说明如何 app.use(NebulaUI) 与按需引入 NeI18nInput。
```

## 目录

```text
npm依赖包项目/
  SKILL.md
  README.md
  intention-skills/
  feature-skills/
  assets/few-shot-example/
  references/
  evals/
```

## 宿主现状（apex）

- 依赖：`@nebula/ui`
- `main.ts`：`app.use(NebulaUI, { i18nInput: ... })` + `import '@nebula/ui/style.css'`
- 按需示例：告警/审计表单中的 `NeI18nInput`
