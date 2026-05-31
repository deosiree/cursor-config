/**
 * 飞书文档 API 下载（需要 tenant/user access token）
 *
 * 用法:
 *   node feishu-api.js --docid IbuLwEv7fituvMkrSaWc86CjncX --out ./cache.md --token <token>
 *
 * 获取 token:
 *   飞书开放平台 → 创建应用 → 获取 tenant_access_token
 *   或: 浏览器登录后从 Cookie 中提取
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'open.feishu.cn';

function parseArgs() {
  const a = process.argv.slice(2);
  const o = { docid: null, out: null, token: null };
  for (let i = 0; i < a.length; i++) {
    if      (a[i] === '--docid') o.docid = a[++i];
    else if (a[i] === '--out')   o.out = a[++i];
    else if (a[i] === '--token') o.token = a[++i];
  }
  if (!o.docid) throw new Error('缺少 --docid');
  if (!o.out) throw new Error('缺少 --out');
  return o;
}

function apiRequest(method, endpoint, token, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: `/open-apis${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`API ${res.statusCode}: ${data.slice(0,200)}`)); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/** 获取文档块列表 */
async function getBlocks(docid, token) {
  const blocks = [];
  let pageToken = null;
  do {
    const path = `/docx/v1/documents/${docid}/blocks/${docid}/children` +
      `?document_revision_id=-1&page_size=500` +
      (pageToken ? `&page_token=${pageToken}` : '');
    const res = await apiRequest('GET', path, token);
    if (res.code !== 0) throw new Error(`API error: ${res.msg}`);
    if (res.data?.items) blocks.push(...res.data.items);
    pageToken = res.data?.page_token;
  } while (pageToken);
  return blocks;
}

/** 块类型 → Markdown 文本 */
function blockToText(block) {
  const type = block.block_type;
  if (type === 2) { // text
    const elements = block.text?.elements || [];
    let text = '';
    for (const el of elements) {
      if (el.text_run) {
        text += el.text_run.content;
      }
    }
    const style = block.text?.style || {};
    if (style.heading_level) {
      return '#'.repeat(style.heading_level) + ' ' + text + '\n\n';
    }
    if (style.bullet) {
      return '- ' + text + '\n';
    }
    if (style.ordered) {
      return '1. ' + text + '\n';
    }
    return text + '\n\n';
  }
  if (type === 27) { // image
    const token = block.image?.token;
    return token ? `![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/v2/cover/${token}/)\n\n` : '';
  }
  return '';
}

async function download(docid, outputPath, token) {
  console.log('[api] 获取文档块...');
  const blocks = await getBlocks(docid, token);
  console.log(`[api] ${blocks.length} 个块`);

  const markdown = blocks.map(blockToText).join('');
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, markdown, 'utf-8');

  return { outputPath, chars: markdown.length, blocks: blocks.length };
}

if (require.main === module) {
  const o = parseArgs();
  download(o.docid, o.out, o.token)
    .then(r => { console.log(JSON.stringify(r)); process.exit(0); })
    .catch(e => { console.error('[api] 失败:', e.message); process.exit(1); });
}

module.exports = { download, getBlocks };
