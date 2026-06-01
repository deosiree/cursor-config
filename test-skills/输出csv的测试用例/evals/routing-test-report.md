# 端到端路由测试报告

## 路径 1：API（test.ts → CSV）

**Prompt：**「整理 apex_dev 菜单相关 gateway 和 api 的 test.ts…」

| 步骤 | 位置 | 决议 | 状态 |
|------|------|------|:----:|
| RED：识别输入类型 | 主 SKILL | test.ts 路径 ✅ | ✅ |
| RED：缺 `moduleId` | 主 SKILL | 从模块名推断 / 追问 | ⚠️ 可推断但无强制追问 |
| G1：补齐字段 | 主 SKILL missingFacts | 追问 moduleId | ✅ |
| GREEN：路由 | 主 SKILL | → `基于test.ts生成` | ✅ |
| 1. 扫描 | intention | 列出 describe/it | ✅ |
| 2. 路由 feature | intention | → api + gateway | ✅ |
| **G2：Cases 预览** | **intention Step 4→5** | **需展示 2 条样例** | **❌ 缺失** |
| G4：质量自检 | intention Step 5 | 运行 checklist | ✅ |
| G3：CSV 覆盖确认 | intention Step 6 | CSV 已存在时确认 | ❌ 缺失 |
| 7. Darwin | intention Step 7 | → darwin 拓展发现 | ✅ |

**可达性：✅ 可达。缺口：G2 和 G3 缺失。**

## 路径 2：UI（边开发边输出）

**Prompt：**「角色新增 Tab 校验失败要录入测试系统…」

| 步骤 | 位置 | 决议 | 状态 |
|------|------|------|:----:|
| RED：识别输入类型 | 主 SKILL | UI 用例（边开发边输出） | ✅ |
| RED：缺 `创建人员` | 主 SKILL | 可默认「惠岩」 | ✅ |
| GREEN：路由 | 主 SKILL | → `边开发边输出UI用例` | ✅ |
| 1. 撰写/校对 | intention | 按 UI 规则写 cases | ✅ |
| **G2：Cases 预览** | **intention** | **可选（可跳过）** | **⚠️ 非强制** |
| 3. 调用脚本 | intention | append_ui_cases_to_csv.py | ✅（已验证） |
| 4. 回报 | intention | 输出路径/条数 | ✅ |

**可达性：✅ 可达。缺口：G2 为可选非强制。**

## 路径 3：口述（无 test.ts）

**Prompt：**「根据口述整理租户管理页面 UI 用例…没有 test 文件」

| 步骤 | 位置 | 决议 | 状态 |
|------|------|------|:----:|
| RED：识别输入类型 | 主 SKILL | 仅口述，无 test.ts | ✅ |
| G1：缺字段 | 主 SKILL | 追问 moduleId/模块名/outputPath | ✅ |
| **GREEN：路由** | **主 SKILL** | **→ darwin → 提议 ** | **⚠️ 子优化** |
| | | **现有 `基于源码+口述生成` intention 可直接路由** | |
| G2：Cases 预览 | intention | 展示 2 条样例 | ✅ |
| G4：质量自检 | intention | 运行 checklist | ✅ |

**可达性：✅ 可达。缺口：路由链多绕了一道 darwin，应直连 `基于源码+口述生成`。**

## 发现汇总

| # | 问题 | 影响路径 | 严重度 |
|---|------|---------|:------:|
| A | G2 Cases 预览在 API 路径缺失 | API | 🔴 |
| B | G2 在 UI 路径为可选非强制 | UI | 🟡 |
| C | G3 CSV 覆盖确认无实现 | API | 🔴 |
| D | 口述路径绕道 darwin | 口述 | 🟡 |
| E | G1 RED 追问未命名标准化 | 全部 | 🟢 |
