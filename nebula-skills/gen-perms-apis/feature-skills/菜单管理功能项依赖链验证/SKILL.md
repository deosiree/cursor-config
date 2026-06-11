---
name: 菜单管理功能项依赖链验证
description: 菜单管理功能项 E2E 自动化测试：8 场景矩阵、依赖链验证（查询→编辑→权限配置→配置API）。首选 node 脚本执行；附带 scenarios/、scripts/、examples/。触发词：菜单管理e2e、菜单权限测试、功能项验证、双会话跑菜单、跑S8、8场景矩阵。
---

# 菜单管理功能项依赖链验证

## TL;DR

1. **默认走脚本**，不要手搓 opencli 逐步点：`node scripts/run-e2e-scenario.node.js scenarios/XX.json`
2. 全矩阵：`node scripts/run-all.node.js` 或 `scripts/run-all.bat`
3. 手操 opencli 仅用于 **脚本失败后的 debug**（见文末「Debug 手操」）
4. Step 2 勾选必须用 **`opencli check/uncheck --role checkbox --name`**，禁止 eval 点 `.el-checkbox`（Vue 会回滚）
5. **`scripts/*.js` 只跑不改**：实跑失败、`SyntaxError`、`node --check` 失败时 **禁止** StrReplace/追加修补；从 git 整文件恢复（基线 commit `7008806`）或向用户报 blocker

## RED

- 没有本 skill 时，agent 可能只测一两个场景就下结论，遗漏关键依赖关系
- 也容易把 8 种组合压成一次性操作，跳过中间态验证
- **最严重的失败模式：看到功能项面板后直接点「确 定」保存，跳过清空+勾选** → 旧权限累积，结果不可信
- **第二严重：用 eval 点 checkbox 而非 opencli check/uncheck** → 看似勾上，保存后仍是旧值
- 常见失败：
  - 未验证负向（`expectHiddenToolbar` / `expectHiddenRowOps`）→ 误判 PASS
  - 忽略依赖链 → 测编辑但没给查询，误判「编辑不可见」为 bug
  - test 用户未 logout→relogin → sessionStorage 残留旧 perm

## 菜单管理功能项清单

| 功能项 | perm 标识 | UI 位置 | 依赖 |
|--------|----------|---------|------|
| 查询 | `sys:menu:query` | toolbar 搜索 | **树加载前提** |
| 新增 | `sys:menu:add` | toolbar 新增 | 独立 |
| 导入 | `sys:menu:import` | toolbar 导入 | 独立 |
| 导出 | `sys:menu:export` | toolbar 导出 | 独立 |
| 编辑 | `sys:menu:edit` | 行操作 + tab | 需查询→树→行操作列 |
| 删除 | `sys:menu:delete` | 行操作 + tab | 需查询→树→行操作列 |
| 配置API | `sys:menu:configApi` | 权限配置弹窗内 | 需查询→编辑→权限配置→弹窗 |

## 依赖链

```
查询 → 树加载 → 行操作列（编辑/删除/权限配置）→ 权限配置弹窗 → API配置
```

## 新会话调用

```text
使用 $梳理权限点与apis 直接用菜单管理跑一遍 E2E 测试，8 个场景全过一遍。
```

agent 收到后应：

```
1. 确认 opencli 双 profile + localhost:8080
2. cd 到本 skill 的 scripts/ 目录
3. 执行 node run-all.node.js（或 --only 指定场景）
4. 读取终端 PASS/FAIL + examples/result-*.json
5. 若有 FAIL → 对单场景 rerun run-e2e-scenario.node.js 看日志，再决定是否 Debug 手操
```

> 调用前：`opencli profile list` ≥2 个 profile；`http://localhost:8080` 服务运行中。

## 前置条件

- admin profile → `p2ejw7ww`，test profile → `q5prwymq`（可用 `--admin` / `--test` 覆盖）
- 「权限测试角色」已存在且分配给 huiyan (13813815913)
- 通用双会话策略见 `[[../OpenCLI双会话权限验证]]`

## 目录结构（唯一真相源）

```
.cursor/nebula-skills/gen-perms-apis/feature-skills/菜单管理功能项依赖链验证/
├── SKILL.md
├── scripts/     ← run-e2e-scenario.node.js（主入口）、run-all.node.js、run-all.bat
├── scenarios/   ← 01~08 场景 JSON
├── examples/    ← result-*.json
└── test-prompts.json
```

> `.reasonix/skills/menu-perm-e2e/` 下 `scripts/`、`scenarios/`、`examples/` 为硬链接镜像；**只改本目录**。

### 一键运行

```bat
cd .cursor\nebula-skills\gen-perms-apis\feature-skills\菜单管理功能项依赖链验证\scripts
run-all.bat                    REM S1~S8
run-all.bat --only 6,7,8
run-s1.bat
```

```bash
node scripts/run-all.node.js
node scripts/run-e2e-scenario.node.js scenarios/08-query-edit-configapi.json
node scripts/run-e2e-scenario.node.js scenarios/06-query-edit.json --admin p2ejw7ww --test q5prwymq
```

