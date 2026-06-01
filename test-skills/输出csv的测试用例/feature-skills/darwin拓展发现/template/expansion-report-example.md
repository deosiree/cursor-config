# 拓展发现报告示例

## 扫描信号

```yaml
signals:
  - signal: intention_oral
    source: "根据口述整理租户管理 UI 用例"
    detail: "用户无 test.ts 文件，仅口述业务场景"
  - signal: feature_views
    source: "src/views/role/RoleDialog.vue"
    detail: "views 组件交互不在现有 api/gateway feature 覆盖范围内"
```

## 建议沉淀

| 名称 | 类型 | 优先级 | 理由 |
|------|------|--------|------|
| `基于源码+口述生成` | intention | high | 口述场景无执行路径 |
| `views-基于源码生成` | feature | medium | views 组件交互频繁出现 |

## 质量信号（本轮）

| 信号 | 频次 | 来源 |
|------|:----:|------|
| 步骤 > 7 步 | 2 | role-ui-tab cases |
| develop结果 ≠ 预期结果 | 1 | menu-unit-gateway cases |

## 门禁

- 默认仅输出 plan，不自动 mkdir
- 人工确认后再创建新子 skill 目录
