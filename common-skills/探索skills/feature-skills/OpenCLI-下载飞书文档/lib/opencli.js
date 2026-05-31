/**
 * OpenCLI 浏览器命令封装
 */

const { execSync } = require('child_process');
const OPENCLI = process.platform === 'win32'
  ? 'D:\\Environment\\node\\node_global\\opencli.cmd'
  : 'opencli';

function oc(session, cmd, timeoutMs = 30000) {
  return execSync(`${OPENCLI} browser ${session} ${cmd}`, { encoding: 'utf-8', timeout: timeoutMs });
}

function openPage(session, url)        { return oc(session, `open "${url}"`); }
function waitLoad(session, seconds)    { oc(session, `wait time ${seconds}`); }

function getScrollInfo(session) {
  const raw = oc(session, `eval "(()=>{var el=document.querySelector('.bear-web-x-container');return JSON.stringify({sh:el.scrollHeight,ch:el.clientHeight});})()"`);
  const json = extractJSON(raw);
  return { scrollHeight: json.sh, clientHeight: json.ch };
}

/** 派发 scroll 事件（SPA 监听此事件触发渲染） */
function scrollWithEvent(session, top) {
  oc(session, `eval "(()=>{var el=document.querySelector('.bear-web-x-container');el.scrollTop=${top};el.dispatchEvent(new Event('scroll',{bubbles:true}));return el.scrollTop;})()"`);
}

/** 浏览器原生滚动，负值 = 上滚 */
function browserScroll(session, amount) {
  const cmd = amount < 0
    ? `scroll up --amount ${-amount}`
    : `scroll down --amount ${amount}`;
  oc(session, cmd, 10000);
}

function extractPage(session, chunkSize = 20000) {
  const raw = oc(session, `extract --chunk-size ${chunkSize}`, 60000);
  return JSON.parse(raw).content || '';
}

function closeSession(session) {
  try { oc(session, 'close', 10000); } catch (e) {}
}

function extractJSON(raw) {
  const m = raw.match(/\{[^]*\}/);
  if (!m) throw new Error('No JSON in eval output');
  return JSON.parse(m[0]);
}

module.exports = { openPage, waitLoad, getScrollInfo, scrollWithEvent, browserScroll, extractPage, closeSession };
