# RED 基线：会话前失败模式

## 典型用户诉求

「按 CSV 自测单测异常 UI，用 mock 模拟接口失败」

## 漏掉什么

- 8080 基座不走 apex mock
- 8081 缺 qiankun userInfo
- API 路径缺 `forward/`
- Windows path.join 导致 mock 不匹配

## 误触发

- 在 8080 测以为 mock 坏了
- 用 HTTP 状态码判断（应为 JSON code）

## 不稳定产物

- 单文件 README 持续追加用例步骤
