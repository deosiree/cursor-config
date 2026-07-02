# 2026-07-02 admin-proj 同意前状态（before）

真实案例：用户请求「1 小时内、英文、admin-proj」回滚检查。

## 用户输入

> 1小时内的同意，英文，admin-proj，帮我检查

## 首次误查（失败基线）

按 `department='admin-proj'` 查询 → **0 条**。

## 纠正后 inspect 参数

| 参数 | 值 |
|------|-----|
| timeWindow | 1 HOUR |
| targetLang | 英文 |
| taskName | admin-proj |
| department | 通用平台部（audit 字段，非筛选主键） |
| transIdColumn | en_trans_id |

## 命中审核记录（2 条）

| audit_id | source_text | suggested_translation | entry_info_id | updated_at |
|----------|-------------|----------------------|---------------|------------|
| 8eec20840c314ff4 | ADM/S02-RAG模糊-用户管理系统 | ADM/S02 Fuzzy RAG User Management System | 54e202c3-3b3a-42b9-804f-b8af4c231f8c | 2026-07-02 09:44:32 |
| 2882bd1b4f454cd1 | ADM/S03-文件ADM/S03-系统ADM/S03-资源 | ADM/S03-File, ADM/S03-System, ADM/S03-Resource | cac2d0ab-e0cc-4c9b-86fb-ae6dcb1f9dfc | 2026-07-02 09:44:32 |

## 副作用：术语库 state=3（ref_count=0）

| translate_id | entry | translate_state |
|--------------|-------|-----------------|
| c8d9e85cecba43b4827acc61c30af65b | ADM/S02-RAG模糊-用户管理系统 | 3 |
| 88eab63ca4d84b00bf9746c475d2c035 | ADM/S03-文件ADM/S03-系统ADM/S03-资源 | 3 |

## 副作用：工作台挂载 state=1

| entry_info_id | en_trans_id | translate_state | last_use_time |
|---------------|-------------|-----------------|---------------|
| 54e202c3-3b3a-42b9-804f-b8af4c231f8c | b27547a41e9c403681b25df124bacd05 | 1 | 2026-07-02 09:46:04 |
| cac2d0ab-e0cc-4c9b-86fb-ae6dcb1f9dfc | 00580147eb5a4b0383f2a3364a416b37 | 1 | 2026-07-02 09:46:07 |

注意：工作台翻译时间略晚于同意时间，可能为后续预翻译再次 sync。

## 同意前 UI 状态

- 术语学习页：2 条不在 pending（已 approved）
- 工作台 admin-proj：英文译文已填，translate_state=1 待翻译审核
- 术语库：新增 2 条 state=3
