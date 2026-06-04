# CSV 字段映射参考

> 外部 skill 规范见 `F:\Documents\Repertory\Sieyuan\nebula\.cursor\test-skills\输出csv的测试用例\references\csv-field-convention.md`

## 委托调用格式

```text
使用 $输出csv的测试用例
模块名：{模块名}，子系统：{子系统}，创建人员：{创建人员}
cases 如下：{cases.json 数组}
输出到 {CSV 输出路径}
```

## 外部 skill 关键约束（本 skill 必须遵守）

| 约束 | 来源 |
|------|------|
| CSV 表头 36 列，对齐 `docs/问题单/模板/*.csv` | csv-field-convention.md |
| `功能集合` 列强制留空 | csv-field-convention.md |
| `预期结果` 用红绿测试风格，名称不加正反向前缀 | csv-field-convention.md |
| `用例等级` = 0, `用例类型` = 0, `develop结果` = 0 | csv-field-convention.md |
| 步骤 ≤ 10 步，动词开头 | test-case-writing-rules.md |
| 不写代码调用（如 `MenuGateway.getTree()`） | test-case-writing-rules.md |

## 字段默认值

| CSV 列 | 权限 E2E 默认值 |
|--------|---------------|
| 标签 | 1 |
| 执行方式 | 4 |
| 最新结果 | 0 |
| 用例等级 | 0 |
| 用例类型 | 0 |
| develop结果 | 0 |
| 模块名 | 权限管理 |
| 子系统 | 8 |
