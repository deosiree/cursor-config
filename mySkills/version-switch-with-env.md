# 技能：版本切换与 env 控制 (Version Switching with Env)

## 目标

在**不拆仓、不频繁切分支**的前提下，为项目增加一套**基于环境变量/配置的版本控制机制**，让同一份代码可以：

- 通过 **env / 配置中心** 控制当前启用的业务版本（如 `v1` / `v2` / `v3`）
- 支持 **按环境 / 按租户 / 按请求** 切换版本
- 支持 **灰度发布、A/B 实验、快速回滚**

当你在对话中提到：

- 「在不同 env 上切 V1/V2 行为」
- 「想通过环境变量控制新旧版本」
- 「需要一套可回滚的版本开关方案」

就应该主动加载并遵循本 Skill。

---

## 适用场景

**适用：**

- 同一个服务需要同时支持 **多个业务版本**（如老流程 V1、新流程 V2）
- 希望通过修改 env/config 就能 **切换/灰度/回滚**，而不是反复改代码发版
- 需要按 **环境 / 租户 / 客户 / 请求** 启用不同版本能力
- 已经出现大量「`if (isNewVersion)`」或「长期挂着的 feature 分支」，维护成本很高

**不适用：**

- 不同版本已经演变为 **完全不同的系统/服务**，逻辑差异极大（应该拆仓/拆服务）
- 差异只与资源配置有关（实例数、内存、限流等），而不是业务语义版本
- 一次性、很快删除的临时实验代码

---

## 使用方式（如何在对话中触发）

在对话中，如果用户有类似需求，可以这样触发本 Skill：

- 直接方式：
  - 「**设计一套通过 env 控制 V1/V2 行为的方案**」
  - 「**帮我在这个项目里加版本控制，支持通过环境变量切换**」
- 关键词方式：
  - 包含：`版本切换`、`多版本`、`通过 env 控制版本`、`灰度发布`、`快速回滚` 等描述

当你检测到这些意图时：

1. **先加载并遵循本 Skill 的流程**，给出整体设计方案
2. 再根据用户项目代码结构，具体落地到对应的文件和实现

---

## 流程指令（AI 内部执行步骤）

> 目标：把「基于 env 的版本控制」做成一套**可复用模式**，而不是散落的 if-else。

### 第 1 步：明确「版本」的语义和粒度

1. 向用户澄清/自行假设（并在答案中说明）：
   - 版本是按 **整体业务版本**（如 V1/V2）还是按 **单个功能**？
   - 版本切换是按 **环境级**（dev/test/prod）、**租户级** 还是 **请求级**？
2. 给出一个清晰的 **版本类型定义** 示例，例如：

```ts
// 示例：后端 / Node / TS
export type AppVersion = 'v1' | 'v2' | 'v3';
```

### 第 2 步：设计统一的「版本来源」与解析函数

1. 设计统一入口，例如：
   - `readAppVersionFromEnv()`
   - 或 `getCurrentVersion(context)`（context 内含请求 / 租户 / env 信息）
2. 规则：
   - **只能在这里读取 env / 配置中心，不允许在业务代码到处 `process.env.xxx`**
   - 必须：
     - 做 **白名单校验**（只允许合法版本）
     - 提供 **安全默认值**（如默认 `v1`）
     - 在异常值时记录日志/告警（文字上说明即可，不必强制写死实现）

示例（可按项目技术栈改写）：

```ts
export type AppVersion = 'v1' | 'v2';

export function readAppVersionFromEnv(): AppVersion {
  const raw = process.env.APP_VERSION ?? 'v1';
  if (raw !== 'v1' && raw !== 'v2') {
    // TODO: 记录告警日志
    return 'v1';
  }
  return raw as AppVersion;
}
```

### 第 3 步：建立「版本路由层」（version router）

1. 在**靠近入口的地方**（接口控制器 / service 入口 / 前端页面路由）创建一个统一的版本路由：
   - 例如：`handleRequestWithVersionRouter`、`renderPageByVersion` 等
2. 该层只做两件事：
   - 读取当前版本：`const version = readAppVersionFromEnv()`
   - 按版本派发到各自实现模块：

```ts
import { readAppVersionFromEnv, AppVersion } from './version-config';
import { handleV1 } from './impl-v1';
import { handleV2 } from './impl-v2';

export function handleRequest(payload: Payload) {
  const version: AppVersion = readAppVersionFromEnv();

  switch (version) {
    case 'v1':
      return handleV1(payload);
    case 'v2':
      return handleV2(payload);
    default:
      // 兜底：回退到稳定版本
      return handleV1(payload);
  }
}
```

> **关键要求：** 尽量把「版本判断」集中在路由层，而不是在所有深层业务函数里 scattered `if (version === 'v2')`。

