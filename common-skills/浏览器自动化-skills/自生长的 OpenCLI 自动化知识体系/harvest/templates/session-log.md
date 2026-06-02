# 会话日志

> 自生长自动化体系 — 每次 OpenCLI 会话后的结构化记录

## 元数据

| 字段 | 值 |
|------|-----|
| Session | `__SESSION_NAME__` |
| Profile | `__PROFILE__` |
| 日期 | __DATE__ |
| 目标 URL | __TARGET_URL__ |
| 任务描述 | __TASK_DESC__ |

## 关键命令序列

```bash
__COMMANDS__
```

## 验证结果

| 检查项 | 结果 |
|--------|:----:|
| login | __LOGIN_RESULT__ |
| TC1 | __TC1_RESULT__ |
| 截图 | __SCREENSHOT_PATH__ |

## 踩坑

__PITFALLS__

## 沉淀决策

- [ ] 创建 references/ 场景文件 → `bash harvest/add-scene.sh ...`
- [ ] 创建完整子 skill → `bash harvest/scaffold-skill.sh ...`
- [ ] 更新 references/公共模式与反模式.md
- [ ] 仅记录到此日志，暂不沉淀（1-3 个命令，不重复出现）
