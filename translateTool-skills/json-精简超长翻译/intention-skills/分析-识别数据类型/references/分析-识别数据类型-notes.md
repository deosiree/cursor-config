# 分析-识别数据类型 设计说明

- dataType 是路由分流的关键参数
- v1(元数据)走原有 5 步流程
- v2(对象数据)走 report 解析 → 缩短 → 回验
- 自动推断规则：目录含 .report 文件 → object；含 .dic 文件 → meta
