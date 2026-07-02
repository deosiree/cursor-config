-- execute-audit-rollback.sql
-- 术语 Agent 批量同意回滚（UPDATE，事务内执行）
--
-- ⚠️ 必须先运行 inspect-audit-rollback.sql，确认 ID 后再填入下方 IN 列表
-- ⚠️ 禁止硬 DELETE；统一 delete_state=1 软删除
--
-- 填入方式：将 {{...}} 替换为 inspect 得到的 ID（逗号分隔、加引号）
--
-- 示例 ID 来自 2026-07-02 admin-proj 英文案例（执行前务必重新 inspect）

SET NAMES utf8mb4;
START TRANSACTION;

-- ① 软删除术语库（translate_state=3，同意时 merge_to_store 写入）
UPDATE t_translate SET delete_state = 1
WHERE id IN (
  {{glossary_translate_ids}}
  -- 示例: 'c8d9e85cecba43b4827acc61c30af65b', '88eab63ca4d84b00bf9746c475d2c035'
);

-- ② 解除工作台关联（英文示例用 en_trans_id；其他语种改列名）
UPDATE t_entry_info SET {{trans_id_column}} = NULL
WHERE id IN (
  {{entry_info_ids}}
  -- 示例: '54e202c3-3b3a-42b9-804f-b8af4c231f8c', 'cac2d0ab-e0cc-4c9b-86fb-ae6dcb1f9dfc'
);

-- ③ 软删除工作台挂载翻译（translate_state=1）
UPDATE t_translate SET delete_state = 1
WHERE id IN (
  {{workbench_translate_ids}}
  -- 示例: 'b27547a41e9c403681b25df124bacd05', '00580147eb5a4b0383f2a3364a416b37'
);

-- ④ 审核记录改回 pending
UPDATE term_agent_audit
SET review_status = 'pending', review_comment = NULL
WHERE id IN (
  {{audit_ids}}
  -- 示例: '2882bd1b4f454cd1', '8eec20840c314ff4'
);

COMMIT;

-- ========== 验证（COMMIT 后单独执行）==========
-- SELECT id, review_status FROM term_agent_audit WHERE id IN (...);
-- SELECT id, delete_state, translate_state FROM t_translate WHERE id IN (...);
-- SELECT id, en_trans_id FROM t_entry_info WHERE id IN (...);
