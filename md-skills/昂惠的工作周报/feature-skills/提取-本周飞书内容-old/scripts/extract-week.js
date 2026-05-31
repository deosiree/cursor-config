/**
 * extract-week.js
 * 从本地缓存的飞书文档全文中，按双锚点正则截取目标周的工作内容。
 *
 * 用法：
 *   node extract-week.js --cache <path> --start "5.25" --end "5.29"
 *   node extract-week.js --cache <path> --target-week "本周"
 *
 * 输出：JSON 数组 [{text, day}, ...] 到 stdout
 *
 * 依赖：飞书文档全文已通过 OpenCLI 下载并存为本地缓存文件
 *       （默认路径：../template/snapshot/飞书文档-全文缓存.md）
 */

const fs = require('fs');
const path = require('path');

// ── 命令行参数 ──────────────────────────────────
const args = parseArgs(process.argv.slice(2));

const CACHE_PATH = args.cache || path.join(
  __dirname, '..', 'template', 'snapshot', '飞书文档-全文缓存.md'
);

// ── 自然语言 → 日期范围映射 ─────────────────────
function resolveTargetWeek(targetWeek) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // 计算本周一（周日视为周末，周一为本周第一天）
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysSinceMonday);
  thisMonday.setHours(0, 0, 0, 0);

  function formatMD(date) { return `${date.getMonth() + 1}.${date.getDate()}`; }
  function weekRange(monday) {
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return { start: formatMD(monday), end: formatMD(friday) };
  }

  // 直接 "M.D-M.D" 格式
  const directMatch = /^(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})$/.exec(targetWeek || '');
  if (directMatch) {
    return { start: `${directMatch[1]}.${directMatch[2]}`, end: `${directMatch[3]}.${directMatch[4]}` };
  }

  // "M.D那周" 格式
  const thatWeek = /^(\d{1,2})\.(\d{1,2})那周$/.exec(targetWeek || '');
  if (thatWeek) {
    const ref = new Date(now.getFullYear(), parseInt(thatWeek[1]) - 1, parseInt(thatWeek[2]));
    const refDay = ref.getDay();
    const daysSinceMondayRef = refDay === 0 ? 6 : refDay - 1;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - daysSinceMondayRef);
    return weekRange(monday);
  }

  // "N周前"
  const nWeeksAgo = /^(\d+)周前$/.exec(targetWeek || '');
  if (nWeeksAgo) {
    const monday = new Date(thisMonday);
    monday.setDate(thisMonday.getDate() - 7 * parseInt(nWeeksAgo[1]));
    return weekRange(monday);
  }

  // 默认：本周/这周/不指定
  const weekMap = {
    '本周': 0, '这周': 0, '本周工作': 0,
    '上周': 1, '上上周': 2,
  };

  const offset = (targetWeek && weekMap[targetWeek] !== undefined) ? weekMap[targetWeek] : 0;
  const monday = new Date(thisMonday);
  monday.setDate(thisMonday.getDate() - 7 * offset);
  return weekRange(monday);
}

// ── 双锚点截取 ──────────────────────────────────
const WEEK_ANCHOR_RE = /(\d{1,2})\.(\d{1,2})[\s\-–—]+(\d{1,2})\.(\d{1,2})/g;

/**
 * 从飞书文档全文中提取目标周的工作内容
 * @param {string} fullText - 文档全文
 * @param {{start:string, end:string}} dateRange - 目标日期范围
 * @returns {{items: Array<{text:string, day:string}>, anchorStart: string, anchorEnd: string|null}}
 */
