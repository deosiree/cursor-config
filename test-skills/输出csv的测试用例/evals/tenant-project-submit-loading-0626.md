# tenant-project-submit-loading-0626 导出记录

- **日期**：2026-06-26
- **来源**：租户管理 `index.vue` 管理项目提交 loading 修复（`useTenantPageLoading` + `useTenantListPage`）；Vitest + openCLI E2E
- **cases**：`configs/tenant-project-submit-loading-0626.cases.json`（5 条）
- **CSV**：`docs/问题单/0626/tenant-project-submit-loading-0626.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/tenant-project-submit-loading-0626.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/tenant.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0626/tenant-project-submit-loading-0626.csv \
  --force
```

## 覆盖场景

| 用例 | 验证点 |
|------|--------|
| 初始全绑定 → 待绑定 | 全选确定；loading 至列待绑定 + 绑定弹窗 |
| 初始待绑定 → 全绑定 | 全选确定；loading 至列全绑定后结束，无弹窗 |
| Round2 待绑定 → 全绑定 | 双向切换 |
| Round2 全绑定 → 待绑定 | 双向切换 + 绑定弹窗 |
| 边界 | 不得 loading 消失后列长时间为 `-` |

## 关联单测

```bash
cd apex_dev
pnpm test:unit src/views/tenant/composables/__tests__
```

- `tenant-project-submit-flow.test.ts`：`@closed` 误调 `resetLoading` 不提前关 loading
- `useTenantPageLoading.test.ts`：depth 栈嵌套

---

# openCLI E2E 验收脚本（tenant_test 管理项目提交 loading）

> **沉淀位置**：本文件为唯一维护源；**不再**放在 `apex_dev/src/views/tenant/__tests__/e2e/` 项目内。

## 前置条件

```bash
cd apex_dev
pnpm dev                          # http://localhost:8081
opencli doctor                    # 须 green
```

1. Chrome 已登录云平台，打开 **租户管理** 页
2. 列设置中勾选 **「项目资源绑定」**
3. 绑定当前 Tab：

```bash
opencli browser nebula bind
opencli browser nebula state
```

## 测试数据

- 租户名：`tenant_test`
- 操作：更多 → **管理项目** → **全选** → **确定**

## Round 1

### 步骤

1. 在列表中定位 `tenant_test` 行（可用搜索框）
2. 读取「项目资源绑定」列当前文案，记为 `initial`（`全绑定` 或 `待绑定`）
3. 打开 **管理项目** → 点击 **全选** → **确定**

### 断言（确定 → 状态稳定）

| 检查项 | 期望 |
|--------|------|
| loading 遮罩 | 从点击确定到下列条件满足前，`.el-loading-mask` 应持续存在 |
| 列不得闪 `-` | 稳定后列文案为 tag，不是 `-` |
| `initial=全绑定` | 稳定后为 **待绑定**；**项目资源绑定** 弹窗应出现；loading 延续至弹窗打开且 API 完成 |
| `initial=待绑定` | 稳定后为 **全绑定**；无绑定弹窗；loading 在列稳定后结束 |

### openCLI 命令参考

```bash
opencli browser nebula state

# 搜索 tenant_test（按 state ref 调整）
opencli browser nebula click "搜索"

# 打开管理项目（行内更多菜单，nth 按 state 调整）
opencli browser nebula click "管理项目"

opencli browser nebula click "全选"
opencli browser nebula click "确定"

# 轮询 loading
opencli browser nebula extract ".el-loading-mask"

# 轮询列文案（按 DOM 调整）
opencli browser nebula extract ".tenant-manage"
```

### 轮询逻辑（agent 执行）

```
deadline = now + 30s
while now < deadline:
  mask = extract .el-loading-mask
  cell = tenant_test 行的项目资源绑定列文案
  bindDlg = ProjectSourceDialog 是否可见

  if cell in (全绑定, 待绑定):
    if initial == 全绑定 and cell == 待绑定:
      assert bindDlg 出现前 mask 曾为 true
      assert 弹窗打开且 API 完成后 mask 消失 -> PASS
    if initial == 待绑定 and cell == 全绑定:
      assert not bindDlg and not mask -> PASS pending->bound
    break
  if cell == "-": fail fast（不应长时间为 -）
  sleep 200ms
```

## Round 2

重复 Round 1，验证 **待绑定 ↔ 全绑定** 另一方向。

- Round 1 结束后若为 **待绑定**，Round 2 期望 **全绑定**
- Round 1 结束后若为 **全绑定**，Round 2 期望 **待绑定**

## 通过标准

- [ ] Round 1：确定后 loading 持续至列显示正确状态；`-` 不闪烁
- [ ] Round 1：若变为待绑定，loading 延续至 **项目资源绑定** 弹窗打开且 API 完成
- [ ] Round 1：若变为全绑定，列稳定后 loading 结束，无绑定弹窗
- [ ] Round 2：反向切换同样通过
