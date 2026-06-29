# tenant-create-submit-loading-0626 导出记录

- **日期**：2026-06-26
- **来源**：租户管理 `index.vue` 新建租户提交后 tryOpen 防呆 + 链接激活延后（`pendingActivationResult`）；Vitest + openCLI E2E
- **cases**：`configs/tenant-create-submit-loading-0626.cases.json`（4 条）
- **CSV**：`docs/问题单/0626/tenant-create-submit-loading-0626.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/tenant-create-submit-loading-0626.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/tenant.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0626/tenant-create-submit-loading-0626.csv \
  --force
```

## 覆盖场景

| 用例 | 验证点 |
|------|--------|
| 新建含项目 → pending | 确定后 loading 至绑定弹窗 |
| 链接激活 + pending | 绑定窗关闭后再弹激活链接（非叠层） |
| 边界 | 不得 loading 消失后列长时间为 `-` |
| 无 bind 权限 | 不弹绑定窗，toast/激活正常 |

## 关联单测

```bash
cd apex_dev
pnpm test:unit src/views/tenant/composables/__tests__
```

- `tenant-create-submit-flow.test.ts`：create 提交 loading 栈 + 延后激活
- `useTenantPageLoading.test.ts`：depth 栈嵌套

---

# openCLI E2E 验收脚本（新建租户提交 loading + 绑定防呆）

> **沉淀位置**：本文件为唯一维护源；**不**放在 `apex_dev` 项目内。

## 前置条件

```bash
cd apex_dev
pnpm dev                          # http://localhost:8081
opencli doctor                    # 须 green
```

1. Chrome 已登录云平台，打开 **租户管理** 页
2. 列设置中勾选 **「项目资源绑定」**（可选，用于观察列 `-` 回归）
3. 绑定当前 Tab：

```bash
opencli browser nebula bind
opencli browser nebula state
```

## 测试数据

- 新建租户名：`tenant_create_e2e_{timestamp}`（避免重名）
- 所有者：按表单要求填写
- 项目配置：勾选至少一个 **含资源** 的项目（确保 tryOpen pending）

## 主流程

### 步骤

1. 点击 **新增**
2. 步骤1：填写租户名、所有者信息 → **下一步**
3. 步骤2：勾选含资源的项目 → **下一步**
4. 步骤3：角色预览 → **确定**
5. 观察：创建弹窗关闭 → 表格 loading → 「项目资源绑定」弹窗

### 断言（确定 → 绑定弹窗）

| 检查项 | 期望 |
|--------|------|
| loading 遮罩 | 从点击确定到绑定弹窗打开前，`.el-loading-mask` 持续存在 |
| 绑定防呆窗 | pending 时 **项目资源绑定** 弹窗自动出现 |
| 列不得闪 `-` | 若列可见，稳定后为 tag 而非长时间 `-` |
| loading 结束 | 弹窗打开且 API 完成后 loading 消失 |

### openCLI 命令参考

```bash
opencli browser nebula state
opencli browser nebula click "新增"
# 按 state ref 填写表单、下一步、选项目、确定
opencli browser nebula extract ".el-loading-mask"
opencli browser nebula extract ".project-source-dialog"
```

### 轮询逻辑（agent 执行）

```
deadline = now + 45s
while now < deadline:
  mask = extract .el-loading-mask
  bindDlg = ProjectSourceDialog 是否可见

  if bindDlg:
    assert mask 曾为 true
    assert 弹窗打开且 API 完成后 mask 消失 -> PASS
    break
  sleep 200ms
```

## 链接激活 + pending（可选）

前置：系统激活方式为链接激活。

1. 新建租户确定 → **项目资源绑定** 弹窗先出现
2. **不应** 与绑定窗同时出现激活链接弹窗
3. 关闭或完成绑定窗 → **激活链接** 弹窗出现

## 通过标准

- [ ] 确定后 loading 持续至绑定弹窗打开（pending 场景）
- [ ] 列若可见，不出现长时间 `-` 空窗期
- [ ] 链接激活时：绑定窗关闭后再弹激活链接
- [ ] 无 bindResource 权限时不弹绑定窗（需专用账号）
