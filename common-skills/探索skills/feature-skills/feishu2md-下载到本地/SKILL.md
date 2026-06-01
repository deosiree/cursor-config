---
name: feishu2md-下载到本地
description: 使用 feishu2md CLI（v2.4.5+）下载飞书文档为 Markdown。feishu2md.exe 随本 skill 自带在 script/ 目录中，首次使用自动安装配置。输入飞书文档 URL 和输出路径，调用 feishu2md.exe dl 命令完成下载，图片自动保存到 static/ 子目录。适用于从飞书知识库/文档批量拉取内容到本地 Obsidian Vault。触发词：feishu2md下载、下载飞书文档、feishu2md、飞书转markdown、download feishu doc、pull feishu、拉取飞书文档。
---

# feishu2md-下载到本地

## 首次安装（自安装）

本 skill 已自带 feishu2md.exe 二进制包，无需手动安装 Go 环境或从 GitHub Release 下载。

### 文件清单

```
script/
  feishu2md-v2.4.5-windows-amd64/
    feishu2md.exe   ← 预编译的 Go 二进制（4.8 MB，无需安装）
    README.md        ← 官方说明文档，含 API 申请指引
```

所有路径引用均基于本 SKILL.md 所在目录的相对路径，不依赖绝对路径或系统 PATH。

### 首次使用流程

#### Step-A：确认二进制可执行性

运行 feishu2md.exe 验证版本：

```bash
"{skillDir}\script\feishu2md-v2.4.5-windows-amd64\feishu2md.exe" --version
```

预期输出：`feishu2md version v2.4.5`

#### Step-B：配置飞书凭证

> 凭证已预置在本 skill 中，Agent 自动执行以下命令完成配置：

```bash
"{skillDir}\script\feishu2md-v2.4.5-windows-amd64\feishu2md.exe" config --appId "cli_aa916285b2b8dbc3" --appSecret "JK69bSvkH0l7SRCuTrahOgcIvUHfjPsw"
```

配置写入 `%APPDATA%/feishu2md/config.json`，后续调用无需重复配置。

**如果凭证变更**：替换上面的 appId 和 appSecret，重新运行 config 命令即可。

#### Step-C：验证配置

```bash
"{skillDir}\script\feishu2md-v2.4.5-windows-amd64\feishu2md.exe" dl --help
```

执行成功 → 凭证可用（feishu2md 启动后自动检测 token）。

---

## 路由表

| 场景 | 触发词 | 路由 |
|------|--------|------|
| 下载默认飞书文档 | feishu2md下载、下载飞书文档、feishu2md | 本 skill，使用默认 URL + 默认输出 |
| 下载指定文档 | 拉取飞书文档、指定 URL 下载 | 本 skill，传入 `url` 参数 |
| 下载整个知识库 | wiki 下载 | 本 skill，`--wiki` 分支 → 需 settings URL |

## 输入参数

| 参数 | 必填 | 默认值 | 说明 |
|------|:---:|--------|------|
| `url` | 否 | `https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX` | 飞书文档 URL |
| `outputDir` | 否 | `D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md` | 输出目录 |
| `outputName` | 否 | `达人 BD 每日工作记录` | 输出文件名（不含扩展名） |
| `feishu2mdPath` | 否 | `script\feishu2md-v2.4.5-windows-amd64\feishu2md.exe`（相对于本 SKILL.md 所在目录） | feishu2md 可执行文件路径 |

> `feishu2mdPath` 支持：
> - 相对路径（相对于本 SKILL.md 所在目录，如 `script\feishu2md-v2.4.5-windows-amd64\feishu2md.exe`）
> - 绝对路径（如 `D:\tools\feishu2md.exe`）
> - 环境变量 `%FEISHU2MD_PATH%`（如已设置，自动读取覆盖）

## 前置条件

| 条件 | 状态 |
|------|------|
| feishu2md.exe | ✅ 本技能自带，位于 `script\feishu2md-v2.4.5-windows-amd64\feishu2md.exe`（相对于本 SKILL.md 目录）；支持通过 `feishu2mdPath` 参数或 `%FEISHU2MD_PATH%` 环境变量覆盖 |
| 飞书应用凭证 | ✅ 已预置 App ID + App Secret 在下方「首次安装·Step-B」中，Agent 首次使用时自动配置到 `%APPDATA%/feishu2md/config.json` |
| 飞书应用权限 | `docx:document:readonly`、`wiki:wiki:readonly`、`drive:drive:readonly`、`docs:document.media:download`（已在飞书开发者后台开通） |

## 流程

### 步骤 0：前置校验（检查点 CP0）

> Agent 在执行下载前执行此步骤，输出校验结果，等待人工确认后进入步骤 1。

#### 0.1 解析路径

```
skillDir = .cursor/common-skills/探索skills/feature-skills/feishu2md-下载到本地
feishu2mdPath = {skillDir}/script/feishu2md-v2.4.5-windows-amd64/feishu2md.exe
```

所有路径均为相对于项目根目录的相对路径（或相对于本 SKILL.md 所在目录）。

#### 0.2 自安装校验

逐项检查并按需执行：

1. **feishu2md.exe 可执行性检测**
   - 路径：`{feishu2mdPath}`（相对于本 SKILL.md 目录的相对路径）
   - 执行 `feishu2md --version` 验证存在且可执行
   - 如未找到：二进制文件已预置在 `script/feishu2md-v2.4.5-windows-amd64/` 下，无需额外下载

