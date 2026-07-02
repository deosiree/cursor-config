# 2026-07-02 admin-proj 回滚后状态（after）

用户确认：「直接在数据库中执行这套回滚」。

## 执行的 SQL（事务内）

```sql
SET NAMES utf8mb4;
START TRANSACTION;

UPDATE t_translate SET delete_state = 1
WHERE id IN (
  'c8d9e85cecba43b4827acc61c30af65b',
  '88eab63ca4d84b00bf9746c475d2c035'
);

UPDATE t_entry_info SET en_trans_id = NULL
WHERE id IN (
  '54e202c3-3b3a-42b9-804f-b8af4c231f8c',
  'cac2d0ab-e0cc-4c9b-86fb-ae6dcb1f9dfc'
);

UPDATE t_translate SET delete_state = 1
WHERE id IN (
  'b27547a41e9c403681b25df124bacd05',
  '00580147eb5a4b0383f2a3364a416b37'
);

UPDATE term_agent_audit
SET review_status = 'pending', review_comment = NULL
WHERE id IN ('2882bd1b4f454cd1', '8eec20840c314ff4');

COMMIT;
```

## 验证结果

| 检查项 | 结果 |
|--------|------|
| audit.review_status | pending |
| audit.review_comment | NULL |
| translate.delete_state | 1（4 条） |
| entry_info.en_trans_id | NULL |

## 回滚后 UI 预期

- 术语学习页：2 条重新出现在待审核
- 工作台 admin-proj：英文译文清空
- 术语库：2 条 state=3 不可见（软删除）

## 教训沉淀

1. `admin-proj` → `task_name`，不是 `department`
2. 必须 utf8mb4 连接
3. 必须 inspect 四表（audit / state=3 / state=1 / ref_count）
4. 执行前需用户明确授权
