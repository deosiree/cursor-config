# 表格滚动断言

## 前置

1. 菜单管理页已打开
2. 已点击「白名单」打开「编辑白名单」弹窗
3. 表体有足够行数（建议 ≥50 + max-height 400）

## 脚本

```powershell
$js = Get-Content "…/scripts/opencli-whitelist-scroll-eval-oneline.js" -Raw
opencli --profile p2ejw7ww browser p2ejw7ww eval $js
```

或：

```powershell
.\test-api-whitelist-table-scroll.ps1 -BindOnly -SkipSeed
```

## 断言字段

| 字段 | 含义 |
|------|------|
| `rowCount` | tbody 行数 |
| `hasVerticalScroll` | `scrollHeight > clientHeight` on wrap |
| `hasHorizontalScroll` | 弹窗窄时出现 |

## 模式

见 `references/element-plus-table-scroll.md`。
