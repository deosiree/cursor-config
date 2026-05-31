// 此文件通过 opencli eval 注入页面执行
async function main() {
  var el = document.querySelector('.bear-web-x-container');
  var sh = el.scrollHeight;
  var ch = el.clientHeight;
  var step = Math.floor(ch * 0.7);
  var pages = Math.ceil(sh / step);
  var allTexts = [];
  var seen = new Set();

  for (var i = 0; i < pages; i++) {
    var top = Math.min(i * step, sh - ch);
    el.scrollTop = top;
    el.dispatchEvent(new Event('scroll', { bubbles: true }));
    await new Promise(function(r) { setTimeout(r, 1500); });
    var t = (document.querySelector('#docx') || {}).innerText || '';
    var key = top + ':' + t.length;
    if (!seen.has(key)) {
      seen.add(key);
      allTexts.push(t);
    }
  }

  return JSON.stringify({
    pages: pages,
    chunks: allTexts.length,
    totalChars: allTexts.reduce(function(s, t) { return s + t.length; }, 0),
    text: allTexts.join('\n==PAGE==\n')
  });
}
main().then(function(r) { return r; });
