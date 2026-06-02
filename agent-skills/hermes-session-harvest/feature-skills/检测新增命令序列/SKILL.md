---
name: 检测新增命令序列
description: 对比本次会话产生的 OpenCLI/shell/HTTP 命令与 session-log/ 已有记录，识别新的可复用命令序列，计算复用次数，给出置信度评分。
---

# 检测新增命令序列

> 被 `hermes-session-harvest` 的 Step 1-2 调用。识别本次会话中产生的新命令序列，判断是否有沉淀价值。

## 输入

- 本次会话中 Agent 执行过的所有 OpenCLI / shell / HTTP 命令
- `session-log/` 目录下所有已有日志文件
- `references/场景-*.md` 中的已有命令模式

## 执行步骤

### 1. 提取本次会话的命令序列

从 Agent 的回复中提取所有以 `opencli browser` / `kubectl` / `curl` / `python` / `bash` 开头的命令，按执行顺序排列。

```text
示例：
  opencli browser nebula-ux open http://localhost:8080/cloud/Apex/...
  opencli browser nebula-ux click --role button --name "导入"
  opencli browser nebula-ux eval "document.querySelector('.el-upload').click()"
  kubectl logs -n platform deploy/seccenter --tail=200 | grep ERRO
  python docs/menu/scripts/menu_import_preview_loop.py --dry-run
```

### 2. 检测序列模式

将连续的命令按功能分组，检测是否有 >=2 次的重复模式。相同模式即使参数不同也算匹配：

```text
模式匹配规则：
  相同工具 + 相同子命令 = 相同模式
  例: opencli browser X fill ... / opencli browser Y fill ... → 都是 fill 模式
  例: kubectl logs -n platform ... | grep ERRO → 都是 ERRO 排查模式
```

### 3. 对比已有日志

读取 `session-log/` 下所有 `*.md` 文件，检查其中是否已记录相同或相似的命令序列。用关键词匹配（如 `opencli browser.*fill`）。

### 4. 输出

```json
{
  "new_sequences": [
    {
      "pattern": "opencli browser <s> eval + kubectl logs | grep ERRO",
      "frequency": 3,
      "confidence": "high",
      "session_log_exists": false,
      "suggestion": "沉淀为新场景: 菜单导入与SSH联调"
    }
  ],
  "known_sequences": [
    {
      "pattern": "opencli browser <s> open + login + click",
      "frequency": 1,
      "session_log_exists": true,
      "suggestion": "已记录，无需重复"
    }
  ]
}
```

## 置信度评分

| 频率 | 置信度 | 动作 |
|:---:|:---:|------|
| ≥3 次 | **high** (0.8) | 沉淀为场景候选 |
| 2 次 | **medium** (0.5) | 写入 session-log，等下次再出现时提升 |
| 1 次 | **low** (0.3) | 写入 session-log（仅记录） |
| 0 次（全新但关键） | **medium** (0.5) | 如果是 SSH+OpenCLI 跨工具组合，手动标记为 high |

## 输出规范

返回结构化列表给 `hermes-session-harvest` 主引擎的 Step 2 决策。
