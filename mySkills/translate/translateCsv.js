/**
 * CSV词条批量翻译脚本
 * 集成所有功能：术语库提取、批量翻译、验证、CSV输出
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const iconv = require('iconv-lite');
const { extractGlossaryData, generateTranslationRules } = require('./extractGlossary');

// ==================== Prompt模板（外部markdown） ====================

const PROMPT_TEMPLATE_DIR = path.join(__dirname, 'prompts');
const PROMPT_TEMPLATES = {
  single: 'prompt-single.md',
  batch: 'prompt-batch.md'
};

const _promptTemplateCache = new Map();

function loadPromptTemplate(templateName) {
  const filename = PROMPT_TEMPLATES[templateName];
  if (!filename) {
    throw new Error(`未知prompt模板: ${templateName}`);
  }
  const fullPath = path.join(PROMPT_TEMPLATE_DIR, filename);
  if (_promptTemplateCache.has(fullPath)) {
    return _promptTemplateCache.get(fullPath);
  }
  if (!fs.existsSync(fullPath)) {
    throw new Error(`prompt模板文件不存在: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  _promptTemplateCache.set(fullPath, content);
  return content;
}

/**
 * 简单模板渲染：把 {{VAR}} 替换为 vars.VAR（不做复杂语法）
 * @param {string} template
 * @param {Record<string,string>} vars
 * @returns {string}
 */
function renderTemplate(template, vars = {}) {
  let out = String(template || '');
  for (const [k, v] of Object.entries(vars)) {
    const key = String(k);
    const value = (v === null || v === undefined) ? '' : String(v);
    out = out.split(`{{${key}}}`).join(value);
  }
  // 未提供的变量，替换为空（避免残留 {{XXX}}）
  out = out.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
  return out;
}

// ==================== 步骤1: 术语库提取 ====================

/**
 * 提取术语库（如果需要）
 * @param {string} excelPath - Excel文件路径
 * @param {string} rulesPath - 翻译规则文档路径
 */
async function ensureGlossaryExtracted(excelPath, rulesPath, forceReExtract = false) {
  if (forceReExtract) {
    console.log('强制重新提取术语库...');
  } else if (fs.existsSync(rulesPath)) {
    console.log('翻译规则文档已存在，跳过提取');
    return;
  }

  // 如果rulesPath不存在，或者强制重新提取，则执行提取
  if (forceReExtract || !fs.existsSync(rulesPath)) {
    console.log(`正在从Excel文件提取术语库: ${excelPath} ...`);
    const { abbreviationData, fullTranslationData } = extractGlossaryData(excelPath);
    generateTranslationRules(abbreviationData, fullTranslationData, rulesPath);
  } else {
    // 不会走到这里，上面的if已经覆盖
  }
}

// ==================== 步骤2: 加载翻译规则 ====================

/**
 * 解析markdown表格
 * @param {string} markdown - markdown内容
 * @param {string} sectionName - 章节名称
 * @returns {Array} 表格数据
 */
function parseMarkdownTable(markdown, sectionName) {
  const lines = markdown.split('\n');
  const result = [];
  let inSection = false;
  let inTable = false;

  for (const line of lines) {
    // 检测章节
    if (line.includes(sectionName)) {
      inSection = true;
      continue;
    }

    // 检测表格开始
    if (inSection && line.trim().startsWith('|')) {
      inTable = true;
      // 跳过表头分隔行
      if (line.includes('---')) continue;
    }

    // 检测下一个章节，结束当前表格
    if (inTable && line.trim().startsWith('##')) {
      break;
    }

    // 解析表格行
    if (inTable && line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2) {
        result.push(cells);
      }
    }
  }

  return result;
}

/**
 * 加载翻译规则
 * @param {string} rulesPath - 翻译规则文档路径
 * @returns {Object} 包含映射表和规则的对象
 */
function loadTranslationRules(rulesPath) {
  console.log(`正在加载翻译规则: ${rulesPath}`);

  if (!fs.existsSync(rulesPath)) {
    throw new Error(`翻译规则文档不存在: ${rulesPath}`);
  }

  const markdown = fs.readFileSync(rulesPath, 'utf8');

  // 解析翻译简写说明
  // 注意：markdown 表格来自 Excel "翻译简写说明" sheet
  // Excel 列结构：序号(A) | 中文(B) | 英文(C) | 英文缩写(D) | 西语翻译(E)
  // markdown 表格只包含：中文 | 英文缩写
  const abbreviationRows = parseMarkdownTable(markdown, '翻译简写说明');
  const abbreviationMap = new Map();
  for (const row of abbreviationRows) {
    if (row.length >= 2) {
      const chinese = row[0].trim();
      const english = row[1].trim();
      if (chinese && english) {
        abbreviationMap.set(chinese, english);
      }
    }
  }

  // 解析注意要点_中英
  const fullTranslationRows = parseMarkdownTable(markdown, '注意要点_中英');
  const fullTranslationMap = new Map();
  for (const row of fullTranslationRows) {
    if (row.length >= 2) {
      const chinese = row[0].trim();
      const english = row[1].trim();
      if (chinese && english) {
        fullTranslationMap.set(chinese, english);
      }
    }
  }

  // 解析伪代码术语详细说明
  const pseudoCodeRules = [];
  const pseudoCodeRuleMap = new Map();
  const lines = markdown.split('\n');
  let inPseudoCodeSection = false;
  let currentRule = null;
  let currentRawMarkdown = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测伪代码术语区块开始
    if (line.includes('### 伪代码术语详细说明')) {
      inPseudoCodeSection = true;
      continue;
    }

    // 检测区块结束（遇到下一个标题）
    if (inPseudoCodeSection && (line.trim().startsWith('##') || line.trim().startsWith('# '))) {
      // 保存最后一个规则
      if (currentRule) {
        currentRule.rawMarkdown = currentRawMarkdown.join('\n');
        pseudoCodeRules.push(currentRule);
        pseudoCodeRuleMap.set(currentRule.chinese, currentRule);
      }
      break;
    }

    // 解析伪代码术语条目
    if (inPseudoCodeSection && line.trim().startsWith('- **')) {
      // 保存上一个规则
      if (currentRule) {
        currentRule.rawMarkdown = currentRawMarkdown.join('\n');
        pseudoCodeRules.push(currentRule);
        pseudoCodeRuleMap.set(currentRule.chinese, currentRule);
      }

      // 解析新规则：- **中文**: 英文 - 备注
      const match = line.match(/^-\s+\*\*([^*]+)\*\*:\s+([^-]+)(?:\s+-\s+(.+))?$/);
      if (match) {
        currentRule = {
          chinese: match[1].trim(),
          english: match[2].trim(),
          note: match[3] ? match[3].trim() : ''
        };
        currentRawMarkdown = [line];
      }
    } else if (inPseudoCodeSection && currentRule && line.trim()) {
      // 继续收集当前规则的内容（多行备注等）
      currentRawMarkdown.push(line);
    }
  }

  // 保存最后一个规则（如果有）
  if (currentRule && inPseudoCodeSection) {
    currentRule.rawMarkdown = currentRawMarkdown.join('\n');
    pseudoCodeRules.push(currentRule);
    pseudoCodeRuleMap.set(currentRule.chinese, currentRule);
  }

  console.log(`加载完成: 缩写 ${abbreviationMap.size} 条, 完整翻译 ${fullTranslationMap.size} 条, 伪代码术语 ${pseudoCodeRules.length} 条`);

  return {
    abbreviationMap,
    fullTranslationMap,
    pseudoCodeRules,
    pseudoCodeRuleMap
  };
}

// ==================== comment场景规则（从xlsx加载） ====================

/**
 * 加载 comment 场景规则（comment对应场景及规则.xlsx）
 * @param {string} excelPath
 * @returns {Map<string, { comment: string, source: string, scene: string, tips: string }>}
 */
function loadCommentScenarioRules(excelPath) {
  const map = new Map();
  if (!excelPath) return map;
  if (!fs.existsSync(excelPath)) {
    throw new Error(`comment规则Excel不存在: ${excelPath}`);
  }

  const wb = XLSX.readFile(excelPath);
  const sheetName = wb.SheetNames.find(n => String(n).toLowerCase().includes('comment')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  if (!aoa || aoa.length < 2) return map;

  // 期望表头：comment, 词条来源, 场景, 翻译补充要点
  const header = (aoa[0] || []).map(x => String(x || '').trim());
  const idxComment = header.findIndex(h => h === 'comment' || h.toLowerCase() === 'comment');
  const idxSource = header.findIndex(h => h === '词条来源');
  const idxScene = header.findIndex(h => h === '场景');
  const idxTips = header.findIndex(h => h === '翻译补充要点');

  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const comment = String(row[idxComment] || '').trim();
    const source = String(row[idxSource] || '').trim();
    const scene = String(row[idxScene] || '').trim();
    const tips = String(row[idxTips] || '').trim();
    if (!comment) continue;
    map.set(comment, { comment, source, scene, tips });
  }

  return map;
}

/**
 * 将 comment 规则条目转为 markdown（用于喂给模型）
 * @param {{ comment: string, source: string, scene: string, tips: string }} rule
 * @returns {string}
 */
function formatCommentRuleToMarkdown(rule) {
  if (!rule) return '';
  const parts = [];
  parts.push(`- **comment**: \`${rule.comment}\``);
  if (rule.source) parts.push(`  - **词条来源**: ${rule.source}`);
  if (rule.scene) {
    parts.push(`  - **场景**:\n\n\`\`\`\n${rule.scene}\n\`\`\``);
  }
  if (rule.tips) {
    // tips 可能已包含 markdown（加粗/列表），直接拼接
    parts.push(`  - **翻译补充要点**:\n${rule.tips}`);
  }
  return parts.join('\n');
}

