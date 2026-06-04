# scripts 目录说明

## 主入口（active）

| 文件 | 用途 |
|------|------|
| `run-e2e-scenario.node.js` | **单场景 E2E**（Step 0→5，含断言） |
| `run-all.node.js` | 8 场景矩阵，汇总到 `../examples/result-*.json`；默认 admin 预热，首轮不重试，结束后补跑失败用例 |
| `run-all.bat` | Windows：`cd ..` 后调 `run-all.node.js` |
| `run-s1.bat` | Windows：仅 S1 |

## Deprecated（勿在新流程中使用）

| 文件 | 原因 |
|------|------|
| `run-scenario.js` | 旧 admin eval 内联方案；checkbox 用 eval 易 Vue 回滚 |
| `run-e2e-scenario.py` | Python 传 JS 会踩 `%` 转义 |
| `run-scenario.ps1` | 被 node 脚本取代 |
| `run-all-scenarios.js` | 早期矩阵 runner |
| `run-scenario-01.cmd` | 只跑 S1 的旧 cmd |
| `config-s1-import.js` | S1 调试片段 |

保留仅为历史对照；**agent 与 CI 只调 node 脚本**。
