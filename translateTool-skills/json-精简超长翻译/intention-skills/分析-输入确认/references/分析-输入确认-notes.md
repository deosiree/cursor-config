# 分析-输入确认 设计说明

- fieldPath 使用点号语法，如 `translation.ru_RU`
- 目录检测使用 Node.js `fs.statSync().isDirectory()`
- byteLimit 不是字符数，是 UTF-8 字节数
