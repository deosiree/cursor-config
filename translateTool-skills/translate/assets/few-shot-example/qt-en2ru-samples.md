# Qt 英译俄真实样本（来自 qt通用语言.xlsx）

> 源文件：`f:\DownLoads\qt通用语言.xlsx`。译文栏供试跑后人工对照；脚本结果可能略有措辞差异，但占位符必须一致。

| 类型 | 英文（源） | 期望俄文要点 | tag |
|------|-----------|--------------|-----|
| 纯单词 | Sync | Синхронизация / Синхр. 等 UI 常用译 | MainWindow |
| 纯单词 | Tools | Инструменты | QShortcut |
| 单字母 | X | X（坐标，常保留） | QtRectFPropertyManager |
| 带 %1/%2 | Could not register file '%1': %2 | 保留 `'%1'` 与 `%2` 原样 | MainWindow |
| 问句+%1 | Would you like to delete the profile '%1'? | 保留 `'%1'`；语气为疑问 | EmbeddedOptionsControl |
| 长句 | The message was tampered with, damaged or out of sequence. | 完整俄文陈述句；专有语义不丢 | QSslSocket |
| 警告长句 | Warning: Widget creation failed... | Warning: 可保留或译为 Предупреждение:；Qt/XML 术语稳妥 | WidgetBox |
| 短语 | Delete to the end of the word | 编辑动作类短语，简洁 | QWebPage |

## 占位符硬约束示例

```text
EN: Could not register file '%1': %2
RU: Не удалось зарегистрировать файл '%1': %2
```

错误示例（禁止）：

```text
Не удалось зарегистрировать файл '% 1': % 2
Не удалось зарегистрировать файл '⟦1⟧'
```
