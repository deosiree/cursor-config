---
name: 沉淀-历史样本为few-shot
description: 将 nebula 等真实主子通信改动整理为 assets/few-shot-example 与 template/before|after。Use when few-shot、历史样本、template after、traceability 自检。
---

# 沉淀-历史样本为few-shot

## 何时使用

- 业务仓库 GREEN 已合入，需沉淀为可复用样本
- template 只有说明壳，缺真实 before/after 代码
- 新增 message 后需更新 references 注册表

## 何时不要使用

- 业务改动尚未合入或未经联调验收
- 仅有设计文档、无真实 diff

## 本套件已有样本

| 目录 | template | 源文件 |
|---|---|---|
| `assets/few-shot-example/子应用通知主应用-用户信息同步` | `template/用户信息同步/` | apex profile/index.vue, both actions.ts |
| `assets/few-shot-example/子应用通知主应用-电站切换` | `template/电站切换/` | microfb actions.ts L136-166 |

## 沉淀步骤

1. 确认 GREEN 已合入业务仓库且验收通过
2. 写 `template/{场景}/before`：失败信号 + 缺失代码片段
3. 写 `template/{场景}/after`：双端完整片段 + 分步验收
4. 写 `assets/few-shot-example/{场景}`：触发 prompt + traceability
5. 更新 `references/qiankun-globalState-notification协议.md` message 注册表

## traceability 自检清单

- [ ] before 含可识别的 **失败信号**（非仅「缺代码」）
- [ ] after 含 **双端** 文件路径
- [ ] after 含 **分步验收**（不刷新、DevTools 查 key）
- [ ] few-shot 含 **触发 prompt** 一段完整用户话术
- [ ] message 已写入 references 注册表
- [ ] template 与 few-shot 职责不混淆（见 `template/README.md`）

## 反模式

- before/after 只有标题无代码 → 说明壳，需重写
- 把业务仓库路径写进 feature 目录名 → 样本放 assets，不放 feature 名
- 复制 after 到 template 但不加失败信号说明 → template 不合格

## 输出

```text
fewShotPath: assets/few-shot-example/...
templatePath: template/.../before|after
sourceTraceability: [file1, file2]
acceptanceChecklist: [step1, step2]
registryUpdated: true|false
```

## 使用示例

```text
nebula 用户名同步已落盘，沉淀到 assets + template/用户信息同步，
并自检 traceability 六项。
```