/**
 * 从 CSV 的 comment 字段提取 comment key（支持多值分隔）
 * @param {string} commentValue
 * @returns {string[]}
 */
function parseCommentKeys(commentValue) {
  const raw = String(commentValue || '').trim();
  if (!raw) return [];
  // 常见分隔符：逗号/分号/中文逗号/换行
  const keys = raw.split(/[;,，\n]+/g).map(s => s.trim()).filter(Boolean);
  // 去重但保序
  const seen = new Set();
  const out = [];
  for (const k of keys) {
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

/**
 * 为某个词条生成 comment 场景规则 markdown（可能为空）
 * @param {string} commentValue - CSV中的 comment 字段值
 * @param {Map<string, any>} commentRuleMap
 * @returns {string}
 */
function buildCommentRulesSectionMarkdown(commentValue, commentRuleMap) {
  const keys = parseCommentKeys(commentValue);
  if (keys.length === 0) return '';
  const blocks = [];
  for (const key of keys) {
    const rule = commentRuleMap && commentRuleMap.get(key);
    if (rule) {
      blocks.push(formatCommentRuleToMarkdown(rule));
    } else {
      blocks.push(`- **comment**: \`${key}\`（未在规则表中找到对应条目）`);
    }
  }
  if (blocks.length === 0) return '';
  return `## comment 场景规则（来自 comment对应场景及规则.xlsx）\n\n${blocks.join('\n\n')}\n`;
}

// ==================== 步骤3: 批量读取CSV/XLSX ====================

/**
 * 检测文件编码（简单检测：尝试UTF-8，失败则尝试GBK）
 * @param {Buffer} buffer - 文件内容Buffer
 * @returns {string} 编码类型 'utf8' 或 'gbk'
 */
function detectEncoding(buffer) {
  // 检查是否有UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return 'utf8';
  }

  // 尝试UTF-8解码，如果成功则可能是UTF-8
  try {
    const testStr = buffer.toString('utf8');
    // 检查是否包含无效的UTF-8序列（替换字符）
    if (!testStr.includes('\uFFFD')) {
      return 'utf8';
    }
  } catch (e) {
    // UTF-8解码失败
  }

  // 默认尝试GBK
  return 'gbk';
}

/**
 * 读取CSV文件（支持UTF-8和GBK编码）
 * @param {string} csvPath - CSV文件路径
 * @returns {Object} { headers, entries }
 */
function readCsvFile(csvPath) {
  console.log(`正在读取CSV文件: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`文件不存在: ${csvPath}`);
  }

  // 读取文件Buffer
  const buffer = fs.readFileSync(csvPath);
  
  // 检测编码
  const encoding = detectEncoding(buffer);
  console.log(`检测到文件编码: ${encoding}`);

  // 根据编码解码文件内容
  let content;
  if (encoding === 'utf8') {
    // 移除UTF-8 BOM（如果存在）
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      content = buffer.slice(3).toString('utf8');
    } else {
      content = buffer.toString('utf8');
    }
  } else {
    // GBK编码
    content = iconv.decode(buffer, 'gbk');
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV文件格式错误：至少需要标题行和一行数据');
  }

  // 解析标题行
  const headers = parseCsvLine(lines[0]);
  console.log(`CSV列: ${headers.join(', ')}`);

  // 解析数据行
  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || !values[0]) continue; // 跳过空行

    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    entries.push(entry);
  }

  console.log(`读取完成: ${entries.length} 条词条`);
  return { headers, entries };
}

/**
 * 读取XLSX文件
 * @param {string} xlsxPath - XLSX文件路径
 * @returns {Object} { headers, entries }
 */
function readXlsxFile(xlsxPath) {
  console.log(`正在读取XLSX文件: ${xlsxPath}`);

  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`文件不存在: ${xlsxPath}`);
  }

  // 使用XLSX库读取文件
  const workbook = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0]; // 读取第一个工作表
  const worksheet = workbook.Sheets[sheetName];

  // 方法1：尝试使用对象格式（第一行作为键）
  let jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '', // 空单元格默认值
    raw: false, // 不保留原始值，进行格式化
    blankrows: false // 跳过空行
  });

  // 如果对象格式读取成功且有数据
  if (jsonData && jsonData.length > 0) {
    // 从第一个对象提取表头
    const firstRow = jsonData[0];
    const headers = Object.keys(firstRow).map(key => String(key || '').trim());
    
    // 检查表头是否有效（不是__EMPTY等占位符，且包含常见的中文列名）
    const commonHeaders = ['id', '词条', '英文翻译', 'comment', '俄文翻译', '备注', '翻译最大长度', '备注1'];
    const hasValidHeader = headers.some(h => {
      const lowerH = h.toLowerCase();
      return commonHeaders.some(ch => lowerH.includes(ch.toLowerCase()) || ch.toLowerCase().includes(lowerH));
    });
    
    // 如果表头看起来有效，或者没有__EMPTY占位符，使用这些表头
    const hasEmptyPlaceholder = headers.some(h => h.startsWith('__EMPTY'));
    const validHeaders = hasValidHeader || !hasEmptyPlaceholder 
      ? headers.filter(h => h && !h.startsWith('__EMPTY'))
      : [];
    
    if (validHeaders.length > 0) {
      console.log(`XLSX列: ${validHeaders.join(', ')}`);
      
      // 转换为统一格式
      // 注意：不进行 trim，保持原始数据（特别是词条列的前后空格），避免修改输入数据导致更新失败
      const entries = jsonData.map(row => {
        const entry = {};
        validHeaders.forEach(header => {
          entry[header] = row[header] !== undefined && row[header] !== null 
            ? String(row[header])
            : '';
        });
        return entry;
      }).filter(entry => {
        // 过滤掉所有字段都为空的行（使用 trim 仅用于判断是否为空，不修改数据）
        return validHeaders.some(header => entry[header] && String(entry[header]).trim() !== '');
      });

      console.log(`读取完成: ${entries.length} 条词条`);
      return { headers: validHeaders, entries };
    }
  }

  // 方法2：如果对象格式失败，使用数组格式
  console.log('尝试使用数组格式读取XLSX文件...');
  const arrayData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1, // 使用数组格式
    defval: '', // 空单元格默认值
    raw: false, // 不保留原始值，进行格式化
    blankrows: false // 跳过空行
  });

  if (arrayData.length < 1) {
    throw new Error('XLSX文件格式错误：文件为空');
  }

  // 第一行作为表头
  const rawHeaders = arrayData[0] || [];
  const headers = rawHeaders.map((h, index) => {
    const str = String(h || '').trim();
    // 如果表头为空，使用默认列名
    return str || `列${index + 1}`;
  });

  // 过滤掉所有表头都为空的情况
  const validHeaders = headers.filter((h, index) => {
    // 保留非默认列名，或者至少保留前几列
    return !h.startsWith('列') || index < 10;
  });

  if (validHeaders.length === 0) {
    throw new Error('XLSX文件格式错误：无法识别表头');
  }

  console.log(`XLSX列: ${validHeaders.join(', ')}`);

  // 解析数据行（从第二行开始）
  const entries = [];
  for (let i = 1; i < arrayData.length; i++) {
    const row = arrayData[i] || [];
    // 检查是否为空行
    const isEmptyRow = row.every(cell => !cell || String(cell).trim() === '');
    if (isEmptyRow) continue;

    const entry = {};
    validHeaders.forEach((header, index) => {
      const cellValue = row[index];
      entry[header] = cellValue !== undefined && cellValue !== null 
        ? String(cellValue)
        // ? String(cellValue).trim() // 不人为修改excel所有列的空格
        : '';
    });
    
    // 只添加至少有一个非空字段的行
    const hasData = validHeaders.some(header => entry[header] && entry[header].trim() !== '');
    if (hasData) {
      entries.push(entry);
    }
  }

  console.log(`读取完成: ${entries.length} 条词条`);
  return { headers: validHeaders, entries };
}

/**
 * 读取CSV或XLSX文件（自动检测文件类型）
 * @param {string} filePath - 文件路径
 * @returns {Object} { headers, entries }
 */
function readCsvOrXlsxFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.xlsx' || ext === '.xls') {
    return readXlsxFile(filePath);
  } else if (ext === '.csv') {
    return readCsvFile(filePath);
  } else {
    // 尝试根据文件内容自动检测
    const buffer = fs.readFileSync(filePath);
    // 检查是否是XLSX文件（XLSX文件以PK开头，是ZIP格式）
    if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
      console.log('检测到XLSX格式（通过文件头）');
      return readXlsxFile(filePath);
    } else {
      // 默认按CSV处理
      console.log('未指定扩展名，按CSV格式处理');
      return readCsvFile(filePath);
    }
  }
}

/**
 * 解析CSV行（处理引号和逗号）
 * @param {string} line - CSV行
 * @returns {Array} 字段数组
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义的引号
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // 添加最后一个字段
  result.push(current);

  return result;
}

// ==================== 步骤4: AI翻译 ====================

/**
 * 识别占位符
 * @param {string} text - 文本
 * @returns {Array} 占位符数组
 */
function extractPlaceholders(text) {
  const placeholders = [];
  const usedIndices = new Set(); // 记录已使用的索引，避免重复匹配

  // 统一识别“真正的占位符”：花括号占位符（{}、{:.3f} 等），不关心外层是 [] / 【】/空格/连字符等样式
  // 允许 :.数字 等格式
  const curlyMatches = text.matchAll(/\{([:\d\.a-zA-Z]*)\}/g);
  for (const match of curlyMatches) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    // 防止重复
    let isUsed = false;
    for (let i = startIndex; i < endIndex; i++) {
      if (usedIndices.has(i)) {
        isUsed = true;
        break;
      }
    }
    if (!isUsed) {
      placeholders.push({
        type: 'curly',
        original: match[0],
        content: match[1] || '',
        index: startIndex
      });
      for (let i = startIndex; i < endIndex; i++) {
        usedIndices.add(i);
      }
    }
  }

  // 匹配 %1, %2 等格式
  const percentMatches = text.matchAll(/%(\d+)/g);
  for (const match of percentMatches) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    // 检查是否已被使用
    let isUsed = false;
    for (let i = startIndex; i < endIndex; i++) {
      if (usedIndices.has(i)) {
        isUsed = true;
        break;
      }
    }
    if (!isUsed) {
      placeholders.push({
        type: 'percent',
        original: match[0],
        content: match[1],
        index: startIndex
      });
      // 标记为已使用
      for (let i = startIndex; i < endIndex; i++) {
        usedIndices.add(i);
      }
    }
  }

  // 按索引排序
  placeholders.sort((a, b) => a.index - b.index);

  return placeholders;
}

/**
 * 将不可区分占位符替换为带编号的临时token，避免大模型“看不出差异而换序”
 * 仅处理：{}、[{}]（以及其无格式版本）；%1/%2 等可区分占位符不在此列
 *
 * @param {string} entryText
 * @returns {{ protectedText: string, tokenReplacements: Array<{token: string, original: string}>, tokenOrder: string[] }}
 */
function protectUndistinguishablePlaceholders(entryText) {
  const text = String(entryText || '');
  const tokenReplacements = [];
  const tokenOrder = [];

  // 关键：逐个保护“真正的占位符”花括号（{}、{:.3f}等），不关心外层是 [] / 【】/空格等样式
  // 这样可以强制约束：无论写成 [{}]、[ {} ]、[{}-{}]、【 {} 】，里面每一个 {} 的顺序都不能变
  let protectedText = text;
  // 重要：为 token 加“显式边界”，避免出现 __PH_CURLY_1____PH_CURLY_2__ 这种相邻 token 被模型吞掉/合并/改写
  // 说明：
  // - innerToken 用于存储顺序（tokenOrder）与匹配/还原
  // - wrappedToken 是真正送进模型的文本，带左右边界符
  // - 边界符选择 ⟦ ⟧（相对少见，且不易被模型改写成别的符号）；后续还原时会同时支持无边界形式兜底
  protectedText = protectedText.replace(/\{([:\d\.a-zA-Z]*)\}/g, (full) => {
    const innerToken = `__PH_CURLY_${tokenReplacements.length}__`;
    const wrappedToken = `⟦${innerToken}⟧`;
    tokenReplacements.push({ token: innerToken, wrappedToken, original: full }); // 保留原始形式（含格式化）
    tokenOrder.push(innerToken);
    return wrappedToken;
  });

  return { protectedText, tokenReplacements, tokenOrder };
}

/**
 * 还原 protectUndistinguishablePlaceholders 生成的token
 * @param {string} translatedText
 * @param {Array<{token: string, original: string}>} tokenReplacements
 * @returns {string}
 */
function restoreUndistinguishablePlaceholders(translatedText, tokenReplacements) {
  let text = String(translatedText || '');
  for (const item of tokenReplacements || []) {
    const token = item && item.token;
    const wrappedToken = item && item.wrappedToken;
    const original = item && item.original;
    if (!token || !original) continue;

    // 使用全局替换，避免token残留
    // 先替换带边界的版本（新逻辑），再兜底替换裸 token（兼容历史输出或模型吞掉边界符的情况）
    if (wrappedToken) {
      text = text.split(wrappedToken).join(original);
    }
    text = text.split(token).join(original);
  }
  return text;
}

/**
 * 校验不可区分占位符token是否被换序/丢失/重复
 * @param {string} translatedText - 仍包含token的译文
 * @param {string[]} tokenOrder - 原文token顺序
 * @returns {{ isValid: boolean, issues: string[] }}
 */
function validateUndistinguishableTokenOrder(translatedText, tokenOrder) {
  const issues = [];
  const text = String(translatedText || '');
  const tokens = Array.isArray(tokenOrder) ? tokenOrder : [];

  // 逐个检查token是否存在且只出现一次
  const positions = [];
  for (const token of tokens) {
    // 新逻辑：优先找带边界的 token；若模型吞掉边界符，则回退找裸 token
    const wrapped = `⟦${token}⟧`;
    let first = text.indexOf(wrapped);
    let needle = wrapped;
    if (first === -1) {
      first = text.indexOf(token);
      needle = token;
    }
    if (first === -1) {
      issues.push(`不可区分占位符丢失或被改写: ${token}`);
      continue;
    }
    const second = text.indexOf(needle, first + needle.length);
    if (second !== -1) {
      issues.push(`不可区分占位符重复: ${token}`);
      continue;
    }
    positions.push({ token, pos: first });
  }

  // 顺序检查：位置必须按 tokenOrder 递增
  let lastPos = -1;
  for (const token of tokens) {
    const found = positions.find(p => p.token === token);
    if (!found) continue;
    if (found.pos < lastPos) {
      issues.push('不可区分占位符顺序发生变化（禁止）');
      break;
    }
    lastPos = found.pos;
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * 翻译后轻量后处理：修正机翻常见格式问题（不改变语义）
 * - 修正文件后缀空格：*. scd → *.scd
 *
 * @param {string} translatedText
 * @returns {{ text: string, issues: string[] }}
 */
function postprocessTranslation(translatedText) {
  let text = String(translatedText || '');
  const issues = [];

  // 规范化中文方括号/书名号到英文方括号（主要用于占位符组合，如 【{}-{}】 → [{}-{}]）
  // 仅做符号替换，不触碰 {} 本体
  if (/[【】]/.test(text)) {
    const beforeBracket = text;
    text = text.replace(/【/g, '[').replace(/】/g, ']');
    if (text !== beforeBracket) {
      issues.push('已将中文括号【】规范化为英文[]（用于占位符组合等）');
    }
  }

  // 修正 *. ext → *.ext（仅处理星号点号后的空格）
  const before = text;
  text = text.replace(/\*\.\s+([A-Za-z0-9]+)/g, '*.$1');
  if (text !== before) {
    issues.push('已修正文件后缀点号后的空格（如 "*. scd" → "*.scd"）');
  }

  return { text, issues };
}

/**
 * 针对“单位兆/单位兆:M”等中文不规范表述的专项处理：
 * - 备注：提示中文应为“单位：M”或“单位：兆”
 * - 英文：统一强制为 unit: M（不使用 Megabytes / (in megabytes)）
 *
 * @param {string} originalChinese
 * @param {string} translatedText
 * @returns {{ text: string, issues: string[] }}
 */
function postprocessUnitZhao(originalChinese, translatedText) {
  const issues = [];
  let text = String(translatedText || '');
  const cn = String(originalChinese || '');

  if (!/单位\s*兆/.test(cn)) {
    return { text, issues };
  }

  // 备注建议（由调用方写入备注1）；这里仅返回可用信息
  issues.push('检测到中文不规范: “单位兆”建议改为“单位：M”或“单位：兆”；英文统一为 unit: M');

  // 把 Megabytes / in megabytes 等统一为 M
  const before = text;
  text = text
    .replace(/\(\s*in\s+megabytes\s*\)/ig, '(unit: M)')
    .replace(/\bunit\s*:\s*megabytes\s*:\s*m\b/ig, 'unit: M')
    .replace(/\bunit\s*:\s*m\s*:\s*m\b/ig, 'unit: M')
    .replace(/\bunit\s*:\s*megabytes\b/ig, 'unit: M')
    .replace(/\bmegabytes\b/ig, 'M'); // 兜底：避免残留 Megabytes

  if (text !== before) {
    issues.push('已将译文中的 Megabytes/(in megabytes) 归一为 unit: M');
  }

  return { text, issues };
}

/**
 * 构建AI翻译prompt
 * @param {string} entryText - 词条文本
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @param {Object} options - 可选参数
 * @param {string} options.commentRulesMarkdown - comment规则markdown
 * @param {Map} options.pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {string} prompt
 */
function buildTranslationPrompt(entryText, abbreviationMap, fullTranslationMap, options = {}) {
  // 查找相关术语库条目
  const relatedTerms = [];

  // 在缩写映射中查找
  for (const [chinese, english] of abbreviationMap.entries()) {
    if (entryText.includes(chinese)) {
      relatedTerms.push(`- ${chinese} → ${english}`);
    }
  }

  // 在完整翻译映射中查找
  for (const [chinese, english] of fullTranslationMap.entries()) {
    if (entryText.includes(chinese) && !relatedTerms.some(t => t.includes(chinese))) {
      relatedTerms.push(`- ${chinese} → ${english}`);
    }
  }

  // 检测并注入伪代码术语说明
  const pseudoCodeRuleMap = options && options.pseudoCodeRuleMap;
  const matchedPseudoCodeRules = [];
  if (pseudoCodeRuleMap) {
    for (const [chinese, rule] of pseudoCodeRuleMap.entries()) {
      if (entryText.includes(chinese)) {
        matchedPseudoCodeRules.push(rule.rawMarkdown);
      }
    }
  }

  const template = loadPromptTemplate('single');
  const relatedTermsSection = relatedTerms.length > 0
    ? `## 相关术语库条目\n${relatedTerms.join('\n')}\n`
    : '';
  const commentRulesSection = options && options.commentRulesMarkdown
    ? String(options.commentRulesMarkdown)
    : '';
  const pseudoCodeTermsSection = matchedPseudoCodeRules.length > 0
    ? `## 伪代码术语说明\n\n以下术语为伪代码术语，必须严格按照指定翻译：\n\n${matchedPseudoCodeRules.join('\n')}\n`
    : '';

  return renderTemplate(template, {
    RELATED_TERMS_SECTION: relatedTermsSection,
    COMMENT_RULES_SECTION: commentRulesSection,
    PSEUDOCODE_TERMS_SECTION: pseudoCodeTermsSection,
    ENTRY_TEXT: String(entryText || '')
  });
}

// ==================== API配置 ====================

const API_CONFIG = {
  claude: {
    apiKey: 'sk-0f392632fabc3f7bc50ad6c207bbca5372a6bf00901fcf2653c84afe231dd11c',
    baseURL: 'https://api.anthropic.com/v1/messages',
    enabled: true
  },
  gemini: {
    apiKey: 'AIzaSyC2w5jfhNhm3kWvxgOilXpGjrgvbp_nanY',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', // 使用gemini-1.5-flash，免费且翻译效果好
    enabled: true
  },
  opencode: {
    apiKey: 'sk-fOITPTjydt03vTzz5HK4pFDK1fppmMEM0gSPsI6nRuJhYgpKxQIqofcTJqAOfUea',
    baseURL: 'https://api.openai.com/v1/chat/completions', // OpenAI兼容API
    enabled: true
  },
  zhipu: {
    apiKey: '11a66253030e43af9dea84d3e47c7deb.ozwFwnzqtewRCNgn',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    enabled: true
  }
};

// ==================== API调用函数 ====================

/**
 * 调用Claude API
 * @param {string} prompt - 翻译prompt
 * @returns {Promise<string>} 翻译结果
 */
async function callClaudeAPI(prompt) {
  try {
    const response = await axios.post(
      API_CONFIG.claude.baseURL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.claude.apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.content && response.data.content[0]) {
      return response.data.content[0].text.trim();
    }
    throw new Error('Claude API返回格式异常');
  } catch (error) {
    throw new Error(`Claude API调用失败: ${error.message}`);
  }
}

/**
 * 调用Gemini API
 * @param {string} prompt - 翻译prompt
 * @returns {Promise<string>} 翻译结果
 */
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      `${API_CONFIG.gemini.baseURL}?key=${API_CONFIG.gemini.apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const content = response.data.candidates[0].content;
      if (content && content.parts && content.parts[0]) {
        return content.parts[0].text.trim();
      }
    }
    throw new Error('Gemini API返回格式异常');
  } catch (error) {
    throw new Error(`Gemini API调用失败: ${error.message}`);
  }
}

/**
 * 调用Opencode API (OpenAI兼容)
 * @param {string} prompt - 翻译prompt
 * @returns {Promise<string>} 翻译结果
 */
async function callOpencodeAPI(prompt) {
  try {
    const response = await axios.post(
      API_CONFIG.opencode.baseURL,
      {
        model: 'gpt-4o-mini', // 使用gpt-4o-mini，免费且翻译效果更好
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手。请根据翻译规则将中文词条翻译成英文。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.opencode.apiKey}`
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('Opencode API返回格式异常');
  } catch (error) {
    throw new Error(`Opencode API调用失败: ${error.message}`);
  }
}

