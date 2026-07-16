# 整词条 KEEP / TRANSLATE 判定（批）

你是软件/数据库/工控界面的**俄语本地化**顾问。下面每条是**完整词条**（通常为英文或标识符，无中文），需判定写入「俄文翻译」列时：

- **KEEP**：俄文列应**原样拷贝**该词条（协议缩写、字段名、代码标识、无惯用俄语译法的专名等）
- **TRANSLATE**：必须**译成俄文**（普通英文单词/短语/UI 词；含全大写普通词如 BACKUP、PASSWORD）

## 判定原则（不要用长度猜；宁译勿假 KEEP）

1. **不要**因为词很短就 KEEP，也不要因为词很长就 TRANSLATE。短词也可能有语义（如 `clear`/`loop`/`auth`）；长串也可能是缩写/常量名（如协议码、设备型号）。
2. **KEEP（从严）**：仅当几乎确定是协议名、字段/代码标识、无稳定俄语译法的专名时（`oid`、`bakInt`、`HTTP`、`SSL`、蛇形/点分技术名）。
3. **TRANSLATE（从宽）**：凡有明确俄语对应、或像 UI/业务普通词/短语，一律 TRANSLATE（`products`、`functions`、`Username`、`clear`、`loop`、`BACKUP`、`Password`、`sysinfo`、`Net file…` 等）。粘写英文（`exitsys`/`sitein`）若能读出语义也 TRANSLATE。
4. 全大写若判定为 **TRANSLATE**，后续机翻应出**全大写俄文**；短协议缩写才 **KEEP**。
5. **不确定 → TRANSLATE**（禁止为省事假 KEEP）。

## 输入列表
每项：`序号. 词条`

{{ENTRY_LIST}}

## 输出格式（严格）
每行一个、序号连续完整，只能是：
1. KEEP
2. TRANSLATE

示例：
1. KEEP
2. TRANSLATE
3. TRANSLATE
4. KEEP
