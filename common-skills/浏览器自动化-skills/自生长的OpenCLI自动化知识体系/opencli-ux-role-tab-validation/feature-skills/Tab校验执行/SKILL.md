# Tab 校验执行

> 从主 `SKILL.md` 拆出的 TC1~TC4 执行层。负责在已登录/已打开的弹窗上执行具体用例。

## 前置条件

- 已登录 `http://localhost:8080`
- 已打开角色新增弹窗
- opencli doctor 通过，session 可用

## 参数

| 字段 | 默认 | 说明 |
|:-----|:-----|:-----|
| `session` | `nebula-ux` | OpenCLI 会话名 |
| `tcFilter` | 全部 | 只跑某条用例（如 `TC1`） |

## 用例执行

| 用例 | 步骤 | 断言 |
|:----|:-----|:------|
| TC1 | 不填名称 → 切「关联设备」Tab → 确定 | Tab 跳回「基础信息」，显示「请输入角色名称」 |
| TC2 | 不填名称 → 切「菜单权限」Tab → 确定 | 同上 |
| TC3 | 填合法名称 → 确定 | 弹窗关闭或 toast「新增成功」 |
| TC4 | 新增 → 切「关联设备」→ 取消 → 再新增 | 默认 Tab 回到「基础信息」 |

## 脚本

```bash
bash ../role-tab-validation.sh --profile local --skip-login --tc TC1,TC3
```

## 输出

- `tcResults[]`: 每条用例 PASS/FAIL
- `failures[]`: 失败详情 + `screenshots/fail-{tc}.png`
