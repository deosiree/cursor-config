# 盘点反模式 — few-shot（薄索引）

## 触发

```text
扫描 apex_dev 哪些页还在用暂无数据冒充无权限。
```

## 源码快照（行级对照）

| 路由 | before 文件 | 反模式 ID |
|------|-------------|-----------|
| `/Apex/tenant` | `[[../../template/sample-run/before-02-页面空态/tenant-index.template.vue]]` | AP-03（嵌套 el-empty）；更早 AP-01（仅清空 pageData） |
| `/Apex/dashboard` | `[[../../template/sample-run/before-02-页面空态/dashboard-index.template.vue]]` | AP-02（裸 el-empty） |
| 样式重复 | `[[../../template/sample-run/before-02-页面空态/tenant-no-perm.style.scss]]` | AP-04 |

## 期望扫描输出片段

| 路由 | antiPattern | pageGatePermCandidate |
|------|-------------|----------------------|
| `/Apex/tenant` | AP-01/AP-03 | `sys:tenant:query` |
| `/Apex/dashboard` | AP-02 | `sys:dashboard:view` |

## GREEN 对照

`[[../../template/sample-run/after-02-页面空态/]]`
