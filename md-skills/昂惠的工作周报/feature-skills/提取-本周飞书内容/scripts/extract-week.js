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
// 匹配全文中的日期范围，后续按行上下文过滤
const WEEK_ANCHOR_RE = /(\d{1,2})\.(\d{1,2})[\s\-–—]+(\d{1,2})(?:\.(\d{1,2}))?/g;

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
    // 兼容 5.11-5.15（match[4]存在）和 5.18-22（match[4]不存在，复用月份）
    const endDate = match[4] ? `${match[3]}.${match[4]}` : `${match[1]}.${match[3]}`;
    anchors.push({
      pos: match.index,
      line: match[0],
      startDate,
      endDate,
      fullMatch: match[0],
    });
  }

  // 过滤伪锚点：排除任务日期（如 "5.20-6.10 号邮寄"），保留周标题
  const validAnchors = anchors.filter(a => {
    // 获取锚点所在行
    const lineStart = fullText.lastIndexOf('\n', a.pos) + 1;
    const lineEnd = fullText.indexOf('\n', a.pos);
    const rawLine = fullText.slice(lineStart, lineEnd === -1 ? fullText.length : lineEnd);
    const line = rawLine.trim();
    
    // 行中包含 "周" 或 "工作记录" → 是周标题
    if (/周|工作记录/.test(line)) return true;
    
    // 行中包含 "号" 或 "日" + 动作词 → 是任务项（如 "5.20-6.10 号邮寄"）
    if (/[号日]\s*(邮寄|种草|反馈|审核|定稿|发布|确认|跟进|沟通)/.test(line)) return false;
    
    // 纯日期范围（去掉 ##/###/**/— 等格式化前缀后仅剩日期和空格）
    const stripped = line.replace(/^[#*\s\-–—]+/, '').trim();
    if (/^[\d.\-–—\s]+$/.test(stripped)) return true;
    
    return false;
  });
  
  if (validAnchors.length === 0) {
    throw new Error('文档格式异常，未找到任何有效的周标记（MM.DD-MM.DD 格式）');
  }

  // 2. 匹配起始锚点
  const toNum = (d) => { const [m, day] = d.split('.').map(Number); return m * 100 + day; };
  const targetNum = toNum(dateRange.start);
  const lastAnchor = validAnchors[validAnchors.length - 1];
  const lastAnchorEnd = toNum(lastAnchor.endDate);
  
  let startAnchor = validAnchors.find(a => a.startDate === dateRange.start);
  
  // 未来日期门禁：目标日期超出文档最后一周 → 直接报错，不回退
  if (!startAnchor && targetNum > lastAnchorEnd) {
    const available = validAnchors.map(a => `${a.startDate}-${a.endDate}`).join(', ');
    throw new Error(
      `目标周 ${dateRange.start}-${dateRange.end} 超出文档最新记录。` +
      `文档最新周：${lastAnchor.startDate}-${lastAnchor.endDate}。` +
      `可用周范围：${available}`
    );
  }
  
  // 精确匹配失败 + 目标日期在文档范围内 → 向后回退到最近一周
  if (!startAnchor) {
    const candidates = validAnchors
      .filter(a => toNum(a.startDate) <= targetNum)
      .sort((a, b) => toNum(b.startDate) - toNum(a.startDate));
    
    if (candidates.length > 0) {
      startAnchor = candidates[0];
    }
  }
  
  if (!startAnchor) {
    const available = validAnchors.map(a => `${a.startDate}-${a.endDate}`).join(', ');
    throw new Error(
      `未找到 ${dateRange.start}-${dateRange.end} 对应的周标记。` +
      `文档中可用的周范围：${available}`
    );
  }

  // 3. 确定终止锚点（下一个锚点，或文档末尾）
  const startIdx = validAnchors.indexOf(startAnchor);
  const endAnchor = validAnchors[startIdx + 1] || null;

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

  // 匹配各种日期标题格式：### 周一 / **周一** / 周一：/ 周一
  const dayHeaderRe = /^(?:#{1,3}\s+)?(?:\*{0,2})?(周[一二三四五六日](?:\s*\+\s*周[一二三四五六日])?)(?:：|:)?(?:\*{0,2})?$/;
  // 匹配标题行（## / ### 开头的都跳过）
  const headingRe = /^#{1,6}\s+/;
  const imageRe = /^!\[Image\]/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || imageRe.test(trimmed)) continue;

    // 检测终止分隔线（下周计划 / 挂车起号思路）— 最优先
    if (/^(?:#{1,3}\s+)?(下周计划|挂车起号思路)/.test(trimmed)) break;

    // 检测日期标题（周一 ~ 周六）
    const dayMatch = dayHeaderRe.exec(trimmed);
    if (dayMatch) {
      currentDay = dayMatch[1];
      continue;
    }

    // 跳过 Markdown 标题行（## / ### 等，但日期标题已在上方处理）
    if (headingRe.test(trimmed)) continue;

    // 跳过纯标题行（如"5.6-5.9工作记录"、独立的"第四周"等）
    if (/^\d{1,2}\.\d{1,2}[\s\-–—]+\d{1,2}\.\d{1,2}/.test(trimmed)) continue;
    if (/^第[一二三四五六七八九十]+周\s*$/.test(trimmed)) continue;

    // 提取工作项文本（去除序号和 checkbox 标记）
    let text = trimmed
      .replace(/^\d+[、.，,]\s*/, '')          // 序号
      .replace(/^[*\-•]\s*/, '')               // 列表标记
      .replace(/\[x\]|\[ \]/gi, '')            // checkbox 标记
      .replace(/~~(.+?)~~/g, '$1')             // 飞书删除线
      .replace(/⏰\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}/g, '') // 提醒时间
      .trim();

    // 过滤纯 Markdown 格式残片（仅含 # * - 空格等非内容字符）
    if (text && !/^[#*\-\s]+$/.test(text) && text.length > 1) {
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
    // LLM 兜底：输出文档结构摘要供 LLM 根据上下文定位目标周
    if (args['fallback-llm']) {
      const summary = buildDocSummary(fullText);
      console.error(JSON.stringify({
        error: 'EXTRACT_FAILED_LLM_FALLBACK',
        message: err.message,
        dateRange,
        docSummary: summary,
        llmPrompt: `文档中未找到 ${dateRange.start}-${dateRange.end} 对应的周标记。\n\n` +
          `以下是文档的标题结构摘要，请根据它找到目标周的内容范围，输出 JSON：\n` +
          `[\n  {"text": "...", "checked": true/false, "day": "周一~周五"},\n  ...\n]\n\n` +
          `文档标题结构：\n${summary.map(s => `  L${s.line}: ${s.text} [${s.level}]`).join('\n')}`,
      }));
      process.exit(2);
    }
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

/**
 * 提取文档标题结构摘要（供 LLM 兜底定位目标周）
 * @returns {Array<{line: number, text: string, level: string}>}
 */
function buildDocSummary(fullText) {
  const lines = fullText.split('\n');
  const summary = [];
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    // H1
    if (/^# [^#]/.test(trimmed)) {
      summary.push({ line: i + 1, text: trimmed.replace(/^# /, ''), level: 'H1' });
    }
    // H2
    else if (/^## [^#]/.test(trimmed)) {
      summary.push({ line: i + 1, text: trimmed.replace(/^## /, ''), level: 'H2' });
    }
    // H3
    else if (/^### [^#]/.test(trimmed)) {
      summary.push({ line: i + 1, text: trimmed.replace(/^### /, ''), level: 'H3' });
    }
    // 周标记行（未被 ## 包裹但含日期范围 + 周/工作记录字样）
    else if (/(\d+\.\d+[\s\-–—]+\d+(?:\.\d+)?).*(周|工作记录)/.test(trimmed)) {
      summary.push({ line: i + 1, text: trimmed, level: 'WEEK' });
    }
  }
  
  return summary;
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