/**
 * 调用智谱API
 * @param {string} prompt - 翻译prompt
 * @returns {Promise<string>} 翻译结果
 */
async function callZhipuAPI(prompt) {
  try {
    // 智谱API需要JWT token，这里简化处理，直接使用apiKey
    const response = await axios.post(
      API_CONFIG.zhipu.baseURL,
      {
        model: 'glm-4-flash', // 使用glm-4-flash，免费版本，速度快且翻译效果好
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手。请根据翻译规则将中文词条翻译成英文。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.zhipu.apiKey}`
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('智谱API返回格式异常');
  } catch (error) {
    throw new Error(`智谱API调用失败: ${error.message}`);
  }
}

/**
 * 对"已保护token"的单条词条进行强约束重试翻译：
 * - 输入文本可能包含 ⟦__PH_CURLY_n__⟧ token，必须原样保留且保序
 *
 * @param {string} protectedEntryText - 已包含token边界的文本（例如 ⟦__PH_CURLY_0__⟧）
 * @param {Map} abbreviationMap
 * @param {Map} fullTranslationMap
 * @param {Object} options - 可选参数
 * @param {string} options.commentRulesMarkdown - comment规则markdown
 * @param {Map} options.pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {Promise<string>}
 */
async function translateProtectedEntryStrict(protectedEntryText, abbreviationMap, fullTranslationMap, options = {}) {
  const prompt = buildTranslationPrompt(protectedEntryText, abbreviationMap, fullTranslationMap, options);
  // 单条重试优先走Claude（最高优先级），失败再走其他API兜底
  const apis = [
    { name: '智谱', fn: callZhipuAPI, enabled: API_CONFIG.zhipu.enabled },
    { name: 'Claude', fn: callClaudeAPI, enabled: API_CONFIG.claude.enabled },
    { name: 'Gemini', fn: callGeminiAPI, enabled: API_CONFIG.gemini.enabled },
    { name: 'Opencode', fn: callOpencodeAPI, enabled: API_CONFIG.opencode.enabled },
  ];

  const errors = [];
  for (const api of apis) {
    if (!api.enabled) continue;
    try {
      return await api.fn(prompt);
    } catch (err) {
      errors.push(`${api.name}: ${err && err.message ? err.message : String(err)}`);
    }
  }
  throw new Error(`单条重试失败（所有API都失败）: ${errors.join('; ')}`);
}

/**
 * 构建批量翻译prompt
 * @param {Array} entries - 词条数组，每个元素包含 {index, text, placeholders}
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @param {Map} pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {string} prompt
 */
function buildBatchTranslationPrompt(entries, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap) {
  // 收集所有相关术语（缩写优先，去重）
  const relatedTermsSet = new Set();
  const abbreviationTerms = new Set();

  for (const entry of entries) {
    // 先收集缩写术语
    for (const [chinese, english] of abbreviationMap.entries()) {
      if (entry.text.includes(chinese)) {
        const term = `${chinese} → ${english}`;
        relatedTermsSet.add(term);
        abbreviationTerms.add(chinese);
      }
    }
    // 再收集完整翻译术语（排除已在缩写中的）
    for (const [chinese, english] of fullTranslationMap.entries()) {
      if (entry.text.includes(chinese) && !abbreviationTerms.has(chinese)) {
        relatedTermsSet.add(`${chinese} → ${english}`);
      }
    }
  }

  // 检测并注入伪代码术语说明
  const matchedPseudoCodeRules = new Set();
  if (pseudoCodeRuleMap) {
    for (const entry of entries) {
      for (const [chinese, rule] of pseudoCodeRuleMap.entries()) {
        if (entry.text.includes(chinese)) {
          matchedPseudoCodeRules.add(rule.rawMarkdown);
        }
      }
    }
  }

  const template = loadPromptTemplate('batch');
  const relatedTermsSection = relatedTermsSet.size > 0
    ? `## 相关术语库条目\n${Array.from(relatedTermsSet).map(t => `- ${t}`).join('\n')}\n`
    : '';
  const pseudoCodeTermsSection = matchedPseudoCodeRules.size > 0
    ? `## 伪代码术语说明\n\n以下术语为伪代码术语，必须严格按照指定翻译：\n\n${Array.from(matchedPseudoCodeRules).join('\n')}\n`
    : '';

  const entryList = entries.map((e, idx) => `${idx + 1}. ${e.text}`).join('\n');

  // comment 场景规则（按序号对照，避免污染"序号. 译文"输出格式）
  const commentRuleBlocks = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i] || {};
    const commentValue = e.comment;
    const commentRulesMarkdown = e.commentRulesMarkdown;
    if (!commentValue && !commentRulesMarkdown) continue;
    const block = [
      `- **序号**: ${i + 1}`,
      commentValue ? `  - **comment**: \`${String(commentValue).trim()}\`` : null,
      commentRulesMarkdown ? `  - **规则**:\n\n${String(commentRulesMarkdown).trim()}` : null
    ].filter(Boolean).join('\n');
    commentRuleBlocks.push(block);
  }
  const commentRulesBatchSection = commentRuleBlocks.length > 0
    ? `## comment 场景规则（仅对带 comment 的词条生效）\n\n${commentRuleBlocks.join('\n\n')}\n`
    : '';

  return renderTemplate(template, {
    RELATED_TERMS_SECTION: relatedTermsSection,
    PSEUDOCODE_TERMS_SECTION: pseudoCodeTermsSection,
    COMMENT_RULES_BATCH_SECTION: commentRulesBatchSection,
    ENTRY_LIST: entryList
  });
}

