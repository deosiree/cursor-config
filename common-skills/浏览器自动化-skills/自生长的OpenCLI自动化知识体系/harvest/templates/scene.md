---
session_origin:
  session: "__SESSION_NAME__"       # 产生此场景的 OpenCLI session 名
  profile: "__PROFILE__"            # 使用的 profile（local / cloud / ...）
  date: "__DATE__"                  # 首次发现 / 沉淀日期
  source_prompt: "__SOURCE_PROMPT__"  # 触发此场景的用户请求原文（前 100 字）
---

# 场景：__SCENE_NAME__

> 自生长自 `__SESSION_NAME__` (__DATE__)，由用户请求 "``__SOURCE_PROMPT__``" 触发。

## 适用条件

__CONDITIONS__

## 输入 / 输出

| 方向 | 内容 | 示例 |
|:----:|------|------|
| **输入** | __INPUT_DESC__ | __INPUT_EXAMPLE__ |
| **输出** | __OUTPUT_DESC__ | __OUTPUT_EXAMPLE__ |

## 核心命令

```bash
SESSION="__SESSION_NAME__"
__CORE_COMMANDS__
```

## 边界处理

| 条件 | 处理 |
|------|------|
| __EDGE_CASE_1__ | __EDGE_HANDLING_1__ |

## 踩坑记录

- __PITFALL_1__
