---
name: OpenCLI-下载飞书文档
description: 通过 OpenCLI 浏览器下载飞书文档全文（虚拟滚动页面），输出为本地 Markdown 缓存文件。通用 skill，url 和 out 由调用方指定，无默认值。
---

# OpenCLI-下载飞书文档

## 依赖

- OpenCLI 浏览器连接（需已登录飞书）
- Node.js ≥ 18

## 输入

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--url` | 飞书文档完整 URL | **无默认值**（调用方必传） |
| `--out` | 输出文件路径（绝对路径或相对于脚本目录） | **无默认值**（调用方必传） |

## 流程

### 1. 打开飞书文档

```bash
opencli browser open <url>
```
等待页面完全加载（SPA 渲染，3-5s）。

### 2. 获取滚动容器参数

```bash
opencli eval "(()=>{const el=document.querySelector('.bear-web-x-container');
  return {sh:el.scrollHeight,ch:el.clientHeight};})()"
```
记录 `{sh, ch}`，计算视口数 = `Math.ceil(sh / ch)`。

### 3. 逐页滚动 + 提取

对每个视口：
```bash
opencli eval "document.querySelector('.bear-web-x-container').scrollTop = {i * ch}"
sleep 2
opencli extract
```
追加到 fullText，按行去重。

### 4. 写入输出文件

将 fullText 写入 `--out` 指定的路径（覆盖已有文件）。

## 执行命令

```bash
node scripts/download.js --url "<飞书文档URL>" --out "<输出路径>"
```

## 门禁

| 条件 | 处理 |
|------|------|
| `--url` 缺失 | 报错：缺少 --url 参数 |
| `--out` 缺失 | 报错：缺少 --out 参数 |
| 执行超时（>60s） | 终止，返回非零退出码 |
| OpenCLI 不可用 | 报错：OpenCLI 未连接，检查浏览器登录态 |
| 部分虚拟页无法渲染 | 用已获取的最大范围文本输出，退出码 2 标记部分下载 |

## 资源索引

| 路径 | 用途 |
|------|------|
| `[[scripts/download.js]]` | 下载脚本 |
