# 解析-Report文件 设计说明

- **开区间规则**：interpretation 的"限制:N"是 ) 开区间，实际可写入上限 = N - 1
- 语言键自动检测取 translation 对象下首个非空值键
- interpretation 格式异常时跳过该条目，输出异常列表
- **输出规则**：
  - 目录：源目录加 `_new` 后缀
  - 文件名：`.report` → `.dic`
  - 内容：去除 `interpretation` 字段，只保留 `entry`
- 支持 JSON 数组和逐行 JSON 两种格式