/**
 * 解析批量翻译结果
 * @param {string} responseText - API返回的文本
 * @param {number} expectedCount - 期望的词条数量
 * @returns {Array<string>} 翻译结果数组
 */
function parseBatchTranslationResponse(responseText, expectedCount) {
  const results = [];
  const lines = responseText.split('\n').filter(line => line.trim());

  // 尝试按序号解析（格式：1. 翻译内容 或 1.翻译内容）
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // 匹配序号开头的行
    const match = line.match(/^\d+[\.、]\s*(.+)$/);
    if (match) {
      // results.push(match[1].trim());
      results.push(match[1]);// 不trim，保留原始空格
    } else if (line && !line.match(/^##|^翻译|^要求|^词条|^相关/)) {
      // 如果不是标题行，也作为翻译结果
      results.push(line);
    }
  }

  // 如果解析结果数量不对，尝试其他方式
  if (results.length !== expectedCount) {
    // 尝试按行分割，每行一个翻译
    const simpleResults = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.match(/^##|^翻译|^要求|^词条|^相关|^\d+[\.、]/);
    });

    if (simpleResults.length === expectedCount) {
      return simpleResults;
    }

    // 如果还是不对，返回前expectedCount个结果
    if (simpleResults.length > expectedCount) {
      return simpleResults.slice(0, expectedCount);
    }
  }

  return results;
}

