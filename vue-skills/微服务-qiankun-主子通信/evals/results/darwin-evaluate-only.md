# Darwin evaluate-only 记录

**模式**：evaluate-only（首版评分 + 试跑，不自动 hill-climbing）  
**日期**：2026-06-23  
**目标**：总分 ≥ 75；dim8 输出含 message 命名、双端文件、timestamp 去重、lazy import、字段映射

---

## 9 维静态评分（主 SKILL.md + 套件）

| # | 维度 | 权重 | 得分/10 | 加权 | 备注 |
|---|---|---|---|---|---|
| 1 | Frontmatter 质量 | 7 | 9 | 6.3 | name/description 含 qiankun、notifyMainApp、sideEffect 触发词 |
| 2 | 工作流清晰度 | 12 | 8 | 9.6 | Single Dispatch 路由表 + RED/GREEN/REFACTOR |
| 3 | 失败模式编码 | 12 | 8 | 9.6 | 失败分支表：isQiankunEnv、timestamp、message、字段 |
| 4 | 检查点设计 | 6 | 6 | 3.6 | Human Loop 在路由 intention；缺 🔴/STOP 显性标记 |
| 5 | 可执行具体性 | 17 | 9 | 15.3 | nebula 真实路径 + 代码片段 + 5 步编排 |
| 6 | 资源整合度 | 6 | 9 | 3.6 | references、6 feature、3 intention、2 few-shot 可达 |
| 7 | 整体架构 | 12 | 9 | 10.8 | 父级 + intention/feature 分层，无冗余废话 |
| 8 | 实测表现 | 23 | 8 | 18.4 | 见下方 T1–T3 试跑 |
| 9 | 反例与黑名单 | 6 | 9 | 5.4 | 反模式黑名单独立章节 |

**总分：82.6 / 100** ✅（≥ 75）

**改进建议（不自动改码，供 hill-climbing 人工门禁）：**

- dim4：编排 intention 加显性 CHECKPOINT（message 命名确认后再写码）
- dim8：F1/F2 负例可在主 SKILL 加「不触发关键词」示例

---

## evals 试跑（T1–T3）

### T1：子应用改了用户名，microfb 右上角不更新，怎么同步

| 项 | 带 skill | 不带 skill baseline |
|---|---|---|
| 触发 | ✅ 命中 `微服务-qiankun-主子通信` | 可能建议 refresh/getUserInfo/Storage |
| 首 dispatch | ✅ `路由-主子通信任务` → `编排-扩展notification` | 无统一协议 |
| dim8 必含项 | | |
| message 命名 | ✅ `profile_username_updated` | ❌ 常遗漏 |
| 双端文件 | ✅ apex profile + both actions.ts | ❌ 常只改一端 |
| timestamp 去重 | ✅ hasChangedByTimestamp | ❌ 常遗漏 |
| lazy import | ✅ import("@/store") | ❌ 易循环依赖 |
| 字段映射 | ✅ username + userName 双写 | ❌ 常只写 userName |

**T1 结论**：PASS

### T2：参考 nebula 加一个 profile_username_updated 通知

| 项 | 带 skill | baseline |
|---|---|---|
| 首 dispatch | ✅ 直达 `编排-扩展notification` | 需人工搜代码 |
| 5 步编排 | ✅ 判定→子应用→sideEffect→映射→验收 | 步骤不完整 |
| few-shot 引用 | ✅ 用户信息同步样本 | 无 |

**T2 结论**：PASS

### T3：子应用切换电站后要通知主应用高亮 tab

| 项 | 带 skill | baseline |
|---|---|---|
| message | ✅ `station_change_fromChild` | 可能自造命名 |
| 消费模式 | ✅ CustomEvent `qiankun-child-switch-station` | 可能误用 patchStore |
| few-shot | ✅ 电站切换样本 | 无 |

**T3 结论**：PASS

### F1/F2 负例（应不触发）

| id | prompt | 预期 | 判定 |
|---|---|---|---|
| F1 | 纯 CSS 改 Navbar 字体颜色 | 不触发 | ✅ 主 SKILL「何时不要使用」已排除 |
| F2 | axios 拦截器加 token | 不触发 | ✅ 无 qiankun/globalState 关键词 |

---

## dim8 汇总

| 必含项 | T1 | T2 | T3 |
|---|---|---|---|
| message 命名 | ✅ | ✅ | ✅ |
| 双端文件 | ✅ | ✅ | ✅（主应用侧 + notify 示意） |
| timestamp 去重 | ✅ | ✅ | ✅ |
| lazy import | ✅ | ✅ | N/A（CustomEvent 型） |
| 字段映射 | ✅ | ✅ | N/A |

**dim8 提升**：相对 baseline 三例均 PASS。

---

## Keep / Revert

- **Keep**：首版套件保留，不回滚 nebula 业务代码
- **Human Loop**：是否进入 hill-climbing 优化 dim4 检查点 → **待人工确认**

---

## Runtime 红灯扫描

```text
grep 主 SKILL.md / README.md：无 "Claude Code only" / runtime 绑定措辞
```

**runtime_warn=0**
