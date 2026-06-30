# tenant-i18n-input-0629 评估说明

**日期**：2026-06-29  
**来源**：apex_dev 暂存区 — I18nInput 多语言 wire、syncI18nRefFromProps、租户创建向导 wire 缓存

## 产出

**合并导入（推荐）**：[`docs/问题单/0629/i18n-input-0629.csv`](../../../Repertory/Sieyuan/nebula/docs/问题单/0629/i18n-input-0629.csv) — **22 条**（租户 8 + 角色 10 + 用户 3 + 菜单 1）

| 分模块 CSV（可选） | 条数 |
|-------------------|------|
| tenant-i18n-input-0629.csv | 8 |
| role-i18n-input-0629.csv | 10 |
| user-i18n-display-0629.csv | 3 |
| menu-i18n-display-0629.csv | 1 |

## 覆盖暂存区改动

- `I18nInput` confirm + `update:sourceValue`
- `syncI18nRefFromProps` / `stringifyI18nWire` / `resolveWireDisplayText`
- `TenantFormFields` 租户名 I18n + 创建三步 wire 缓存
- `RoleBasicFormTab` 角色名/描述 I18n + loading 守卫
- 列表/弹窗读侧展示（租户、角色、用户、个人中心、菜单权限）

## 生成命令

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py --cases configs/tenant-i18n-input-0629.cases.json \
  --template ../../../docs/问题单/模板/tenant.csv \
  --output ../../../docs/问题单/0629/tenant-i18n-input-0629.csv --force
# role / user / menu 同理
```