/**
 * 批量调用Claude API
 * @param {string} prompt - 翻译prompt
 * @param {number} expectedCount - 期望的翻译数量
 * @returns {Promise<Array<string>>} 翻译结果数组
 */
async function callClaudeAPIBatch(prompt, expectedCount) {
  try {
    const response = await axios.post(
      API_CONFIG.claude.baseURL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.claude.apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 60000
      }
    );

    if (response.data && response.data.content && response.data.content[0]) {
      const text = response.data.content[0].text.trim();
      return parseBatchTranslationResponse(text, expectedCount);
    }
    throw new Error('Claude API返回格式异常');
  } catch (error) {
    throw new Error(`Claude API调用失败: ${error.message}`);
  }
}

/**
 * 批量调用Gemini API
 * @param {string} prompt - 翻译prompt
 * @param {number} expectedCount - 期望的翻译数量
 * @returns {Promise<Array<string>>} 翻译结果数组
 */
async function callGeminiAPIBatch(prompt, expectedCount) {
  try {
    const response = await axios.post(
      `${API_CONFIG.gemini.baseURL}?key=${API_CONFIG.gemini.apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const content = response.data.candidates[0].content;
      if (content && content.parts && content.parts[0]) {
        const text = content.parts[0].text.trim();
        return parseBatchTranslationResponse(text, expectedCount);
      }
    }
    throw new Error('Gemini API返回格式异常');
  } catch (error) {
    throw new Error(`Gemini API调用失败: ${error.message}`);
  }
}

/**
 * 批量调用Opencode API
 * @param {string} prompt - 翻译prompt
 * @param {number} expectedCount - 期望的翻译数量
 * @returns {Promise<Array<string>>} 翻译结果数组
 */
async function callOpencodeAPIBatch(prompt, expectedCount) {
  try {
    const response = await axios.post(
      API_CONFIG.opencode.baseURL,
      {
        model: 'gpt-4o-mini', // 使用gpt-4o-mini，免费且翻译效果更好
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手。请根据翻译规则将中文词条批量翻译成英文。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.opencode.apiKey}`
        },
        timeout: 60000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      const text = response.data.choices[0].message.content.trim();
      return parseBatchTranslationResponse(text, expectedCount);
    }
    throw new Error('Opencode API返回格式异常');
  } catch (error) {
    throw new Error(`Opencode API调用失败: ${error.message}`);
  }
}

/**
 * 批量调用智谱API
 * @param {string} prompt - 翻译prompt
 * @param {number} expectedCount - 期望的翻译数量
 * @returns {Promise<Array<string>>} 翻译结果数组
 */