`run-all.node.js` 默认：**首轮前 admin 预热**；首轮不重试，全部跑完后对失败用例**补跑 1 轮**并输出详细日志（`--no-rerun` / `--no-warmup` 可关闭）。

脚本清单与 deprecated 文件见 `scripts/README.md`。

## 场景 JSON 契约

每个 `scenarios/XX-*.json` 至少含：

| 字段 | 说明 |
|------|------|
| `id` / `title` | 场景标识 |
| `check` | admin 要勾选的功能项 label 数组 |
| `expectedPerms` | test 用户 sessionStorage 应包含的 perm |
| `expectToolbar` | 如 `["搜索:VIS"]` |
| `expectTree` | `true` 表示表格已加载 |
| `expectRowOps` | 可见行操作，如 `["编辑","权限配置"]` |
| `expectHiddenToolbar` | 可选，如 `["新增:hid"]` |
| `expectHiddenRowOps` | 可选，不应出现的行操作 label |
| `expectApiConfigInDialog` | S8：`true` 时验证权限配置弹窗内 API配置 |

新增场景：复制最接近的 JSON，改 `check` 与 expect 字段，用 `--only` 单跑验证。

## 首选：Node 脚本内部流程

`run-e2e-scenario.node.js` 自动执行以下步骤（**agent 默认应直接调脚本，勿逐步复制 opencli 命令**）：

| 步骤 | 动作 |
|------|------|
| Step 0 | admin 打开角色管理 → 编辑「权限测试角色」→ 菜单权限 Tab → 搜索「菜单管理」→ 点树节点 |
| Step 2a | `btns[3].click()` 清空功能项 |
| Step 2b | 对 7 个功能项逐个 `opencli check/uncheck --role checkbox --name <label>`，与 `check` 对齐 |
| Step 2c | eval 读 checkbox 状态 → **不一致则 exit 1 拒绝保存** → textContent「确 定」保存 → 等 3s |
| Step 4 | test logout → confirm → `sessionStorage.clear()` → 登录页 fill 重登 |
| Step 5 | 打开菜单管理 → eval 读 perms / toolbar / rowOps / tableLoaded |
| S8 额外 | 点「权限配置」→ 弹窗内找 `[data-op-label="API配置"]` |

Windows 注意：脚本经 `cmd.exe /c opencli` 调用，避免 ENOENT。

## 检查点设计

### ⛳ A：弹窗就绪（Step 0 后）

脚本内已 `wait selector ".el-checkbox__label"`。手操 debug 时 eval：`.el-dialog` 可见且功能项面板已出。

### ⛳ B：功能项状态门禁（Step 2c 保存前）

**脚本路径**：stdout 出现 `state: {"新增菜单":false,...}` 且与 `check` 一致；若输出 `功能项状态与 check 不一致，拒绝保存` → 回 Step 0，勿强行保存。

**手操路径**：保存前 eval 读 state JSON，目标项 `true`、非目标项 `false`。

### ⛳ C：弹窗已关闭（保存后）

eval：`document.querySelector('.el-dialog')` → `closed`。仍为 `open` → 保存失败（常见：用了 `.el-button--primary` selector）。

### ⛳ D：Test 已登录（Step 4 后）

`location.href` 含 dashboard；`userInfo.username` 为 huiyan。

### ⛳ E：断言门禁（Step 5 后）

脚本输出 `🏁 PASS` / `FAIL` 及各维度 ✓/✗。连续 3 场景 FAIL → 停跑查环境。

## 错误处理速查

| 失败场景 | 特征 | 修复 |
|---------|------|------|
| Profile 断开 | `not connected` | `opencli profile list` 重连 |
| 跳过清空直接保存 | perms 不变 | 必须先 2a 清空再勾选 |
| eval 点 checkbox | 保存后状态不对 | 改用 `opencli check/uncheck --name` |
| Python 包装 run-scenario.js | `%` SyntaxError | 用 node 脚本，勿 Python subprocess 传 JS |
| 保存静默失败 | dialog 仍 open | 用 textContent「确 定」，勿 `.el-button--primary` |
| test 权限陈旧 | perms 与 admin 配置不符 | logout→confirm→sessionStorage.clear()→重登 |
| S8 API配置 FAIL | dialogOpen false | 确认 check 含「编辑菜单」且 rowOp「权限配置」可见 |
| `run-all.node.js` SyntaxError | 末尾出现 `h} 个`、`: 0);` 等碎片 | **勿局部删改**；`git show 7008806:.../run-all.node.js` 整文件恢复 |

## 脚本维护禁令

实跑或 `node --check` 报错时，agent **不得**编辑 `scripts/run-all.node.js`、`scripts/run-e2e-scenario.node.js` 等 runner（常见误操作：只删 `0);` 或重复 append 文件尾，会导致语法错误越改越长）。

允许动作：

1. 汇报 SyntaxError + 建议从 git 恢复
2. 业务 FAIL → 单场景 `run-e2e-scenario.node.js` 或 Debug 手操
3. 用户明确要求改脚本功能 → 整文件重写或基于干净基线修改，改后必须 `node --check`