### 第 4 步：拆分版本实现 & 抽取公共逻辑

1. 为不同版本建立**独立实现文件**：
   - 如：`impl-v1.ts`、`impl-v2.ts`
2. 将公共逻辑抽成共享模块（如 `shared.ts`），避免复制粘贴：

```ts
// shared.ts
export function calcBase(payload: Payload) {
  // 版本无关的公共逻辑
  return { /* ... */ };
}

// impl-v1.ts
import { calcBase } from './shared';

export function handleV1(payload: Payload) {
  const base = calcBase(payload);
  return { ...base, mode: 'legacy' };
}

// impl-v2.ts
import { calcBase } from './shared';

export function handleV2(payload: Payload) {
  const base = calcBase(payload);
  return { ...base, mode: 'modern' };
}
```

### 第 5 步：设计回滚与灰度策略（基于配置）

在给用户的方案中，明确说明：

- **回滚方式：**
  - 改 env：`APP_VERSION=v2 → v1`
  - 或在配置中心修改版本字段
- **灰度/AB：**
  - 可以按 **租户 / 客户 / 实例** 维度在版本解析函数中做分流
  - 但仍然保持「一个统一的版本解析入口」这一约束

---

## Quick Reference（速查）

- **统一版本类型**：`type AppVersion = 'v1' | 'v2' | ...`
- **唯一版本来源**：`readAppVersionFromEnv()` / 配置中心
- **集中路由**：入口处 `switch(version) → impl-v1/impl-v2`
- **实现隔离**：每个版本独立文件 + 公共逻辑抽取
- **配置驱动**：所有切换依赖 env/config，不依赖「临时代码修改」
- **安全默认值**：env 异常时回退到稳定版本，并提示/记录告警

在回答用户时，可以用一小段「架构图 + 示例代码」说明整体结构，避免只给零散代码片段。

---

## 使用示例（和用户的对话模板）

### 示例 1：给出整体设计

> 用户：  
> 「现在有 V1/V2 两套流程，想通过 env 控制不同环境启用哪个版本，并且能快速回滚，你帮我设计一下？」

建议回答结构：

1. 先用 2～3 句话说明整体思路（统一版本类型 + 解析函数 + 路由层 + 版本实现模块）
2. 给出一个最小可行的目录/模块拆分示例
3. 结合当前项目的框架/技术栈，标出应该放到哪些文件里

### 示例 2：在现有项目中落地

> 用户：  
> 「这个 `apex_dev` 项目里，我们想在接口 X 上支持 V1/V2 切换，怎么改？」

执行步骤：

1. 找到接口 X 的入口（controller / router / API handler）
2. 在入口处：
   - 引入 `readAppVersionFromEnv()`
   - 把原有逻辑拆成 `impl-v1`，新增 `impl-v2`
   - 增加 `switch(version)` 路由逻辑
3. 确认 env 配置方案，并给出 prod / test 示例配置

---

## 常见问题 & 反模式

### 反模式 1：到处直接读 env

```ts
// 反例
if (process.env.APP_VERSION === 'v2') {
  // 新逻辑
} else {
  // 旧逻辑
}
```

- 问题：
  - 难以全局搜索版本相关逻辑
  - 不同模块可能读到不一致的 env（拼写错误、默认值不同）
- 改进：
  - 集中封装到 `readAppVersionFromEnv()` / 配置模块中

### 反模式 2：复制一整套目录当「新版本」

```text
services/
  v1/
    ...
  v2/
    ... // 基本是复制粘贴 v1 再少量修改
```

- 问题：
  - 大量重复代码，修 bug 容易改漏
  - 公共逻辑难以识别和抽取
- 改进：
  - 先抽出公共 `shared` 层，再在版本实现里只保留真正有差异的部分

### 反模式 3：回滚依赖「改代码 + 发版」

- 表现：
  - 想回滚 V2 → V1 时，需要：
    - 改路由代码
    - 打包 / 构建 / 发版
- 改进：
  - 回滚应尽量通过：
    - 修改 env / 配置中心 中的版本值
    - 或关闭某个 feature flag

---

## 注意事项

- 在设计版本类型时，尽量 **语义化**（如 `'legacy' | 'modern' | 'experiment'`），而不是魔法字符串 `'1' | '2' | '3'`。
- 保证版本解析逻辑本身**可测试**（单元测试覆盖合法值/非法值/默认值）。
- 对于前后端协同的场景，可以约定：
  - 后端通过响应头 / 字段返回 `currentVersion`
  - 前端根据版本决定 UI 流程，但版本含义保持一致。

当你为用户实现「基于 env 的版本控制/版本切换」时，**先回到本 Skill 检查是否满足上述模式，再开始具体编码**。

