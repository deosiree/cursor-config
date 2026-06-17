# Darwin dry_run 实测记录 · json-精简超长翻译 v2

> 2026-06-17 | v2 Report 文件全流程验证

## 测试数据

`assets/test-data/sample.report` — 3 条超长词条。

## Step 1: 解析 Report

```bash
node scripts/parse-report.js assets/test-data/sample.report
```

**结果**：3/3 解析成功，0 错误。

| source | langKey | currentLen | maxLen | actualMax | overBy |
|--------|---------|-----------|-------|-----------|--------|
| 连接超时 | ru_RU | 38 | 32 | **31** | 7 |
| 同步失败 | ru_RU | 45 | 40 | **39** | 6 |
| 认证失败: 用户不存在 | ru_RU | 55 | 50 | **49** | 6 |

## Step 2: 缩短

按 actualMax 字符限制 + UTF-8 字节限制缩短：

| source | 缩短后 | chars | charLimit | bytes | byteLimit | 状态 |
|--------|--------|-------|-----------|-------|-----------|------|
| 连接超时 | Тайм-аут подключения | 20 | 31 | 38 | 62 | ✅ |
| 同步失败 | Ошибка синхр.: превышено ожид. | 30 | 39 | 54 | 78 | ✅ |
| 认证失败 | Ошибка аутентиф.: пользователь не найден | 40 | 49 | 74 | 98 | ✅ |

## Step 3: 回验

全部 3 条通过双重校验（字符数 ≤ actualMax, UTF-8 字节 ≤ actualMax×2）。

## 结论

v2 全流程验证通过。
