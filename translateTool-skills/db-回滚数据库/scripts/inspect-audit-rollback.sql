-- inspect-audit-rollback.sql
-- 术语 Agent 批量同意副作用 inspect（只读）
--
-- 使用前设置变量（示例）：
--   SET @hours = 1;
--   SET @target_lang = '英文';
--   SET @task_name = 'admin-proj';      -- 翻译任务名，可为 NULL
--   SET @department = NULL;             -- 部门，可为 NULL；与 task_name 至少填一
--   SET @review_status = 'approved';
--
-- 执行：
--   docker exec translation-mysql mysql -uroot -p123456 --default-character-set=utf8mb4 translationtool < inspect-audit-rollback.sql
--
-- 语种 → trans_id 列（与 terminology-agent LANG_TRANS_ID_ATTR 一致）：
--   英文 → en_trans_id | 俄文 → ru_trans_id | 法文 → fra_trans_id | 西文 → spa_trans_id | 中文 → zh_trans_id

SET NAMES utf8mb4;

-- 默认变量（可被调用方覆盖）
SET @hours = IFNULL(@hours, 1);
SET @target_lang = IFNULL(@target_lang, '英文');
SET @review_status = IFNULL(@review_status, 'approved');

-- ========== 1. 审核记录 ==========
SELECT '=== 1. 审核记录 term_agent_audit ===' AS section;

SELECT id, source_text, suggested_translation, target_lang, department, task_name,
       entry_info_id, updated_at
FROM term_agent_audit
WHERE review_status = @review_status
  AND updated_at >= NOW() - INTERVAL @hours HOUR
  AND target_lang = @target_lang
  AND (@task_name IS NULL OR task_name = @task_name)
  AND (@department IS NULL OR department = @department)
ORDER BY updated_at DESC;

-- ========== 2. 术语库副作用（state=3，merge_to_store 写入）==========
SELECT '=== 2. 术语库 t_translate (state=3, delete_state=0) ===' AS section;

SELECT t.id, t.entry, t.translate, t.type, t.visual_range, t.translate_state,
       t.delete_state, t.last_use_time, a.id AS audit_id
FROM term_agent_audit a
JOIN t_translate t
  ON t.entry = a.source_text
 AND t.translate = a.suggested_translation
 AND t.type = a.target_lang
 AND (t.visual_range = a.department OR (t.visual_range IS NULL AND a.department IS NULL))
 AND t.delete_state = 0
 AND t.translate_state = '3'
WHERE a.review_status = @review_status
  AND a.updated_at >= NOW() - INTERVAL @hours HOUR
  AND a.target_lang = @target_lang
  AND (@task_name IS NULL OR a.task_name = @task_name)
  AND (@department IS NULL OR a.department = @department)
ORDER BY t.last_use_time DESC;

-- ========== 3. 工作台词条 + 当前挂载翻译 ==========
SELECT '=== 3. 工作台 t_entry_info + 挂载翻译 ===' AS section;

SELECT ei.id AS entry_info_id, ei.entry,
       ei.en_trans_id, ei.ru_trans_id, ei.fra_trans_id, ei.spa_trans_id, ei.zh_trans_id,
       t.id AS trans_id, t.translate, t.translate_state, t.delete_state, t.audit_suggest, t.last_use_time,
       a.id AS audit_id
FROM term_agent_audit a
JOIN t_entry_info ei ON ei.id = a.entry_info_id AND ei.is_delete = 0
LEFT JOIN t_translate t ON t.id = CASE a.target_lang
    WHEN '英文' THEN ei.en_trans_id
    WHEN '俄文' THEN ei.ru_trans_id
    WHEN '法文' THEN ei.fra_trans_id
    WHEN '西文' THEN ei.spa_trans_id
    WHEN '中文' THEN ei.zh_trans_id
    ELSE NULL END
WHERE a.review_status = @review_status
  AND a.updated_at >= NOW() - INTERVAL @hours HOUR
  AND a.target_lang = @target_lang
  AND (@task_name IS NULL OR a.task_name = @task_name)
  AND (@department IS NULL OR a.department = @department)
ORDER BY a.updated_at DESC;

-- ========== 4. translate 引用计数 ==========
SELECT '=== 4. translate 被 entry_info 引用次数 ===' AS section;

SELECT t.id, t.entry, t.translate_state, t.delete_state,
       (SELECT COUNT(*) FROM t_entry_info ei WHERE ei.is_delete = 0 AND (
           ei.en_trans_id = t.id OR ei.ru_trans_id = t.id OR ei.fra_trans_id = t.id
           OR ei.spa_trans_id = t.id OR ei.zh_trans_id = t.id
       )) AS ref_count
FROM t_translate t
WHERE t.id IN (
    SELECT t2.id FROM term_agent_audit a
    JOIN t_translate t2
      ON (t2.entry = a.source_text AND t2.translate = a.suggested_translation
          AND t2.type = a.target_lang AND t2.delete_state = 0)
    WHERE a.review_status = @review_status
      AND a.updated_at >= NOW() - INTERVAL @hours HOUR
      AND a.target_lang = @target_lang
      AND (@task_name IS NULL OR a.task_name = @task_name)
      AND (@department IS NULL OR a.department = @department)
    UNION
    SELECT t3.id FROM term_agent_audit a2
    JOIN t_entry_info ei ON ei.id = a2.entry_info_id
    JOIN t_translate t3 ON t3.id = CASE a2.target_lang
        WHEN '英文' THEN ei.en_trans_id WHEN '俄文' THEN ei.ru_trans_id
        WHEN '法文' THEN ei.fra_trans_id WHEN '西文' THEN ei.spa_trans_id
        WHEN '中文' THEN ei.zh_trans_id ELSE NULL END
    WHERE a2.review_status = @review_status
      AND a2.updated_at >= NOW() - INTERVAL @hours HOUR
      AND a2.target_lang = @target_lang
      AND (@task_name IS NULL OR a2.task_name = @task_name)
      AND (@department IS NULL OR a2.department = @department)
);

-- ========== 5. 若 task_name 过滤为 0，尝试 department 误用提示 ==========
SELECT '=== 5. 诊断：若上表为空，检查是否误用 department ===' AS section;

SELECT COUNT(*) AS cnt_if_department_equals_task_name
FROM term_agent_audit
WHERE review_status = @review_status
  AND updated_at >= NOW() - INTERVAL @hours HOUR
  AND target_lang = @target_lang
  AND @task_name IS NOT NULL
  AND department = @task_name;