2. **飞书凭证检测**
   ```bash
   {feishu2mdPath} dl --help
   ```
   - 执行成功 → 凭证可用
   - 执行失败（401 / auth error）→ 自动执行配置（见「首次安装·Step-B」中的 appId / appSecret），无需用户手动输入

3. **输出目录可写性检测**
   ```powershell
   Test-Path "{outputDir}"
   ```
   - 不存在：后续步骤自动创建（`New-Item -Force -ItemType Directory`）
   - 存在但不可写：报错退出

**CP0 输出示例：**
```
前置校验：
  feishu2md.exe → ✅ 存在（{path}）
  凭证检测 → ✅ 通过
  输出目录 → ✅ 可写（{outputDir}）
回复"继续"进入下载
```

### 步骤 1：创建输出目录

```powershell
New-Item -ItemType Directory -Force -Path "{outputDir}"
```

### 步骤 2：执行下载

```bash
{feishu2mdPath} dl -o "{outputDir}" "{url}"
```

- **每次覆盖**：同名 `.md` 文件直接覆盖
- **图片**：自动存入 `{outputDir}/static/`，文件名 = 飞书图片 token
- **超时**：默认 120s（单次下载超过 2 分钟则终止）

### 步骤 3：校验产物（检查点 CP1）

> **Agent 在此暂停，展示校验结果，等待人工回复"继续"后进入下一步。**

下载后逐项检查：

1. `{outputDir}/` 下生成了 `*.md` 文件（文件名 ≠ `{outputName}.md` 的是下载产物）
2. 文件大小 > 0 字节（`(Get-Item {filePath}).Length -gt 0`）
3. 如有图片引用，`{outputDir}/static/` 目录存在且图片数 ≥ Markdown 中 `![](` 引用数

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

### 步骤 4：重命名为标准文件名

```powershell
$files = Get-ChildItem "{outputDir}" -Filter "*.md" | Where-Object { $_.Name -ne "{outputName}.md" }
if ($files.Count -eq 1) {
    Move-Item -Force $files[0].FullName "{outputDir}\{outputName}.md"
    Write-Output "已重命名：$($files[0].Name) → {outputName}.md"
} elseif ($files.Count -eq 0) {
    throw "未找到下载的 .md 文件"
} else {
    throw "找到多个 .md 文件，请手动处理：$($files.Name -join ', ')"
}
```

### 步骤 5：最终报告

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
{feishu2mdPath} dl --dump -o "{outputDir}" "{url}"
```

在 `.md` 旁额外生成 `{docToken}.json`（文档所有 block 的 API 原始响应）。

### 下载整个知识库

```bash
{feishu2mdPath} dl --wiki -o "{outputDir}" "https://xxx.feishu.cn/wiki/settings/<SPACE_ID>"
```

> `--wiki` 需要 settings 页 URL（格式：`/wiki/settings/TOKEN`），而非普通 wiki 页面 URL。见 [[references/wiki-settings-url.md]]。

## 边界条件

| 条件 | 现象 | 处理 |
|------|------|------|
| feishu2md.exe 不存在于任何检测路径 | 步骤 0 检测不到 | 自动触发首次安装流程：检查 `script\\feishu2md-v2.4.5-windows-amd64\\feishu2md.exe` 是否存在 → 如存在直接使用，无需下载；如文件缺失才提示从 GitHub Release 下载 |
| feishu2md 路径含空格 | 命令解析错误 | 用双引号包裹路径，如 `"{path}"` |
| 未配置飞书凭证 | 401 / auth 错误 | 报错，提示运行 `{feishu2mdPath} config --appId <ID> --appSecret <SECRET>` |
| 凭证过期或权限不足 | `code: 131006, msg: permission denied` | 报错，提示去飞书开放平台检查权限范围，重点确认 `wiki:wiki:readonly` + `drive:drive:readonly` |
| 输出目录不可写（权限/磁盘满） | `Write denied` / `disk full` | 报错：检查目录权限或磁盘剩余空间 |
| 网络超时（>120s） | 进程无响应 | 终止，提示检查网络连接或文档是否过大，建议重试 |
| URL 格式无效 | `Invalid URL pattern` | 报错，展示 feishu2md 原始 stderr，检查 URL 是否以 `https://xxx.feishu.cn/wiki/` 开头 |
| feishu2md 崩溃/panic | 非零退出码 + stderr 含 panic | 报错：feishu2md 内部错误，展示 stderr 最后 3 行 |
| 下载结果为空文件 | 生成 .md 文件但 size=0 | 报错：文档为空或下载不完整，检查 URL 和网络 |
| 输出目录存在同名文件 | — | 自动覆盖（feishu2md 行为），无需额外处理 |
| 输出路径中的目录不存在 | — | 步骤 1 自动创建 |
| %FEISHU2MD_PATH% 指向无效文件 | file not found | 报错：提示检查环境变量指向的路径是否正确 |

## 依赖

- feishu2md v2.4.5 Windows 可执行文件（默认随本 skill 存储于 `script/` 子目录）
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
# Agent 直接执行步骤 0-5

# 指定 URL + 路径
{feishu2mdPath} dl -o "D:\output" "https://xxx.feishu.cn/wiki/xxx"
```

此 skill 被父 skill `昂惠的工作周报` 的特征层调用，作为飞书文档下载的默认实现。