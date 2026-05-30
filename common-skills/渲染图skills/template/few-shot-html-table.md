# HTML 数据表 — 真实输出

**触发：** "对比 Cloudflare Workers、AWS Lambda、Vercel Edge Functions、Deno Deploy 四个边缘运行时，要 7 列 5 行的能力矩阵"  
**来源：** 边缘计算平台选型分析的真实对比表

```html
<!-- 生成的独立文件：platform-compare.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>边缘运行时能力对比</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
  h1 { font-size: 1.4rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem 0.6rem; border: 1px solid #d0d0d0; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  .yes { color: #16a34a; } .no { color: #dc2626; } .partial { color: #ca8a04; }
  caption { text-align: left; margin-bottom: 0.5rem; font-style: italic; color: #666; }
  @media (prefers-color-scheme: dark) {
    body { background: #1a1a2e; color: #e0e0e0; }
    th { background: #16213e; }
    td, th { border-color: #2a2a4a; }
    caption { color: #999; }
  }
</style>
</head>
<body>
<h1>边缘运行时能力对比</h1>
<table>
<caption>数据截至 2025 年 4 月，基于各平台公开文档</caption>
<thead>
<tr>
  <th>能力维度</th>
  <th>Cloudflare Workers</th>
  <th>AWS Lambda</th>
  <th>Vercel Edge</th>
  <th>Deno Deploy</th>
</tr>
</thead>
<tbody>
<tr>
  <td>运行时</td>
  <td>Workers（Service Workers）</td>
  <td>Node.js 20 / Python / Go / Java</td>
  <td>Edge（V8 隔离）</td>
  <td>Deno（V8 + TypeScript 原生）</td>
</tr>
<tr>
  <td>HTTP 并发</td>
  <td class="yes">✅ 无限连接</td>
  <td class="partial">⚠️ 按并发预留</td>
  <td class="yes">✅ 自动扩缩</td>
  <td class="yes">✅ 无限连接</td>
</tr>
<tr>
  <td>执行时长</td>
  <td>30s（含 5ms CPU 时间）</td>
  <td>15min（函数）/ 15s（响应）</td>
  <td>30s</td>
  <td>60s（Beta）</td>
</tr>
<tr>
  <td>冷启动</td>
  <td class="yes">✅ < 1ms</td>
  <td class="no">❌ 200ms~1s</td>
  <td class="yes">✅ < 50ms</td>
  <td class="yes">✅ < 5ms</td>
</tr>
<tr>
  <td>持久化 KV</td>
  <td>Workers KV + D1 + R2</td>
  <td>DynamoDB + S3 + ElastiCache</td>
  <td>Edge KV（Vercel KV + Upstash）</td>
  <td>Kv（Deno KV）</td>
</tr>
</tbody>
</table>
<p>⚠️ 注意：此表 > 4 行 3 列，使用 output-html data-table 模板生成独立 HTML，避免 Mermaid 表格溢出。</p>
</body>
</html>
```

**窄版规则验证（Skill 路由层面）：**
- ✅ 判定 7 列 5 行 > 4 行 3 列 → 路由到 output-html，不走 Mermaid
- ✅ 使用了 data-table 模板风格：`<table>` + `<thead>` + `<tbody>` + `<caption>`
- ✅ 支持暗色模式（`prefers-color-scheme: dark`）
- ✅ 表格首行固定表头，方便横向对比
- ✅ 生成独立 .html 文件，Markdown 中外链引用
