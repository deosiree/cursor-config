# i18n-submit-fallback-0630 评估说明

**日期**：2026-06-30  
**来源**：apex_dev — I18nInput `getSubmitValue()` 提交兜底（租户/角色/菜单三模块）

## 产出

**合并导入（推荐）**：[`docs/问题单/0630/i18n-submit-fallback-0630.csv`](../../../Repertory/Sieyuan/nebula/docs/问题单/0630/i18n-submit-fallback-0630.csv) — **8 条**（租户 3 + 角色 3 + 菜单 2）

| 分模块 CSV（可选） | 条数 |
|-------------------|------|
| tenant-i18n-submit-fallback-0630.csv | 3 |
| role-i18n-submit-fallback-0630.csv | 3 |
| menu-i18n-submit-fallback-0630.csv | 2 |

## 覆盖改动

- `I18nInput.getSubmitValue()` / `buildSubmitI18nData` — 空 locale 用 `sourceValue` 回填
- `TenantFormFields.stringifyTenantNameWire` — `tenantNameI18nRef.getSubmitValue()`
- `RoleBasicFormTab.stringifyRoleNameWire` / `stringifyDescriptionWire` — `roleNameI18nRef` / `descriptionI18nRef`
- `MenuFormDialog.stringifyNameI18nData` — `nameI18nRef.getSubmitValue()`
- 参考 opsdeck `i18nTest/index.vue` submitForm 模式

## 生成命令

```bash
cd test-skills/输出csv的测试用例

# 合并 CSV（推荐）
python scripts/generate_feature_csv.py \
  --cases configs/i18n-submit-fallback-0630.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/tenant.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0630/i18n-submit-fallback-0630.csv \
  --force

# 分模块
python scripts/generate_feature_csv.py --cases configs/tenant-i18n-submit-fallback-0630.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/tenant.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0630/tenant-i18n-submit-fallback-0630.csv --force
# role / menu 同理
```
