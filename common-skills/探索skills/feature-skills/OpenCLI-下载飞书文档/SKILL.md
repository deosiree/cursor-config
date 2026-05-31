---
name: OpenCLI-下载飞书文档
description: 用 OpenCLI browser 打开飞书文档 URL，逐页滚动提取全文，保存到指定路径。通用能力，不绑定特定文档。调用方式：node scripts/download.js --url <URL> --out <path>
---

# OpenCLI-下载飞书文档

## 输入

| 参数 | 必填 | 说明 |
|------|:---:|------|
| `url` | 是 | 飞书文档 URL（wiki 或 cloud doc） |
| `outputPath` | 是 | 本地输出路径（含文件名） |

## 流程

```
1. OpenCLI browser open URL → 等待页面加载
2. eval 定位 .bear-web-x-container → 获取 scrollHeight / clientHeight
3. 计算视口数 → for 逐页：
   a. eval scrollTop = page × stepSize
   b. wait 2.5s（等 SPA 渲染）
   c. extract --chunk-size 20000 → 获取当前页内容
   d. 与上一页比对去重（相同则跳过，连续 2 次跳过则提前结束）
4. 合并所有页文本 → write_file outputPath
5. 关闭 browser session
```

## 调用方式

```bash
# 通用调用（任何飞书文档）
node scripts/download.js --url "https://xxx.feishu.cn/wiki/xxx" --out "./cache.md"
```

## 边界条件

| 条件 | 处理 |
|------|------|
| URL 无法访问 | 报错退出 |
| 浏览器未登录飞书 | 报错退出（opencli doctor 检查） |
| SPA 某页未渲染新内容 | 跳过该页（与上一页 extract 结果相同时自动跳过） |
| 连续跳过达到上限 | 提前结束循环，输出已获取内容 |
| 输出目录不存在 | 自动创建 |

## 输出

- 本地文件：`outputPath` 指定的 Markdown 文件
- 控制台：JSON `{outputPath, chars, pages}`

## 依赖

- OpenCLI 已安装 + daemon 运行 + browser bridge 已连接
- 浏览器已登录飞书
- Node.js 14+
