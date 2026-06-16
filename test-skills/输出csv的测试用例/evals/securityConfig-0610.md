# 安全配置用例 — 质量报告（0610）

> **历史报告（0610 导入前格式）**：表中「用例结果必填」指当时 CSV 列填写方式。当前质检以 [`references/csv-export-format-rules.md`](../references/csv-export-format-rules.md) 为准。

## 交付物

| 文件 | 说明 |
|------|------|
| `docs/问题单/0610/securityConfig.csv` | 19 条，UTF-8 BOM |
| `configs/securityConfig.cases.json` | 结构化源数据 |

## 固定字段

- 子系统：`17`
- 模块名：`安全配置界面`
- 创建人员：`惠岩`
- 路由：`/Apex/system/securityConfig`

## 功能集合分布（19 条）

| 功能集合 | 条数 |
|----------|------|
| 页面加载 | 2 |
| 页面权限 | 3 |
| Tab切换 | 4 |
| 表单校验 | 3 |
| 保存操作 | 4 |
| 界面布局 | 1 |
| 异常处理 | 2 |

## 需在测试工具手动添加的功能集合

1. **Tab切换**
2. **保存操作**

## 质量自检（ui-v2）

| 检查项 | 结果 |
|--------|------|
| 用例结果必填 | 通过（19/19） |
| 功能集合必填 | 通过 |
| 单验证点 | 通过 |
| 用户可感知步骤 | 通过 |

## 复跑命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/securityConfig.cases.json \
  --template ../../../docs/问题单/模板/securityConfig.csv \
  --output ../../../docs/问题单/0610/securityConfig.csv \
  --force
```
