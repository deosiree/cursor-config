# Few-shot：API 白名单表格滚动 E2E

> session: p2ejw7ww · profile: p2ejw7ww · 8080 · admin@system.local

## 用户请求

优化白名单表格 max-height，真实插入 50 条后 OpenCLI 验证纵向/横向滚动条。

## 命令序列

```powershell
opencli --profile p2ejw7ww browser p2ejw7ww bind
cd opencli-ux-api-whitelist/scripts
.\test-api-whitelist-table-scroll.ps1 -BindOnly
# 已插种：-SkipSeed
```

## 关键 eval

```powershell
$js = Get-Content .\opencli-whitelist-scroll-eval-oneline.js -Raw
opencli --profile p2ejw7ww browser p2ejw7ww eval $js
```

## 沉淀

- 滚动容器：`.el-scrollbar__wrap`
- testid：`sys-menu-whitelist-btn`
- 子 skill：`opencli-ux-api-whitelist/`

历史路径 `apex_dev/scripts/*` 已废弃。
