---
name: feishu2md-下载到本地
description: 使用 feishu2md CLI（v2.4.5+）下载飞书文档为 Markdown。输入飞书文档 URL 和输出路径，调用 feishu2md.exe dl 命令完成下载，图片自动保存到 static/ 子目录。适用于从飞书知识库/文档批量拉取内容到本地 Obsidian Vault。触发词：feishu2md下载、下载飞书文档、feishu2md、飞书转markdown、download feishu doc、pull feishu、拉取飞书文档。
---

# feishu2md-下载到本地

## 前置条件

| 条件 | 状态 |
|------|------|
| feishu2md.exe | `D:\FILE\Repository\feishu2md-v2.4.5-windows-amd64\feishu2md.exe` |
| 飞书应用凭证 | 已写入 `%APPDATA%/feishu2md/config.json`（appId + appSecret） |
| 飞书应用权限 | `docx:document:readonly`、`wiki:wiki:readonly`、`drive:drive:readonly`、`docs:document.media:download` |

## 输入

| 参数 | 必填 | 默认值 | 说明 |
|------|:---:|------|------|
| `url` | 否 | `https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX` | 飞书文档 URL |
| `outputDir` | 否 | `D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md` | 输出目录 |
| `outputName` | 否 | `达人 BD 每日工作记录` | 输出文件名（不含扩展名） |

## 流程

### 1. 前置校验

执行下载前确认：

- [ ] `feishu2md.exe` 存在于默认路径（否则报错退出）
- [ ] 输出目录可访问或可创建

### 2. 创建输出目录

```powershell
New-Item -ItemType Directory -Force -Path "<outputDir>"
```

### 3. 执行下载

```bash
D:\FILE\Repository\feishu2md-v2.4.5-windows-amd64\feishu2md.exe dl -o "<outputDir>" "<url>"
```

- **每次覆盖**：同名 `.md` 文件直接覆盖
- **图片**：自动存入 `{outputDir}/static/`，文件名 = 飞书图片 token
- **超时**：默认 120s

### 4. 校验产物（检查点 CP1）

> **Agent 在此暂停，展示校验结果，等待人工回复"继续"后进入下一步。**

下载后逐项检查：

1. `{outputDir}/` 下生成了 `*.md` 文件（文件名 = 飞书文档 token）
2. 文件大小 > 0 字节（`(Get-Item <path>).Length -gt 0`）
3. 如有图片引用，`{outputDir}/static/` 目录存在且图片数 = Markdown 中 `![](` 引用数

展示内容：
```
下载校验：
  生成文件：{fileName}
  文件大小：{size} KB
  行数：{lines}
  图片数：{count}（static/）
确认下载完整后回复"继续"
```

如任一检查失败 → 报错退出，不进入后续步骤。

### 5. 重命名为标准文件名

```powershell
$files = Get-ChildItem "<outputDir>" -Filter "*.md" | Where-Object { $_.Name -ne "<outputName>.md" }
if ($files.Count -eq 1) {
    Move-Item -Force $files[0].FullName "<outputDir>\<outputName>.md"
    Write-Output "已重命名：$($files[0].Name) → <outputName>.md"
} elseif ($files.Count -eq 0) {
    throw "未找到下载的 .md 文件"
} else {
    throw "找到多个 .md 文件，请手动处理：$($files.Name -join ', ')"
}
```

### 6. 最终报告

> Agent 输出摘要，此步骤无需停顿。

```
feishu2md 下载完成
  输出文件：{outputDir}\{outputName}.md
  文件大小：{size} KB | 行数：{lines}
  图片：{count} 张（{outputDir}\static\）
```

将输出文件路径传递给下游 skill。

## 高级用法

### 获取 API 原始 JSON（调试）

```bash
feishu2md.exe dl --dump -o "<outputDir>" "<url>"
```

在 `.md` 旁额外生成 `{docToken}.json`（文档所有 block 的 API 原始响应）。

### 下载整个知识库

```bash
feishu2md.exe dl --wiki -o "<outputDir>" "https://xxx.feishu.cn/wiki/settings/<SPACE_ID>"
```

> `--wiki` 需要 settings 页 URL（格式：`/wiki/settings/TOKEN`），而非普通 wiki 页面 URL。见 [[references/wiki-settings-url.md]]。

## 边界条件

| 条件 | 现象 | 处理 |
|------|------|------|
| feishu2md.exe 不存在 | `feishu2md.exe not found` | 报错并提示安装路径，给出 [Release 下载链接](https://github.com/Wsine/feishu2md/releases) |
| 未配置凭证 | 401 / auth 错误 | 报错，提示运行 `feishu2md config --appId <ID> --appSecret <SECRET>` |
| 权限不足 | `code: 131006, msg: permission denied` | 报错，提示去飞书开放平台开通 `wiki:wiki:readonly` + `drive:drive:readonly` |
| 输出目录不存在 | — | 自动 `mkdir -p` 创建 |
| URL 格式无效 | `Invalid URL pattern` | 报错，展示 feishu2md 原始 stderr |
| 下载超时 | >120s 无响应 | 终止，提示检查网络或文档大小 |
| feishu2md 崩溃/panic | 非零退出码 + stderr 含 panic | 报错：feishu2md 内部错误，展示 stderr 最后 3 行 |
| 文档无内容 | 生成空 .md | 报错：文档为空，检查 URL 是否正确 |

## 依赖

- feishu2md v2.4.5 Windows 可执行文件
- 飞书企业自建应用（权限已开通 + 已发布）
- 应用已安装在目标文档所在企业

## 资源索引

| 路径 | 用途 |
|------|------|
| `[[references/feishu2md-config.md]]` | feishu2md 配置说明 + config.json 位置 |
| `[[references/wiki-settings-url.md]]` | --wiki 模式需要的 settings URL 构造方法 |
| `[[template/mvp/download-output.md]]` | 下载成功后的期望输出样本 |

## 使用示例

```bash
# 下载默认文档（达人 BD 每日工作记录）到默认路径
# Agent 直接执行步骤 1-5

# 指定 URL
feishu2md.exe dl -o "D:\output" "https://xxx.feishu.cn/wiki/xxx"
```

此 skill 被父 skill `昂惠的工作周报` 的特征层调用，作为飞书文档下载的默认实现。
