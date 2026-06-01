# 常见失败原因对照表

| 错误信号 | 根因 | agent 处理方式 |
|---------|------|-------------|
| `password 仍为 CHANGE_ME` | 密码未配置 | 提示用户 cp example 文件 + 填入密码 |
| `opencli doctor 未通过` | Chrome 桥接异常 | 提示用户运行 `opencli doctor` 修复 |
| `等待验证码输入超时` | manual 模式等待过久 | 建议 bind-only + --skip-login |
| `未找到项目: test_plat` | 环境缺少该项目 | 提示用户修改 `tenantData.projectName` |
| `步骤7失败` | 创建后查不到租户 | 查看 screenshots/ 截图 |
| `步骤10失败` | 删除后仍能搜到 | 可能删除弹窗未确认成功 |
| `captchaMode=auto 报错` | 页面出了验证码 | 切换 captchaMode 或换环境 |
| 浏览器无响应 | Chrome 崩溃 | 重启 Chrome + `opencli browser <session> bind` |

## 快速诊断命令

```bash
# 查看失败现场
ls -lt screenshots/
cat screenshots/die-*.txt 2>/dev/null | head -20

# 环境自检
bash run-e2e.sh --check

# 当前浏览器状态
opencli browser nebula-ux state
opencli browser nebula-ux get url
```