async function callZhipuAPIBatch(prompt, expectedCount) {
  try {
    const response = await axios.post(
      API_CONFIG.zhipu.baseURL,
      {
        model: 'glm-4-flash', // 使用glm-4-flash，免费版本，速度快且翻译效果好
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手。请根据翻译规则将中文词条批量翻译成英文。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.zhipu.apiKey}`
        },
        timeout: 60000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      const text = response.data.choices[0].message.content.trim();
      return parseBatchTranslationResponse(text, expectedCount);
    }
    throw new Error('智谱API返回格式异常');
  } catch (error) {
    throw new Error(`智谱API调用失败: ${error.message}`);
  }
}

/**
 * 批量AI翻译（支持多个API，按优先级fallback）
 * @param {Array} entries - 词条数组，每个元素包含 {index, text, placeholders}
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @param {Map} pseudoCodeRuleMap - 伪代码术语映射表
 * @returns {Promise<Array<string>>} 英文翻译数组
 */
async function translateBatch(entries, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap) {
  if (entries.length === 0) {
    return [];
  }

  // 构建批量prompt
  const prompt = buildBatchTranslationPrompt(entries, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap);

  // 按优先级尝试不同的API（Claude优先级最高）
  const apis = [
    // 要花钱的，先不开！// { name: 'Claude', fn: callClaudeAPIBatch, enabled: API_CONFIG.claude.enabled },
    { name: '智谱', fn: callZhipuAPIBatch, enabled: API_CONFIG.zhipu.enabled },
    { name: 'Gemini', fn: callGeminiAPIBatch, enabled: API_CONFIG.gemini.enabled },
    { name: 'Opencode', fn: callOpencodeAPIBatch, enabled: API_CONFIG.opencode.enabled },
  ];

  const errors = [];

  for (const api of apis) {
    if (!api.enabled) {
      continue;
    }

    try {
      console.log(`  尝试使用 ${api.name} API批量翻译 ${entries.length} 条词条...`);
      const results = await api.fn(prompt, entries.length);

      // 验证结果数量
      if (results.length !== entries.length) {
        console.log(`  ⚠️  ${api.name} API返回结果数量不匹配: 期望 ${entries.length}, 实际 ${results.length}`);
        // 如果数量不匹配，尝试补齐或截断
        if (results.length < entries.length) {
          // 补齐空字符串
          while (results.length < entries.length) {
            results.push('');
          }
        } else {
          // 截断
          results.splice(entries.length);
        }
      }

      console.log(`  ✅ ${api.name} API批量翻译成功`);
      return results;
    } catch (error) {
      console.log(`  ❌ ${api.name} API失败: ${error.message}`);
      errors.push(`${api.name}: ${error.message}`);
      // 继续尝试下一个API
    }
  }

  // 所有API都失败
  throw new Error(`所有API都失败: ${errors.join('; ')}`);
}

/**
 * 单个词条翻译（保留用于兼容）
 * @param {string} entryText - 词条文本
 * @param {Map} abbreviationMap - 缩写映射表
 * @param {Map} fullTranslationMap - 完整翻译映射表
 * @returns {Promise<string>} 英文翻译
 */
async function translateEntry(entryText, abbreviationMap, fullTranslationMap) {
  const results = await translateBatch(
    [{ index: 0, text: entryText, placeholders: extractPlaceholders(entryText) }],
    abbreviationMap,
    fullTranslationMap
  );
  return results[0] || '';
}

// ==================== 步骤5: 中文规范性检查 ====================

/**
 * 单位字段的规则化识别与翻译兜底
 * - 标准：单位：xx / 单位: xx  → unit: xx
 * - 常见不规范：
 *   - 单位兆            → 备注提示应为“单位：兆”，翻译 unit: 兆
 *   - 单位兆：M / 单位兆:M → 备注提示应为“单位：M”或“单位：兆”，翻译 unit: M
 *
 * @param {string} entryText
 * @returns {{ forcedTranslation: string|null, note1Issues: string[] }}
 */
function normalizeUnitTranslation(entryText) {
  // const text = String(entryText || '').trim();
  const text = String(entryText || '');// 不trim，保留原始空格
  const note1Issues = [];

  // 标准写法：单位：xx
  const standardMatch = text.match(/^单位\s*[:：]\s*(.+)\s*$/);
  if (standardMatch) {
    const unitValue = standardMatch[1].trim();
    if (unitValue) {
      return { forcedTranslation: `unit: ${unitValue}`, note1Issues };
    }
  }

  // 不规范：单位兆：M（单位 + 中文单位名 + 冒号 + 值）
  const nonStandardWithValue = text.match(/^单位\s*([^\s:：]+)\s*[:：]\s*(.+)\s*$/);
  if (nonStandardWithValue) {
    const unitName = nonStandardWithValue[1].trim();
    const unitValue = nonStandardWithValue[2].trim();
    if (unitName) {
      note1Issues.push(`中文不规范: 中文描述有误，应为单位：${unitValue || unitName}或单位：${unitName}`);
      return { forcedTranslation: `unit: ${unitValue || unitName}`, note1Issues };
    }
  }

  // 不规范：单位兆（无冒号）
  const nonStandardNoColon = text.match(/^单位\s*([^\s:：]+)\s*$/);
  if (nonStandardNoColon) {
    const unitName = nonStandardNoColon[1].trim();
    if (unitName) {
      note1Issues.push(`中文不规范: 中文描述有误，应为单位：${unitName}`);
      return { forcedTranslation: `unit: ${unitName}`, note1Issues };
    }
  }

  return { forcedTranslation: null, note1Issues };
}

/**
 * 检查中文规范性
 * @param {string} entryText - 词条文本
 * @returns {Object} { isValid: boolean, issues: string[] }
 */
function validateChinese(entryText) {
  const issues = [];

  // 检查混用中英文标点（更严格的检查）
  const hasChinesePunctuation = /[，。：；！？、]/.test(entryText);
  const hasEnglishPunctuation = /[,.:;!?]/.test(entryText);
  if (hasChinesePunctuation && hasEnglishPunctuation) {
    // 检查是否在同一位置混用（更严格的检查）
    const chinesePunctPositions = [];
    const englishPunctPositions = [];

    entryText.split('').forEach((char, index) => {
      if (/[，。：；！？、]/.test(char)) {
        chinesePunctPositions.push(index);
      }
      if (/[,.:;!?]/.test(char)) {
        englishPunctPositions.push(index);
      }
    });

    // 如果中英文标点位置接近（相差不超过5个字符），认为是混用
    let mixed = false;
    for (const cp of chinesePunctPositions) {
      for (const ep of englishPunctPositions) {
        if (Math.abs(cp - ep) <= 5) {
          mixed = true;
          break;
        }
      }
      if (mixed) break;
    }

    if (mixed) {
      issues.push('混用中英文标点');
    }
  }

  // 检查多余空格（前后）
  if (entryText.trim() !== entryText) {
    issues.push('词条前后有多余空格');
  }

  // 检查中间多余空格（连续两个以上空格）
  if (/\s{2,}/.test(entryText)) {
    issues.push('词条中间有多余空格');
  }

  // 检查占位符格式错误（{:.3f}等格式是有效的，不需要检查）
  // 占位符格式检查已移除，因为{:.3f}、{}、%1等都是有效格式

  return {
    isValid: issues.length === 0,
    issues
  };
}

// ==================== 步骤6: 翻译结果验证 ====================

/**
 * 验证翻译结果
 * @param {string} originalText - 原始文本
 * @param {string} translatedText - 翻译文本
 * @param {Array} placeholders - 占位符数组
 * @returns {Object} { isValid: boolean, issues: string[] }
 */
function validateTranslation(originalText, translatedText, placeholders) {
  const issues = [];

  // 检查占位符是否被保护
  for (const placeholder of placeholders) {
    if (!translatedText.includes(placeholder.original)) {
      issues.push(`占位符丢失: ${placeholder.original}`);
    }
  }

  // 检查翻译是否为空
  if (!translatedText || translatedText.trim() === '') {
    issues.push('翻译结果为空');
  }

  // 校验 %x 格式是否被破坏（允许换序，但禁止 % 1 / % 2 这种）
  if (/%\s+\d+/.test(translatedText)) {
    issues.push('可区分占位符格式被破坏（禁止 "% 1" 这种写法）');
  }

  // 检查 [] 内部的占位符组合格式是否被加空格破坏（例如 [ {} - {} ]）
  if (/\[\s+\{/.test(translatedText) || /\}\s+\]/.test(translatedText)) {
    issues.push('方括号占位符格式被破坏（禁止 "[{ }]" 或 "[ {} ]" 这种写法）');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// ==================== 步骤7: 写入CSV ====================

/**
 * 若目标文件被占用（Windows/WPS常见 EBUSY/EPERM），自动生成一个不冲突的备用路径
 * @param {string} originalPath
 * @returns {string}
 */
function buildAvailableOutputPath(originalPath) {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);

  // 优先使用 _new，其次 _new2, _new3...
  let candidate = path.join(dir, `${base}_new${ext}`);
  if (!fs.existsSync(candidate)) return candidate;

  for (let i = 2; i <= 50; i++) {
    candidate = path.join(dir, `${base}_new${i}${ext}`);
    if (!fs.existsSync(candidate)) return candidate;
  }

  // 最后兜底：时间戳
  return path.join(dir, `${base}_${Date.now()}${ext}`);
}

/**
 * 写文件（带重试 + 被占用时自动换名）
 * @param {string} outputPath
 * @param {string} content
 * @param {number} retries
 */
function writeTextFileWithRetryAndFallback(outputPath, content, retries = 3) {
  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      fs.writeFileSync(outputPath, content, 'utf8');
      return outputPath;
    } catch (err) {
      lastErr = err;
      const code = err && err.code;
      if (code === 'EBUSY' || code === 'EPERM') {
        // 简单等待后重试（同步 sleep）
        const waitMs = 400 * attempt;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
        continue;
      }
      throw err;
    }
  }

  // 仍失败：换名输出
  if (lastErr && (lastErr.code === 'EBUSY' || lastErr.code === 'EPERM')) {
    const fallbackPath = buildAvailableOutputPath(outputPath);
    fs.writeFileSync(fallbackPath, content, 'utf8');
    return fallbackPath;
  }

  throw lastErr;
}

/**
 * 写入CSV文件（UTF-8 BOM编码）
 * @param {string} outputPath - 输出文件路径
 * @param {Array} headers - 标题数组
 * @param {Array} rows - 数据行数组
 */
function writeCsvFile(outputPath, headers, rows) {
  console.log(`正在写入CSV文件: ${outputPath}`);

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 构建CSV内容
  let csvContent = '';

  // 写入标题行
  csvContent += headers.map(h => escapeCsvField(h)).join(',') + '\n';

  // 写入数据行
  for (const row of rows) {
    const values = headers.map(header => row[header] || '');
    csvContent += values.map(v => escapeCsvField(v)).join(',') + '\n';
  }

  // 写入UTF-8 BOM编码的文件
  const BOM = '\uFEFF';
  const actualPath = writeTextFileWithRetryAndFallback(outputPath, BOM + csvContent, 3);

  if (actualPath !== outputPath) {
    console.warn(`CSV目标文件被占用，已改为写入: ${actualPath}`);
  }
  console.log(`CSV文件写入完成: ${actualPath}`);
}

/**
 * 生成WPS/Excel友好的预览文件（XLSX），用于设置列宽等样式
 * 注意：CSV格式本身不支持列宽；因此通过额外生成xlsx实现“打开即有列宽”。
 *
 * @param {string} xlsxPath - 输出xlsx文件路径
 * @param {Array} headers - 标题数组
 * @param {Array} rows - 数据行数组
 * @param {Object} options
 * @param {Object<string, number>} options.columnWidthConfig - 列宽配置（以字符宽度 wch 计）
 * @param {number} options.defaultWidth - 未配置列的默认宽度
 */
function writeXlsxPreviewFile(xlsxPath, headers, rows, options = {}) {
  const columnWidthConfig = options.columnWidthConfig || {};
  const defaultWidth = Number.isFinite(options.defaultWidth) ? options.defaultWidth : 20;

  console.log(`正在写入XLSX预览文件: ${xlsxPath}`);

  // 确保输出目录存在
  const outputDir = path.dirname(xlsxPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 组装二维数组：第一行headers，后续为数据
  const aoa = [headers];
  for (const row of rows) {
    aoa.push(headers.map((header) => (row && row[header] !== undefined && row[header] !== null) ? String(row[header]) : ''));
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 设置全表单元格样式：顶端对齐、左对齐（便于WPS预览）
  // 注意：xlsx 的样式依赖于写入库能力；当前项目使用 xlsx，在WPS/Excel中一般可生效
  const cellAlignmentStyle = { alignment: { vertical: 'top', horizontal: 'left', wrapText: true } };
  const range = XLSX.utils.decode_range(ws['!ref'] || `A1:A1`);
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellAddress];
      if (!cell) continue;
      cell.s = cell.s || {};
      cell.s.alignment = { ...(cell.s.alignment || {}), ...cellAlignmentStyle.alignment };
    }
  }

  // 设置列宽（wch: 字符宽度），便于在WPS中打开时呈现更友好的样式
  ws['!cols'] = headers.map((h) => {
    const width = columnWidthConfig[h];
    const wch = Number.isFinite(width) ? width : defaultWidth;
    return { wch };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  let actualPath = xlsxPath;
  try {
    XLSX.writeFile(wb, xlsxPath);
  } catch (err) {
    if (err && (err.code === 'EBUSY' || err.code === 'EPERM')) {
      actualPath = buildAvailableOutputPath(xlsxPath);
      XLSX.writeFile(wb, actualPath);
      console.warn(`XLSX目标文件被占用，已改为写入: ${actualPath}`);
    } else {
      throw err;
    }
  }
  console.log(`XLSX预览文件写入完成: ${actualPath}`);
}

/**
 * 转义CSV字段
 * @param {string} field - 字段值
 * @returns {string} 转义后的字段
 */
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);

  // 如果包含逗号、引号或换行符，需要用引号包裹
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // 转义引号：将 " 替换为 ""
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

// ==================== 步骤8: 记录错误 ====================

/**
 * 记录错误日志
 * @param {string} outputDir - 输出目录
 * @param {string} filename - 文件名（不含扩展名）
 * @param {Array} errors - 错误数组
 */
function logErrors(outputDir, filename, errors) {
  if (errors.length === 0) {
    console.log('没有错误需要记录');
    return;
  }

  const logPath = path.join(outputDir, `${filename}_errors.log`);

  let logContent = `翻译错误日志\n`;
  logContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  logContent += `总错误数: ${errors.length}\n\n`;

  // 按类型分组
  const byType = {
    translation: [],
    chinese: [],
    validation: []
  };

  for (const error of errors) {
    if (error.type === 'translation') {
      byType.translation.push(error);
    } else if (error.type === 'chinese') {
      byType.chinese.push(error);
    } else if (error.type === 'validation') {
      byType.validation.push(error);
    }
  }

  // 写入错误详情
  if (byType.translation.length > 0) {
    logContent += `\n## 翻译失败 (${byType.translation.length}条)\n\n`;
    for (const error of byType.translation) {
      logContent += `ID: ${error.id}\n`;
      logContent += `词条: ${error.entry}\n`;
      logContent += `错误: ${error.message}\n\n`;
    }
  }

  if (byType.chinese.length > 0) {
    logContent += `\n## 中文不规范 (${byType.chinese.length}条)\n\n`;
    for (const error of byType.chinese) {
      logContent += `ID: ${error.id}\n`;
      logContent += `词条: ${error.entry}\n`;
      logContent += `问题: ${error.issues.join(', ')}\n\n`;
    }
  }

  if (byType.validation.length > 0) {
    logContent += `\n## 验证失败 (${byType.validation.length}条)\n\n`;
    for (const error of byType.validation) {
      logContent += `ID: ${error.id}\n`;
      logContent += `词条: ${error.entry}\n`;
      logContent += `翻译: ${error.translation}\n`;
      logContent += `问题: ${error.issues.join(', ')}\n\n`;
    }
  }

  // 统计信息
  logContent += `\n## 统计信息\n`;
  logContent += `翻译失败: ${byType.translation.length}\n`;
  logContent += `中文不规范: ${byType.chinese.length}\n`;
  logContent += `验证失败: ${byType.validation.length}\n`;

  fs.writeFileSync(logPath, logContent, 'utf8');
  console.log(`错误日志已写入: ${logPath}`);
}

// ==================== 主函数 ====================

/**
 * 主函数
 * @param {string} inputCsvPath - 输入CSV文件路径
 * @param {string} outputDirPath - 输出目录路径
 * @param {string} excelGlossaryPath - Excel术语库文件路径
 * @param {Object} options - 可选参数
 * @param {boolean} options.debugPrompt - 是否输出调试 prompt
 */
async function main(inputCsvPath, outputDirPath, excelGlossaryPath, options = {}) {
  try {
    console.log('=== CSV词条批量翻译开始 ===\n');

    // 设置默认路径
    const defaultGlossaryPath = path.join(__dirname, 'glossary', '常用注意要点清单.xlsx');
    const defaultRulesPath = path.join(__dirname, 'glossary', 'translation-rules.md');

    const glossaryPath = excelGlossaryPath || defaultGlossaryPath;
    const rulesPath = defaultRulesPath;
    const shouldForceReExtract = !!excelGlossaryPath; // 如果明确提供了excelGlossaryPath，则强制重新提取

    // 步骤1: 术语库提取（如果需要）
    await ensureGlossaryExtracted(glossaryPath, rulesPath, shouldForceReExtract);

    // 步骤2: 加载翻译规则
    const { abbreviationMap, fullTranslationMap, pseudoCodeRules, pseudoCodeRuleMap } = loadTranslationRules(rulesPath);

    // 步骤3: 批量读取CSV/XLSX
    const { headers, entries } = readCsvOrXlsxFile(inputCsvPath);

    // comment 场景规则：仅当CSV包含comment列时加载
    const hasCommentColumn = headers.includes('comment');
    const commentRulesExcelPath = path.join(__dirname, 'glossary', 'comment对应场景及规则.xlsx');
    const commentRuleMap = hasCommentColumn ? loadCommentScenarioRules(commentRulesExcelPath) : new Map();

    // 检查是否需要添加"备注1"列
    const hasNote1Column = headers.includes('备注1');
    const outputHeaders = hasNote1Column ? headers : [...headers, '备注1'];

    // 步骤4-6: 批量处理词条
    const errors = [];
    const processedEntries = [];

    console.log('\n开始翻译词条...\n');

    // 准备需要翻译的词条（过滤空词条）
    const entriesToTranslate = [];
    const entryIndexMap = []; // 记录原始索引

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryText = entry['词条'] || '';
      const commentValue = hasCommentColumn ? (entry['comment'] || '') : '';
      const commentRulesMarkdown = hasCommentColumn ? buildCommentRulesSectionMarkdown(commentValue, commentRuleMap) : '';

      if (!entryText) {
        // 空词条，直接添加到结果中
        processedEntries.push({ ...entry, '备注1': '' });
        continue;
      }

      entriesToTranslate.push({
        index: i,
        entry: entry,
        text: entryText,
        ...protectUndistinguishablePlaceholders(entryText),
        placeholders: extractPlaceholders(entryText),
        comment: commentValue,
        commentRulesMarkdown: commentRulesMarkdown
      });
      entryIndexMap.push(i);
    }

    console.log(`共 ${entriesToTranslate.length} 条词条需要翻译\n`);

    // 批量翻译配置
    const BATCH_SIZE = 1000; // 每批翻译1000条
    const totalBatches = Math.ceil(entriesToTranslate.length / BATCH_SIZE);

    // 初始化选项
    const debugPromptEnabled = options && options.debugPrompt;
    // 排序控制：默认开启排序；如 options.sort === false 则关闭
    const sortEnabled = !(options && options.sort === false);
    let debugPromptContent = '';
    if (debugPromptEnabled) {
      const inputFilename = path.basename(inputCsvPath, path.extname(inputCsvPath));
      debugPromptContent = `# Prompt 调试文件\n\n生成时间: ${new Date().toLocaleString('zh-CN')}\n输入文件: ${inputCsvPath}\n\n`;
      console.log('已启用 --debugPrompt，将记录每个批次的 prompt\n');
    }

    // 分批次翻译
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, entriesToTranslate.length);
      const batch = entriesToTranslate.slice(startIndex, endIndex);

      console.log(`\n[批次 ${batchIndex + 1}/${totalBatches}] 翻译第 ${startIndex + 1}-${endIndex} 条词条...`);

      // 先进行中文规范性检查
      const batchEntries = [];
      for (const item of batch) {
        const chineseValidation = validateChinese(item.text);
        const note1Issues = [];
        const unitNormalization = normalizeUnitTranslation(item.text);

        if (!chineseValidation.isValid) {
          note1Issues.push(...chineseValidation.issues.map(issue => `中文不规范: ${issue}`));
          errors.push({
            type: 'chinese',
            id: item.entry.id || `row_${item.index + 1}`,
            entry: item.text,
            issues: chineseValidation.issues
          });
        }

        // 单位规则化（确定性兜底）：如命中，则可直接给出英文，不依赖模型
        if (unitNormalization.note1Issues.length > 0) {
          note1Issues.push(...unitNormalization.note1Issues);
        }

        batchEntries.push({
          ...item,
          note1Issues: note1Issues,
          forcedTranslation: unitNormalization.forcedTranslation
        });
      }

      // 批量翻译
      let translations = [];
      try {
        // 将“强制翻译”的条目剔除出模型调用，避免模型把 unit 翻成 (in xxx)
        const toTranslate = [];
        const translateIndexMap = [];
        for (let i = 0; i < batchEntries.length; i++) {
          const item = batchEntries[i];
          if (item.forcedTranslation) continue;
          toTranslate.push({
            index: item.index,
            text: item.protectedText || item.text,
            placeholders: item.placeholders,
            comment: item.comment || '',
            commentRulesMarkdown: item.commentRulesMarkdown || ''
          });
          translateIndexMap.push(i);
        }

        // 预填充：forcedTranslation 直接落到结果数组对应位置
        translations = new Array(batchEntries.length).fill('');
        for (let i = 0; i < batchEntries.length; i++) {
          if (batchEntries[i].forcedTranslation) {
            translations[i] = batchEntries[i].forcedTranslation;
          }
        }

        if (toTranslate.length > 0) {
          // 如果启用了 debugPrompt，记录本批次的 prompt
          if (debugPromptEnabled) {
            const batchPrompt = buildBatchTranslationPrompt(toTranslate, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap);
            debugPromptContent += `---\n\n## 批次 ${batchIndex + 1}/${totalBatches}\n\n`;
            debugPromptContent += `词条范围: 第 ${startIndex + 1}-${endIndex} 条\n`;
            debugPromptContent += `词条数量: ${toTranslate.length} 条（规则化 ${batchEntries.length - toTranslate.length} 条）\n\n`;
            debugPromptContent += `### Prompt 内容\n\n\`\`\`\n${batchPrompt}\n\`\`\`\n\n`;
          }

          const modelTranslations = await translateBatch(toTranslate, abbreviationMap, fullTranslationMap, pseudoCodeRuleMap);
          for (let k = 0; k < translateIndexMap.length; k++) {
            translations[translateIndexMap[k]] = modelTranslations[k] || '';
          }
          console.log(`  ✅ 批量翻译成功（模型调用 ${toTranslate.length} 条，规则化 ${batchEntries.length - toTranslate.length} 条）\n`);
        } else {
          console.log(`  ✅ 本批次全部命中规则化翻译，无需调用模型\n`);
        }
      } catch (error) {
        console.error(`  ❌ 批量翻译失败: ${error.message}\n`);
        // 翻译失败，填充空字符串
        translations = new Array(batchEntries.length).fill('');
        for (let i = 0; i < batchEntries.length; i++) {
          // 若本条目有规则化翻译，则保留，不受模型失败影响
          if (batchEntries[i].forcedTranslation) {
            translations[i] = batchEntries[i].forcedTranslation;
            continue;
          }
          batchEntries[i].note1Issues.push(`翻译失败: ${error.message}`);
          errors.push({
            type: 'translation',
            id: batchEntries[i].entry.id || `row_${batchEntries[i].index + 1}`,
            entry: batchEntries[i].text,
            message: error.message
          });
        }
      }

      // 处理翻译结果
      for (let i = 0; i < batchEntries.length; i++) {
        const item = batchEntries[i];
        const translatedTextRaw = translations[i] || '';
        let translatedText = translatedTextRaw;
        const processedEntry = { ...item.entry };

        // 不可区分占位符：token 顺序/完整性校验 + 还原
        if (!item.forcedTranslation && item.tokenOrder && item.tokenOrder.length > 0) {
          let tokenValidation = validateUndistinguishableTokenOrder(translatedTextRaw, item.tokenOrder);

          // 若失败：对本条做一次"单条强约束重试"，尽量消除换序/丢失
          if (!tokenValidation.isValid) {
            try {
              const retryRaw = await translateProtectedEntryStrict(
                item.protectedText || item.text,
                abbreviationMap,
                fullTranslationMap,
                { commentRulesMarkdown: item.commentRulesMarkdown || '', pseudoCodeRuleMap: pseudoCodeRuleMap }
              );
              const retryValidation = validateUndistinguishableTokenOrder(retryRaw, item.tokenOrder);
              if (retryValidation.isValid) {
                translatedText = retryRaw;
                tokenValidation = retryValidation;
              }
            } catch (e) {
              // 忽略重试异常，走原有错误记录逻辑
            }
          }

          if (!tokenValidation.isValid) {
            item.note1Issues.push(...tokenValidation.issues.map(issue => `翻译验证失败: ${issue}`));
            errors.push({
              type: 'validation',
              id: item.entry.id || `row_${item.index + 1}`,
              entry: item.text,
              translation: translatedText,
              issues: tokenValidation.issues
            });
          }

          translatedText = restoreUndistinguishablePlaceholders(translatedText, item.tokenReplacements);
        }

        // 翻译后处理：修正 *. ext 等常见格式问题
        if (translatedText) {
          const post = postprocessTranslation(translatedText);
          translatedText = post.text;
          if (post.issues.length > 0) {
            item.note1Issues.push(...post.issues.map(msg => `后处理: ${msg}`));
          }
        }

        // “单位兆/单位兆:M”专项后处理：英文统一 unit: M，并写备注
        if (translatedText) {
          const unitPost = postprocessUnitZhao(item.text, translatedText);
          translatedText = unitPost.text;
          if (unitPost.issues.length > 0) {
            item.note1Issues.push(...unitPost.issues.map(msg => `后处理: ${msg}`));
          }
        }

        // 翻译结果验证
        if (translatedText) {
          const translationValidation = validateTranslation(item.text, translatedText, item.placeholders);
          if (!translationValidation.isValid) {
            item.note1Issues.push(...translationValidation.issues.map(issue => `翻译验证失败: ${issue}`));
            errors.push({
              type: 'validation',
              id: item.entry.id || `row_${item.index + 1}`,
              entry: item.text,
              translation: translatedText,
              issues: translationValidation.issues
            });
          }
          processedEntry['英文翻译'] = translatedText;
        } else {
          processedEntry['英文翻译'] = '';
        }

        // 设置备注1
        if (item.note1Issues.length > 0) {
          processedEntry['备注1'] = item.note1Issues.join('; ');
        } else {
          processedEntry['备注1'] = '';
        }

        processedEntries[item.index] = processedEntry;
      }
    }

    // 如果启用了 debugPrompt，再追加一份“未保护占位符的整体 Prompt”方便人工翻译
    if (debugPromptEnabled && entriesToTranslate.length > 0) {
      const rawEntriesForPrompt = entriesToTranslate.map((item, idx) => ({
        index: idx,
        text: item.text, // 使用原始词条文本（未做占位符保护）
        comment: item.comment || '',
        commentRulesMarkdown: item.commentRulesMarkdown || ''
      }));
      const rawPrompt = buildBatchTranslationPrompt(
        rawEntriesForPrompt,
        abbreviationMap,
        fullTranslationMap,
        pseudoCodeRuleMap
      );
      debugPromptContent += `---\n\n# 手工翻译用 Prompt（未保护占位符）\n\n\`\`\`\n${rawPrompt}\n\`\`\`\n\n`;
    }

    // 确保所有条目都已处理（包括空词条）
    for (let i = 0; i < entries.length; i++) {
      if (!processedEntries[i]) {
        processedEntries[i] = { ...entries[i], '备注1': '' };
      }
    }

    // 步骤6.5: （可选）对词条进行重新排序
    // 排序规则：优先级为 备注1 > 词条 > comment
    // 1. 优先把存在翻译错误的词条（备注1不为空）排在前面
    // 2. 在备注1相同的情况下，按词条内容排序
    // 3. 在词条相同的情况下，按comment排序
    let finalEntries = processedEntries;
    if (sortEnabled) {
      console.log('\n正在对词条进行排序...');
      finalEntries = [...processedEntries].sort((a, b) => {
        // 获取备注1字段
        const note1A = String(a['备注1'] || '').trim();
        const note1B = String(b['备注1'] || '').trim();

        // 优先级1: 备注1不为空的排在前面
        const hasNote1A = note1A.length > 0;
        const hasNote1B = note1B.length > 0;

        if (hasNote1A && !hasNote1B) return -1;
        if (!hasNote1A && hasNote1B) return 1;

        // 如果都有备注1或都没有备注1，按备注1内容排序
        if (hasNote1A && hasNote1B) {
          const note1Compare = note1A.localeCompare(note1B, 'zh-CN');
          if (note1Compare !== 0) return note1Compare;
        }

        // 优先级2: 按词条内容排序
        const entryA = String(a['词条'] || '').trim();
        const entryB = String(b['词条'] || '').trim();
        const entryCompare = entryA.localeCompare(entryB, 'zh-CN');
        if (entryCompare !== 0) return entryCompare;

        // 优先级3: 按comment排序
        const commentA = String(a['comment'] || '').trim();
        const commentB = String(b['comment'] || '').trim();
        return commentA.localeCompare(commentB, 'zh-CN');
      });

      const errorCount = finalEntries.filter(e => String(e['备注1'] || '').trim().length > 0).length;
      console.log(`排序完成: ${errorCount} 条有错误的词条已排在前面\n`);
    } else {
      console.log('\n跳过排序，保持原CSV顺序\n');
    }

    // 步骤7: 写入输出CSV
    const inputFilename = path.basename(inputCsvPath, path.extname(inputCsvPath));
    const outputPath = path.join(outputDirPath, path.basename(inputCsvPath));
    writeCsvFile(outputPath, outputHeaders, finalEntries);

    // 额外生成xlsx预览文件，用于在WPS中设置列宽等样式（便于查看/校对）
    const WPS_PREVIEW_COLUMN_WIDTH_CONFIG = {
      '词条': 80,
      '英文翻译': 80,
      '备注1': 80
    };
    const xlsxPreviewPath = outputPath.replace(/\.csv$/i, '.xlsx');
    writeXlsxPreviewFile(xlsxPreviewPath, outputHeaders, finalEntries, {
      columnWidthConfig: WPS_PREVIEW_COLUMN_WIDTH_CONFIG,
      defaultWidth: 20
    });

    // 步骤8: 记录错误日志
    logErrors(outputDirPath, inputFilename, errors);

    // 写入 debugPrompt 文件（如果启用）
    if (debugPromptEnabled && debugPromptContent) {
      const debugPromptPath = path.join(outputDirPath, `${inputFilename}_prompt_debug.md`);
      fs.writeFileSync(debugPromptPath, debugPromptContent, 'utf8');
      console.log(`\nPrompt 调试文件已写入: ${debugPromptPath}`);
    }

    console.log('\n=== 翻译完成 ===');
    console.log(`成功: ${processedEntries.length - errors.length} 条`);
    console.log(`错误: ${errors.length} 条`);

  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);

  // 解析参数
  let inputPath, outputDir, glossaryPath;
  let debugPrompt = false;
  // 排序控制：默认关闭；支持 --sort（显式开启）和 --no-sort（关闭）
  let sortEnabled = false;

  // 过滤出位置参数和标志参数
  const positionalArgs = [];
  for (const arg of args) {
    if (arg === '--debugPrompt') {
      debugPrompt = true;
    } else if (arg === '--sort') {
      sortEnabled = true;
    } else if (arg === '--no-sort') {
      sortEnabled = false;
    } else {
      positionalArgs.push(arg);
    }
  }

  [inputPath, outputDir, glossaryPath] = positionalArgs;

  if (!inputPath || !outputDir) {
    console.error('用法: node translateCsv.js <输入CSV路径> <输出目录> [Excel术语库路径] [--debugPrompt] [--sort|--no-sort]');
    console.error('  --debugPrompt: 将每个批次的 prompt 写入调试文件');
    console.error('  --sort: 对输出结果进行排序');
    console.error('  --no-sort: 关闭排序，保持原CSV顺序（默认开启）');
    process.exit(1);
  }

  main(inputPath, outputDir, glossaryPath, { debugPrompt, sort: sortEnabled }).catch(console.error);
}

module.exports = {
  ensureGlossaryExtracted,
  loadTranslationRules,
  readCsvFile,
  readXlsxFile,
  readCsvOrXlsxFile,
  translateEntry,
  translateBatch,
  extractPlaceholders,
  protectUndistinguishablePlaceholders,
  restoreUndistinguishablePlaceholders,
  validateUndistinguishableTokenOrder,
  postprocessTranslation,
  postprocessUnitZhao,
  normalizeUnitTranslation,
  validateChinese,
  validateTranslation,
  writeCsvFile,
  writeXlsxPreviewFile,
  logErrors,
  main
};
