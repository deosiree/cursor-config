/**
 * 飞书文档全量下载 v2 — 用 OpenCLI eval 精准滚动 SPA 容器逐页提取
 *
 * 用法: node download-v2.js --url "URL" --out "path.md"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OPENCLI = 'D:\\Environment\\node\\node_global\\opencli.cmd';
const SESSION = 'feishu-dl-v2';

function oc(cmd, timeoutMs = 30000) {
  return execSync(`${OPENCLI} browser ${SESSION} ${cmd}`, { encoding: 'utf-8', timeout: timeoutMs });
}

function parseArgs() {
  const a = process.argv.slice(2);
  const o = { url: null, out: null };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--url') o.url = a[++i];
    if (a[i] === '--out') o.out = a[++i];
  }
  if (!o.url) throw new Error('缺少 --url');
  if (!o.out) throw new Error('缺少 --out');
  return o;
}

async function main() {
  const { url, out } = parseArgs();
  const start = Date.now();

  // 1. 打开页面
  oc(`open "${url}"`, 15000);
  console.log('[v2] 页面已打开');

  // 2. 等待加载 + 获取容器尺寸
  const info = JSON.parse(oc(`eval "new Promise(r=>setTimeout(r,4000)).then(()=>{var el=document.querySelector('.bear-web-x-container');return JSON.stringify({sh:el?.scrollHeight||0,ch:el?.clientHeight||0});})"`, 15000));
  console.log(`[v2] 容器: scrollHeight=${info.sh}, clientHeight=${info.ch}`);

  if (info.sh === 0) throw new Error('找不到 .bear-web-x-container');

  const step = Math.floor(info.ch * 0.7); // 70% 重叠避免漏内容
  const pages = Math.ceil(info.sh / step);
  console.log(`[v2] 共 ${pages} 个视口，步长 ${step}px`);

  const seen = new Set();
  const chunks = [];

  // 3. 从顶到底逐页滚动提取
  for (let i = 0; i < pages; i++) {
    const top = Math.min(i * step, info.sh - info.ch);
    oc(`eval "(()=>{var el=document.querySelector('.bear-web-x-container');el.scrollTop=${top};el.dispatchEvent(new Event('scroll',{bubbles:true}));return el.scrollTop;})()"`, 5000);

    // 等 SPA 渲染
    const text = JSON.parse(oc(`eval "new Promise(r=>setTimeout(r,2000)).then(()=>{return JSON.stringify({len:document.querySelector('#docx')?.innerText?.length||0,text:document.querySelector('#docx')?.innerText||''});})"`, 15000));

    if (!text.text || seen.has(text.len)) continue;
    seen.add(text.len);
    chunks.push({ top, text: text.text, len: text.len });
    console.log(`[v2] 位置 ${top}px → ${text.len} 字符`);
  }

  // 4. 合并：去重相邻重叠
  let merged = '';
  let prevEnd = '';
  for (const c of chunks) {
    // 简单拼接，依赖 seen 去重
    merged += '\n' + c.text;
  }

  // 5. 清理 + 写出
  const clean = merged
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/评论（0\)[\s\S]*$/, '') // 去掉尾部 UI chrome
    .trim();

  const dir = path.dirname(out);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(out, clean, 'utf-8');

  // 6. 清理
  try { oc('close', 5000); } catch (e) {}

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[v2] 完成: ${clean.length} 字符, ${chunks.length} 页, ${elapsed}s`);
}

main().catch(e => { console.error('[v2] 失败:', e.message); process.exit(1); });
