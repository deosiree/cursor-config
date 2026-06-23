# 微服务-qiankun-主子通信

qiankun 微前端主子应用 `globalState` + `notification` 协议技能套件。

## 快速开始

```
使用 $微服务-qiankun-主子通信
```

或按意图直达：

| 意图 | skill |
|---|---|
| 路由分发 | `intention-skills/路由-主子通信任务` |
| 排查现状 | `intention-skills/分析-通信基线` |
| 新增 notify | `intention-skills/编排-扩展notification` |

## 真实使用示例

**用户名同步（nebula）**

子应用 `apex_dev` 个人中心改用户名后，主应用 `microfb` 右上角不更新：

1. 🔴 CHECKPOINT：message=`profile_username_updated`，consumerPattern=patchStore
2. 子应用：`notifyMainApp("profile_username_updated", { username })`
3. 主应用：`handleProfileUsernameUpdated` → patch `userStore.userInfo`
4. 验收：不刷新页面，Navbar 即时更新

源文件：

- `nebula/apex_dev/src/views/profile/index.vue`
- `nebula/apex_dev/src/plugins/qiankun/actions.ts`
- `nebula/microfb/src/plugins/qiankun/actions.ts`

**电站 tab 高亮（前人样本）**

- message: `station_change_fromChild`
- consumerPattern: customEvent
- 消费: CustomEvent `qiankun-child-switch-station`

## 目录结构

```
微服务-qiankun-主子通信/
├── SKILL.md                 # 主入口 + CHECKPOINT
├── intention-skills/        # 3 个编排/分析/路由
├── feature-skills/          # 6 个原子实现
├── references/              # notification 协议与 message 注册表
├── assets/few-shot-example/ # agent 用完整样本
├── template/                # 人类用 RED/GREEN（见 template/README.md）
│   ├── 用户信息同步/before|after/
│   └── 电站切换/before|after/
└── evals/                   # 触发试跑 + Darwin 记录
```

## Single Dispatch

主 skill 与路由 intention **一次只 dispatch 一个** 子 skill。写码前见主 SKILL「🔴 CHECKPOINT · 写码前确认」。

## 不应触发的请求

- 「改 Navbar 字体颜色」→ CSS，非本套件
- 「axios 拦截器加 token」→ 网络层，非 globalState

## 评估

见 `evals/evals.json`、`evals/test-prompts.json`、`evals/results/`。
