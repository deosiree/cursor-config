# 权限测试结果落盘CSV — cases.json 映射示例

> 本示例展示 E2E 验证结果如何映射为 `输出csv的测试用例` 所需的 cases.json 格式。

## 输入：E2E 验证结果

```json
{
  "round": 2,
  "config": {
    "granted": ["sys:dashboard:view"],
    "revoked": []
  },
  "results": [
    {"perm": "sys:dashboard:view", "status": "pass", "actual": "首页正常渲染，loadDashboardData 返回 200"}
  ]
}
```

## 输出：cases.json

```json
[
  {
    "name": "权限E2E验证 — sys:dashboard:view — pass",
    "precondition": "admin 已为\"权限测试角色\"勾选 sys:dashboard:view；test 用户 13813815913 已清空 sessionStorage 并重新登录",
    "steps": "1. 用 13813815913 登录系统\n2. 访问 /cloud/Apex/dashboard\n3. 检查页面渲染和 API 调用",
    "expected": "正向：首页正常渲染，loadDashboardData 返回 200",
    "remark": "第 2 轮 — 配置: [sys:dashboard:view] / []"
  }
]
```

## 委托调用

```text
使用 $输出csv的测试用例
模块名：权限管理，子系统：8，创建人员：惠岩
cases 如下：[上一步的 cases 数组]
输出到 docs/问题单/0605/perm-e2e.csv
```

> 外部 skill 路径：`F:\Documents\Repertory\Sieyuan\nebula\.cursor\test-skills\输出csv的测试用例`
