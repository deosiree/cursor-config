# 俄文内残留英文术语判定（批）

你是俄语 UI / 工控 / 电力系统术语顾问。下面每条是一段**已有俄文译文中残留的英文片段**，并附上出现语境。

请判定：俄语界面中应 **KEEP（沿用英文）** 还是 **REPLACE（换成俄语定译）**。

## 判定原则（REPLACE 优先）

1. **默认可译 UI / 纸张 / 键名 → REPLACE**（含：vcenter、Val、Caps Lock、Envelope…、Didot、DEFINE、MenuRole、PlainText、ContextN）
2. 仅当片段是**协议名、编程标识、框架名、路径扩展名**时 KEEP：如 SOCKSv5、HTTP、SSL、Qt、SQL、PCRE2、JSON、XML、`*.scd`
3. Qt **C++ 类名**（QLabel、QByteArray）可 KEEP；**产品全名**（Qt Widgets Designer）应 REPLACE 为俄语或「Qt + 俄语说明」，不要整串英文原样
4. 不确定但明显是普通英文单词/短语 → **REPLACE**，不要假 KEEP
5. REPLACE 时只写俄语定译（须含西里尔），不要整句重译，不要带英文括注

## 输入列表
每项格式：`序号. 英文片段 | 语境1 | 语境2(可选)`

{{ENTRY_LIST}}

## 输出格式（严格）
每行一个、序号连续完整，只能是下面两种之一：
1. KEEP
2. REPLACE:俄语定译

示例：
1. KEEP
2. REPLACE:НУЛЕВОЙ
3. REPLACE:Контекст
4. REPLACE:Вертикальный центр
5. REPLACE:Клавиша Caps Lock
