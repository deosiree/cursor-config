# Report 文件解析示例

## 输入 sample.report

```json
{"entry":{"source":"连接超时","translation":{"ru_RU":"Тайм-аут подключения"}},"interpretation":"译文长度:38,限制:32"}
{"entry":{"source":"同步失败","translation":{"ru_RU":"Ошибка синхронизации: превышено время ожидания"}},"interpretation":"译文长度:45,限制:40"}
```

## 逐行解析

### 第 1 行

| 步骤 | 结果 |
|------|------|
| 识别 translation 键 | `ru_RU`（首个非空键） |
| interpretation 正则 | group1=38, group2=32 |
| 开区间 | actualMax = 31 |
| overBy | 38 - 31 = 7 |

### 第 2 行

| 步骤 | 结果 |
|------|------|
| 识别 translation 键 | `ru_RU` |
| interpretation 正则 | group1=45, group2=40 |
| 开区间 | actualMax = 39 |
| overBy | 45 - 39 = 6 |

## 输出

```json
{
  "entries": [
    { "source": "连接超时", "langKey": "ru_RU", "currentLen": 38, "maxLen": 32, "actualMax": 31, "overBy": 7 },
    { "source": "同步失败", "langKey": "ru_RU", "currentLen": 45, "maxLen": 40, "actualMax": 39, "overBy": 6 }
  ]
}
```
