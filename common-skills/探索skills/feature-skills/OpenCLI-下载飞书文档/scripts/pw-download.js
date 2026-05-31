/**
 * 用 Playwright + Chrome 下载飞书文档（CDP 直连模式）
 * 前提：先手动启动 Chrome 带调试端口
 *
 * 启动命令（在运行里执行）：
 *   "C:\Users\deii\AppData\Local\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --profile-directory="Profile 4"
 *
 * 用法: node pw-download.js --url "URL" --out "path.md"
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function download(url, outputPath) {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const defaultCtx = browser.contexts()[0];
  const page = defaultCtx.pages()[0] || await defaultCtx.newPage();

  console.log('[pw] 打开:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#docx', { timeout: 15000 });
  await page.waitForTimeout(3000);

  // 滚动到底部
  console.log('[pw] 滚动到底部...');
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      const el = document.querySelector('.bear-web-x-container');
      if (el) { el.scrollTop += el.clientHeight * 0.5; el.dispatchEvent(new Event('scroll', { bubbles: true })); }
    });
    await page.waitForTimeout(400);
  }

  // 从底部向上逐页提取
  const seen = new Set();
  const chunks = [];

  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => {
      const el = document.querySelector('.bear-web-x-container');
      if (el) { el.scrollTop -= el.clientHeight * 0.5; el.dispatchEvent(new Event('scroll', { bubbles: true })); }
    });
    await page.waitForTimeout(500);

    const text = await page.evaluate(() => document.querySelector('#docx')?.innerText || '');
    if (!text || seen.has(text.length)) continue;
    seen.add(text.length);
    chunks.push(text);
    console.log(`[pw] 页${i+1}: ${text.length} 字符`);
  }

  chunks.reverse();
  const merged = [];
  let prev = '';
  for (const c of chunks) {
    const tail = prev.slice(-400);
    const idx = c.indexOf(tail);
    const added = idx >= 0 ? c.slice(idx + tail.length) : c;
    if (added.trim()) merged.push(added);
    prev = c;
  }

  const out = merged.join('\n').replace(/\n{3,}/g, '\n\n');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, out, 'utf-8');

  await page.close().catch(()=>{});
  return { outputPath, chars: out.length };
}

if (require.main === module) {
  const opts = { url: null, out: null };
  process.argv.slice(2).forEach((a,i) => {
    if (a === '--url') opts.url = process.argv[i+3];
    if (a === '--out') opts.out = process.argv[i+3];
  });
  if (!opts.url) opts.url = 'https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX';
  if (!opts.out) opts.out = path.join(__dirname, '..', 'template', 'mvp', 'pw-output.md');
  download(opts.url, opts.out)
    .then(r => { console.log(JSON.stringify(r)); process.exit(0); })
    .catch(e => { console.error('[pw] 失败:', e.message); process.exit(1); });
}
