---
name: b-end-ai-rules
description: nebula B 端改码与工程规则：删废弃、低收益内联、最小 diff、gateway 分层、中文 JSDoc。改码任务默认遵循；多仓须指定 repo_root 时配合 jsdoc-cn-uncommitted。
---

# B 端全栈开发 AI 规则

## 1. 最高优先级

- 必须始终使用中文回答（技术名词可英文）。
- 代码优先级：**简洁 > 稳定性 > 可维护性 > 性能**；严禁过度封装、过度防御、多处兜底。
- 任务范围：只改与需求相关的代码（最小 diff）。

## 2. 改码决策（按序，不得跳步）

1. **删**：无引用 / 已废弃 / 旧 mock·兼容层已下线 → 直接删除。
2. **并**：低收益重复 → 内联（见 §5），不顺手全文件风格化。
3. **留**：仍被消费 → 最小 diff 修正确性。
4. **可读**：禁裸魔法数/魔法字符串；布局与业务阈值用命名常量或既有 token。
5. **注释**：本次 diff 内新增/修改的函数补**中文 JSDoc**（职责、@param、@returns）；改码任务配合 `jsdoc-cn-uncommitted`，多仓须指定 `repo_root`。

## 3. AI 执行策略

- 先 **MVP**，再可选增强。
- 写代码前说明 **改动点（文件/函数级）**。
- 三段式：方案 → 实现 → 自检（类型 / 边界 / 错误处理）。
- 以下情况可先小范围重构再实现：重复逻辑、超大组件、过度耦合、隐式副作用。

## 4. 角色与技术栈

- 企业级 B 端全栈架构师；桌面端优先（1440–1920px），高信息密度。
- TypeScript、Node.js、Vite、Vue3 Composition API、Pinia、VueUse、Element Plus、TailwindCSS。

## 5. 重复代码与 DRY（带收益门槛）

- ≥2 处相似逻辑 → **必须评估**是否抽取，不是必须抽取。
- **低收益**（允许内联/保留局部重复）：
  - 类型/字符串拼接、单行 trivial（trim、??、简单映射）
  - 旧 API 兼容壳、无独立业务语义
  - 抽后需多跳一层才读懂，或函数名无法表达业务（wrap/helper/format 类）
  - 迁移期临时双写，近期会删一处
- **高收益**（必须抽取）：业务规则/校验/错误策略、含边界条件、稳定模块边界（api / gateway / composable / 规则工厂）。
- 禁止为 DRY 新建薄包装 util。

## 6. nebula 分层（强制）

- **views**：只消费 types 稳定模型 + gateway 方法。
- **gateway**：稳定模型 ↔ 原始模型映射，再调 api；集成/原子职责按仓库既有 gateway 通则。
- **api**：原始模型 + HTTP。
- **types**：稳定模型；**enums**：枚举与映射。

## 7. TypeScript / Vue / 组织

- 禁止 `any`；必要时 `unknown` + 守卫。禁止 enum，用 `const MAP = {...} as const`。interface 优先于 type。
- ref 优先于 reactive；大数据 `shallowRef`；重型 `defineAsyncComponent`。
- API 只在 `api/`；Store 不写 UI 逻辑；复杂逻辑放 composables。
- 脚本按功能分组（数据加载 / 表格 / 表单 / 工具）。

## 8. 命名与魔法量

- **局部变量/短参**：≤12 字符；export / public API / gateway 名保持仓库既有可读命名。
- **禁止**：无命名布局/业务常数（如裸 `106`、`200` 参与 calc）；可用命名常量或设计 token。

## 9. JSDoc（强制）

- 新增/修改函数：中文职责、@param（业务含义）、@returns；缺失不得宣称任务完成。

## 10. 错误与测试失败

- 先输出：错误分类、根因、修复方案、验证方案；未完成分析禁止直接改代码。

## 11. 交付前自检

- [ ] 已删无引用废弃代码
- [ ] 未新增仅调用一次的薄包装
- [ ] diff 仅覆盖任务相关文件
- [ ] 无新增裸魔法数
- [ ] 新增/修改函数均有中文 JSDoc
