---
name: common-skills查重与增强
description: 新建 feature/intention 前检查 common-skills 是否已有类似能力；缺失时先增强 common-skills 再引用。被 策略-新建skill 调用。
---

# common-skills 查重与增强

> **定位：** 功能 skill。确保每次新建能力时优先复用或增强 common-skills，不重复造轮。

## 唯一真相源

common-skills 的唯一真相源路径：

```
C:\Users\huiyan\Documents\Repertory\daily-report-generator\.cursor\common-skills\
```

> 在本工作区中映射为 `../../../common-skills/`（相对 write-skill 所在的 agent-skills 目录）。

## 执行流程

### 步骤 1：查重

```
1. 获取待建 feature/intention 的 description（名称 + 能力描述）
2. 扫描 common-skills/ 下所有子目录的 SKILL.md / README.md
3. LLM 根据 description 判断：
   - 是否已有同名或近似 skill？
   - 能力范围是否覆盖本次需求？
4. 输出查重结果：
   {
     "已存在": true/false,
     "匹配项": "skill 名称 + 路径",
     "匹配度": "完全匹配/部分匹配/不匹配",
     "说明": "已有能力是否足够、是否需要增强"
   }
```

### 步骤 2：决策

| 查重结果 | 动作 |
|---------|------|
| 完全匹配 | → 不新建，在目标 skill 中用 `[[相对路径/SKILL.md]]` 引用 |
| 部分匹配（需增强） | → 先增强 common-skills（步骤 3），再引用 |
| 不匹配 | → 新建 feature，完成后评估是否值得沉淀到 common-skills |

### 步骤 3：增强 common-skills

当 common-skills 已有近似 skill 但能力不足时：

```
1. 判断缺失的是什么：
   - 缺子 intention skill？→ 在对应 skill 的 intention-skills/ 下新建
   - 缺 feature skill？→ 在对应 skill 的 feature-skills/ 下新建
   - 缺方法论/规则文档？→ 在对应 skill 下新建 SKILL.md 或 references/
2. 在 common-skills 中创建增强内容
3. 在目标 skill 中用 `[[相对路径/SKILL.md]]` 引用
```

### 步骤 4：沉淀评估

新建的 feature 满足以下条件时应沉淀到 common-skills：

- 能力可被 ≥2 个不同 skill 套件复用
- 不包含当前 skill 特有的业务逻辑
- 已有完整的 RED/GREEN/REFACTOR 结构

## RED

| 反模式 | 替代 |
|-------|------|
| 发现 common-skills 有类似能力但不引用 | 必须引用，标注⚠️ 有重复 |
| common-skills 能力不足但不增强 | 先增强 common-skills 再引用 |
| 新建通用能力但不沉淀 | 自动在 common-skills 创建，标注来源 |
