# admin-proj 英文 1 小时回滚案例（few-shot）

供 agent 读取的完整对话样本。路径：`translateTool-skills/db-回滚数据库`

## 用户请求 1（inspect）

```text
1小时内的同意，英文，admin-proj，帮我检查
```

### agent 应做

1. 解析：`timeWindow=1 HOUR`, `targetLang=英文`, `taskName=admin-proj`
2. **不要** 用 `department='admin-proj'` 作为主筛选
3. 连接：`docker exec translation-mysql mysql ... --default-character-set=utf8mb4`
4. 运行 inspect，输出摘要表

### inspect 命令示例

```powershell
docker exec translation-mysql mysql -uroot -p123456 --default-character-set=utf8mb4 translationtool -e "
SET NAMES utf8mb4;
SET @hours = 1;
SET @target_lang = '英文';
SET @task_name = 'admin-proj';
SET @department = NULL;
SET @review_status = 'approved';

SELECT id, source_text, suggested_translation, task_name, department, entry_info_id, updated_at
FROM term_agent_audit
WHERE review_status = @review_status
  AND updated_at >= NOW() - INTERVAL @hours HOUR
  AND target_lang = @target_lang
  AND task_name = @task_name
ORDER BY updated_at DESC;
"
```

### 预期输出摘要

- auditCount: 2
- department 字段值均为「通用平台部」
- task_name 均为 admin-proj

### rollbackPlan ID 清单

```yaml
auditIds:
  - 2882bd1b4f454cd1
  - 8eec20840c314ff4
glossaryTranslateIds:  # state=3
  - c8d9e85cecba43b4827acc61c30af65b
  - 88eab63ca4d84b00bf9746c475d2c035
workbenchTranslateIds:  # state=1, 当前挂载
  - b27547a41e9c403681b25df124bacd05
  - 00580147eb5a4b0383f2a3364a416b37
entryInfoIds:
  - 54e202c3-3b3a-42b9-804f-b8af4c231f8c
  - cac2d0ab-e0cc-4c9b-86fb-ae6dcb1f9dfc
transIdColumn: en_trans_id
```

---

## 用户请求 2（execute）

```text
直接在数据库中执行这套回滚
```

### agent 应做

1. 确认 rollbackPlan 已展示
2. `dryRun=false`，事务 execute
3. verify 后报告 pass

### 禁止

- 用户只说「检查一下」时 execute
- 硬 DELETE
- 只删术语库不解绑 en_trans_id

---

## 误触发纠正样本

用户：「admin-proj 部门 1 小时内英文回滚」

agent 应说明：admin-proj 是 **任务名**（task_name），部门实际为「通用平台部」；先用 task_name 查，0 条再扩大时间窗。