## 实跑记录

| 日期 | 范围 | 结果 |
|------|------|------|
| 2026-06-03 | S1~S8 全矩阵 | 8/8 PASS |
| 2026-06-04 | S7、S8；S8 复跑 | 全部 PASS |

最新报告：`examples/result-2026-06-04.json`

```json
{
  "keyFindings": [
    "功能项勾选必须用 opencli check/uncheck，eval click 会被 Vue 回滚",
    "btns[3]=功能项清空；每轮前必须清空否则权限累积",
    "保存前 state 门禁：check 项 true、其余 false 才允许点确定",
    "test 必须 logout→confirm→sessionStorage.clear()→重登",
    "S8 依赖链：查询→编辑→权限配置弹窗→API配置"
  ]
}
```

## 场景矩阵

| # | 场景 | check | 关键验证 |
|---|------|-------|---------|
| 1 | 只选导入 | 导入菜单 | 导入可见，其他隐藏 |
| 2 | 只选导出 | 导出菜单 | 导出可见 |
| 3 | 只选新建 | 新增菜单 | 新增可见 |
| 4 | 只选查询 | 查询菜单树 | **树加载** |
| 5 | 查询+新建 | 查询、新增 | 搜索+新增 |
| 6 | 查询+编辑 | 查询、编辑 | 编辑+权限配置；新增/删除隐藏 |
| 7 | 查询+删除 | 查询、删除 | 删除可见；编辑/权限配置隐藏 |
| 8 | 查询+编辑+API | 查询、编辑、API配置 | 完整链路至弹窗 API配置 |

---

## Debug 手操（仅脚本失败时使用）

> 禁止自写 Python/batch 包装 opencli。禁止 `$(cat file)`（Windows 不支持）。
> checkbox 三步法细节见 `[[../OpenCLI双会话权限验证]]` §1a。

### Step 0：Admin 弹窗

```bash
opencli --profile p2ejw7ww browser admin open http://localhost:8080/cloud/Apex/system/role
opencli --profile p2ejw7ww browser admin wait time 2
# eval: 表格行含「权限测试角色」→ click [data-op-label="编辑"]
# eval: .el-tabs__item 文本「菜单权限」→ click
opencli --profile p2ejw7ww browser admin eval "var inp=document.querySelector('input[placeholder=\"请输入关键字进行搜索\"]');inp&&(inp.focus(),inp.value='菜单管理',inp.dispatchEvent(new Event('input',{bubbles:true})));'ok'"
opencli --profile p2ejw7ww browser admin wait time 1
# eval: .node-label 文本「菜单管理」→ click
opencli --profile p2ejw7ww browser admin wait selector ".el-checkbox__label"
```

### Step 2：清空 + check/uncheck + 保存

```bash
# 2a 清空
opencli --profile p2ejw7ww browser admin eval "document.querySelectorAll('#pane-permission button')[3].click();'cleared'"

# 2b 按场景 check 同步（示例 S6：查询+编辑）
opencli --profile p2ejw7ww browser admin uncheck --role checkbox --name 新增菜单
opencli --profile p2ejw7ww browser admin check --role checkbox --name 查询菜单树
opencli --profile p2ejw7ww browser admin check --role checkbox --name 编辑菜单
opencli --profile p2ejw7ww browser admin uncheck --role checkbox --name API配置
opencli --profile p2ejw7ww browser admin uncheck --role checkbox --name 导出菜单
opencli --profile p2ejw7ww browser admin uncheck --role checkbox --name 导入菜单
opencli --profile p2ejw7ww browser admin uncheck --role checkbox --name 删除菜单

# 2c 验证 state → 保存
opencli --profile p2ejw7ww browser admin eval "var inps=document.querySelectorAll('.el-dialog__body input[type=checkbox]');var s={};for(var i=0;i<inps.length;i++){var t=inps[i].parentElement.parentElement.textContent.trim();if(t.match(/菜单|API/))s[t]=inps[i].checked;};JSON.stringify(s)"
opencli --profile p2ejw7ww browser admin eval "var btns=document.querySelectorAll('button');for(var i=0;i<btns.length;i++){if(btns[i].offsetParent!==null&&btns[i].textContent.trim()==='确 定'){btns[i].click();break;}}'saved'"
opencli --profile p2ejw7ww browser admin wait time 3
```

### Step 4–5：Test 重登与验证

脚本已内联 logout/login/verify eval，手操时优先 **单跑 node 脚本只测 Step 4 之后**；若必须手操，流程见 `OpenCLI双会话权限验证` §2b。

## REFACTOR

- 新增场景：加 JSON + `--only` 单跑，不必改 SKILL
- 换页面 E2E：复用 scripts 模式，替换页面名与 ALL_FUNC_ITEMS
- API 从 merge 改 replace：可去掉 2a 清空步骤
- permsMap 加载方式变更：改 `run-e2e-scenario.node.js` Step 5 eval
