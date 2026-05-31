/**
 * 下载飞书文档全文（从底部往上，最新内容优先）
 *
 * 用法: node download.js --url "URL" --out "path.md"
 */

const fs = require('fs');
const path = require('path');
const {
  openPage, waitLoad, getScrollInfo,
  scrollWithEvent, browserScroll, extractPage, closeSession
} = require('../lib/opencli');
const config = require('../configs/download.config.json');

function parseArgs() {
  const a = process.argv.slice(2);
  const o = { url: null, out: null, session: config.defaultSessionName, wait: config.pageWaitSec };
  for (let i = 0; i < a.length; i++) {
    if      (a[i] === '--url')     o.url = a[++i];
    else if (a[i] === '--out')     o.out = a[++i];
    else if (a[i] === '--session') o.session = a[++i];
    else if (a[i] === '--wait')    o.wait = parseInt(a[++i]);
    else if (a[i] === '--pages')   o.maxPages = parseInt(a[++i]);
  }
  if (!o.url) throw new Error('缺少 --url');
  if (!o.out) throw new Error('缺少 --out');
  return o;
}

/** 去重：保留 curr 中不在 prev 末尾的部分 */
function dedup(prev, curr) {
  if (!prev) return curr;
  const tail = prev.slice(-300);
  const idx = curr.indexOf(tail);
  return idx >= 0 ? curr.slice(idx + tail.length) : curr;
}

async function download(url, outputPath, opts = {}) {
  const session = opts.session || config.defaultSessionName;
  const pageWait = opts.wait || config.pageWaitSec;
  const maxPages = opts.maxPages || config.maxPages;
  const step = config.scrollStepPx;

  // 1. 打开
  openPage(session, url);
  waitLoad(session, 3);

  // 2. 快速滚到底部（最重要的最新周在这里）
  const pages = Math.min(maxPages, 20);
  for (let i = 0; i < pages; i++) browserScroll(session, step);
  waitLoad(session, 2);

  // 3. 提取底部（当前周）
  let text = extractPage(session, config.chunkSize);
  const chunks = [text];
  let prev = text;
  let skips = 0;

  // 4. 从底部向上逐页
  for (let i = 1; i <= maxPages; i++) {
    browserScroll(session, -step);   // 上滚
    waitLoad(session, pageWait);
    text = extractPage(session, config.chunkSize);

    if (text === prev) {
      if (++skips >= config.maxConsecutiveSkips) break;
      continue;
    }
    skips = 0;
    const added = dedup(text, prev);
    if (added.trim()) chunks.unshift(added);
    prev = text;
  }

  // 5. 写出
  const out = chunks.join('\n').replace(/\n{3,}/g, '\n\n');
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, out, 'utf-8');
  closeSession(session);
  return { outputPath, chars: out.length, pages: chunks.length };
}

if (require.main === module) {
  const o = parseArgs();
  download(o.url, o.out, o).then(r => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { download };
