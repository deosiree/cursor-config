---
name: 菜单节点的唯一性和有效性校验
description: Use when auditing Nebula menu nodes for uniqueness/validity against docs/plans/前端的表单校验规则.md, converting YAML exports to JSON, running apex_dev pnpm scan:menu-rules, or aligning MenuFormDialog chkPathDup/chkAncPath—not seccenter full-table perm.
---

# 目标

对照文档规则，对菜单节点做**只读**唯一性/有效性校验；或对齐菜单表单挂载。产物可为扫描报告解读或表单改动要点，**禁止**写接口/推送。

## 适用场景

1. 「按文档扫一下导出菜单有没有违规」
2. YAML（snake_case）→ JSON → `pnpm scan:menu-rules`
3. function 被「同项目 path 重复」误拦 → 应对齐 `chkAncPath` 而非 `chkPathDup`
4. 解读单文件 0 命中 vs 合并 `_all` 的 `page.combo`

## 规则真源（硬约束）

- 真源：`nebula/docs/plans/前端的表单校验规则.md`
- **禁止**用未上传的 seccenter「perm 全表唯一」覆盖文档「同 `parent_id`」
- 细节见 [references/规则真源与口径.md](references/规则真源与口径.md)

## 工作流 A：存量扫描

1. 确认输入是 YAML 还是已转换 JSON；YAML → 先转换（见 [references/命令与输入格式.md](references/命令与输入格式.md)）。
2. 在 `apex_dev` 执行：
   ```bash
   python scripts/convert-menu-yaml-to-json.py <yamlDir> <jsonOutDir>
   pnpm scan:menu-rules -- --input <menu.json> [--out report.json]
   ```
3. **先分文件 / 单 project 扫**，再决定是否扫 `_all.json`。
4. 按 [references/违规码词典.md](references/违规码词典.md) 解读；给出「改配置 vs 放宽」倾向。
5. 输出：命中数、按 code 分组、单项目结论、合并扫描若有 `page.combo` 的单独说明。

### 失败分支（A）

| 如果 | 则 |
|------|-----|
| YAML 无 `menus` 或只能当文本扫 | STOP：要求合法导出或先手工补结构 |
| 未转 snake_case（仍见 `route_path`） | STOP：先 `convert-menu-yaml-to-json.py` |
| 用户把多文件合并结果当「单项目脏」 | 纠正：先给分文件结果，再谈跨项目 |
| 用户要求写接口改库 | 拒绝；只读扫描 |

## 工作流 B：表单对齐

1. 读 `menu-formRules.ts`：`chkPathDup`（dir/page 同项目）、`chkAncPath`（function 父链）。
2. `MenuFormDialog`：dir/page → 精确语法 + `chkPathDup`；function → fuzzy + `chkAncPath`；**保留** perm 同级唯一。
3. 失败文案走 i18n（如「不能与父链上的路由路径相同」）。
4. 测：`__tests__/menu-formRules.test.ts` / `__tests__/scan-menu-rules.test.ts`。

### 失败分支（B）

| 如果 | 则 |
|------|-----|
| function 仍挂 `chkPathDup` | 改为 `chkAncPath`；勿删同项目 route 唯一性 |
| 有人提议删 perm 同级校验 | 拒绝；文档要求同级唯一 |

## 决策表（扫描解读）

| 现象 | 决策 |
|------|------|
| 单文件 0 命中 | 该项目在文档口径下合规 |
| `_all` 大量 `page.combo`，分文件为 0 | 跨项目 path+params；问是否同库共存再改/放宽 |
| 删克隆项目后仍余少数 `page.combo` | 余对属真实跨项目冲突（如 test↔test_data） |
| 仅跨页复用同 perm、不同 parent | **合法**；勿用全表 perm 规则误报 |

## 🔴 CHECKPOINT

出现跨项目 `page.combo`（典型：合并 `_all`）时 **STOP**：先确认「多项目是否必须同库共存」，再谈改配置或放宽全库 page 组合唯一。

## 反例 / 黑名单

1. 不扫写接口、不批量推送菜单。
2. 不用 seccenter 全表 `perm` 唯一替代文档同级规则。
3. 不把跨项目 `page.combo` 当成单项目脏数据去改干净项目。
4. 不对 YAML 直接跑扫描（必须先 convert）。
5. 不删除 dir/page 的同项目 `routePath` 唯一性来「修好」function。

## 脚本位置（不拷贝进本 skill）

指挥 `apex_dev` 既有实现，见 [scripts/README.md](scripts/README.md)。会话样例见 [assets/few-shot-example/t-cloud会话扫描.md](assets/few-shot-example/t-cloud会话扫描.md)。