function extractWeek(fullText, dateRange) {
  // 1. 扫描所有周标记锚点
  const anchors = [];
  let match;
  while ((match = WEEK_ANCHOR_RE.exec(fullText)) !== null) {
    const startDate = `${match[1]}.${match[2]}`;
    const endDate = `${match[3]}.${match[4]}`;
    anchors.push({
      pos: match.index,
      line: match[0],
      startDate,
      endDate,
      fullMatch: match[0],
    });
  }

  if (anchors.length === 0) {
    throw new Error('文档格式异常，未找到任何周标记（MM.DD-MM.DD 格式）');
  }

  // 2. 匹配起始锚点（精确匹配 startDate）
  const startAnchor = anchors.find(a => a.startDate === dateRange.start);
  if (!startAnchor) {
    const available = anchors.map(a => `${a.startDate}-${a.endDate}`).join(', ');
    throw new Error(
      `未找到 ${dateRange.start}-${dateRange.end} 对应的周标记。` +
      `文档中可用的周范围：${available}`
    );
  }

  // 3. 确定终止锚点（下一个锚点，或文档末尾）
  const startIdx = anchors.indexOf(startAnchor);
  const endAnchor = anchors[startIdx + 1] || null;

  // 4. 截取文本范围
  // 从起始锚点匹配结束位置到终止锚点起始位置（或文档末尾）
  const startPos = startAnchor.pos + startAnchor.fullMatch.length;
  const endPos = endAnchor ? endAnchor.pos : fullText.length;

  const weekText = fullText.slice(startPos, endPos).trim();

  if (!weekText) {
    throw new Error(`该周（${dateRange.start}-${dateRange.end}）内容为空`);
  }

  // 5. 解析工作项（按行拆分，过滤日期标题和空行）
  const items = parseWorkItems(weekText);

  if (items.length === 0) {
    throw new Error(`该周（${dateRange.start}-${dateRange.end}）内容为空`);
  }

  return {
    items,
    anchorStart: startAnchor.fullMatch,
    anchorEnd: endAnchor ? endAnchor.fullMatch : null,
  };
}

/**
 * 将周文本解析为工作项列表
 * 日期标题行（"周一""周二"等）作为 day 标记，不输出为 item
 */
function parseWorkItems(weekText) {
  const lines = weekText.split('\n');
  const items = [];
  let currentDay = '';

  const dayHeaderRe = /^(周[一二三四五六日]|[一二三四五六日])[：:]/;
  const imageRe = /^!\[Image\]/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || imageRe.test(trimmed)) continue;

    // 检测日期标题
    const dayMatch = dayHeaderRe.exec(trimmed);
    if (dayMatch) {
      currentDay = dayMatch[1].startsWith('周') ? dayMatch[1] : `周${dayMatch[1]}`;
      continue;
    }

    // 跳过纯标题行（如"5.6-5.9工作记录"）
    if (/^\d{1,2}\.\d{1,2}[\s\-–—]+\d{1,2}\.\d{1,2}/.test(trimmed)) continue;
    // 跳过 "下周计划" 分隔线
    if (/^下周计划/.test(trimmed)) break;

    // 提取工作项文本（去除序号和 checkbox 标记）
    let text = trimmed
      .replace(/^\d+[、.，,]\s*/, '')          // 序号
      .replace(/^[*\-•]\s*/, '')               // 列表标记
      .replace(/\[x\]|\[ \]/gi, '')            // checkbox 标记
      .replace(/~~(.+?)~~/g, '$1')             // 飞书删除线
      .replace(/⏰\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}/g, '') // 提醒时间
      .trim();

    if (text) {
      items.push({ text, day: currentDay || '未标注' });
    }
  }

  return items;
}

// ── 入口 ────────────────────────────────────────
function main() {
  // 参数解析
  let dateRange;
  if (args.start && args.end) {
    dateRange = { start: args.start, end: args.end };
  } else {
    dateRange = resolveTargetWeek(args['target-week'] || '本周');
  }

  // 读取本地缓存
  if (!fs.existsSync(CACHE_PATH)) {
    console.error(JSON.stringify({
      error: 'CACHE_NOT_FOUND',
      message: `本地缓存文件不存在: ${CACHE_PATH}`,
      hint: '请先运行 OpenCLI 下载飞书文档',
    }));
    process.exit(1);
  }

  const fullText = fs.readFileSync(CACHE_PATH, 'utf-8');
  if (!fullText.trim()) {
    console.error(JSON.stringify({
      error: 'CACHE_EMPTY',
      message: '缓存文件为空',
      hint: '飞书文档下载失败，请重新运行下载步骤',
    }));
    process.exit(1);
  }

  // 执行提取
  let result;
  try {
    result = extractWeek(fullText, dateRange);
  } catch (err) {
    console.error(JSON.stringify({
      error: 'EXTRACT_FAILED',
      message: err.message,
      dateRange,
    }));
    process.exit(1);
  }

  // 输出 JSON（仅 items，不含元信息，兼容下游）
  const output = {
    dateRange,
    anchorStart: result.anchorStart,
    anchorEnd: result.anchorEnd,
    count: result.items.length,
    items: result.items,
  };

  console.log(JSON.stringify(output, null, 2));
}

// ── 工具函数 ────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

if (require.main === module) {
  main();
}

module.exports = { extractWeek, resolveTargetWeek, parseWorkItems };
