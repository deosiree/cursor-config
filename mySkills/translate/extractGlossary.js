/**
 * 术语库提取脚本
 * 从Excel术语库提取数据，生成翻译规则文档
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * 提取Excel术语库数据
 * @param {string} excelPath - Excel文件路径
 * @returns {Object} 包含两个映射表的数据对象
 */
function extractGlossaryData(excelPath) {
  console.log(`正在读取Excel文件: ${excelPath}`);
  
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel文件不存在: ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetNames = workbook.SheetNames;
  
  console.log(`找到的Sheet: ${sheetNames.join(', ')}`);

  // 提取"翻译简写说明"sheet
  const abbreviationSheetName = sheetNames.find(name => name.includes('翻译简写说明'));
  if (!abbreviationSheetName) {
    throw new Error('未找到"翻译简写说明"sheet');
  }

  // 提取"注意要点_中英"sheet
  const fullTranslationSheetName = sheetNames.find(name => 
    name.includes('注意要点_中英')
  );
  if (!fullTranslationSheetName) {
    throw new Error('未找到"注意要点_中英"sheet');
  }

  // 读取翻译简写说明
  const abbreviationSheet = workbook.Sheets[abbreviationSheetName];
  const abbreviationData = XLSX.utils.sheet_to_json(abbreviationSheet, { header: 1 });
  
  // 读取注意要点_中英
  const fullTranslationSheet = workbook.Sheets[fullTranslationSheetName];
  const fullTranslationData = XLSX.utils.sheet_to_json(fullTranslationSheet, { header: 1 });

  console.log(`翻译简写说明: ${abbreviationData.length} 行`);
  console.log(`注意要点_中英: ${fullTranslationData.length} 行`);

  return {
    abbreviationData,
    fullTranslationData
  };
}

/**
 * 生成翻译规则文档
 * @param {Array} abbreviationData - 翻译简写说明数据
 * @param {Array} fullTranslationData - 注意要点_中英数据
 * @param {string} outputPath - 输出文件路径
 */
function generateTranslationRules(abbreviationData, fullTranslationData, outputPath) {
  let markdown = `# 词条翻译规则文档

## 术语库说明

### 优先级规则
- 优先使用"翻译简写说明"中的英文缩写
- 如果缩写中找不到，再使用"注意要点_中英"中的完整英文翻译

### 翻译简写说明（优先）

| 中文 | 英文缩写 |
|------|---------|
`;

  // 表头驱动的列定位（翻译简写说明）
  const abbHeaderRow = abbreviationData[0] || [];
  const abbColumnIndices = {
    chinese: -1,
    abbreviation: -1
  };

  // 定位各列索引
  for (let i = 0; i < abbHeaderRow.length; i++) {
    const header = String(abbHeaderRow[i] || '').trim();
    if (header === '中文') abbColumnIndices.chinese = i;
    else if (header === '英文缩写') abbColumnIndices.abbreviation = i;
  }

  // 处理翻译简写说明（跳过标题行）
  for (let i = 1; i < abbreviationData.length; i++) {
    const row = abbreviationData[i];
    if (!row || row.length < 2) continue;

    // 使用表头驱动的列索引
    const chinese = abbColumnIndices.chinese >= 0 ?
      String(row[abbColumnIndices.chinese] || '').trim() :
      String(row[1] || '').trim(); // 兜底使用索引1
    const english = abbColumnIndices.abbreviation >= 0 ?
      String(row[abbColumnIndices.abbreviation] || '').trim() :
      String(row[3] || '').trim(); // 兜底使用索引3

    if (!chinese || !english) continue;

    // 转义markdown特殊字符
    const escapedChinese = chinese.replace(/\|/g, '\\|');
    const escapedEnglish = english.replace(/\|/g, '\\|');

    markdown += `| ${escapedChinese} | ${escapedEnglish} |\n`;
  }

  markdown += `
### 注意要点_中英（备用）

| 中文 | 英文 | 备注 |
|------|------|------|
`;

  // 表头驱动的列定位
  const headerRow = fullTranslationData[0] || [];
  const columnIndices = {
    chinese: -1,
    english: -1,
    note: -1,
    pseudoCode: -1
  };

  // 定位各列索引
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i] || '').trim();
    if (header === '中文') columnIndices.chinese = i;
    else if (header === '英文') columnIndices.english = i;
    else if (header === '备注') columnIndices.note = i;
    else if (header === '伪代码术语') columnIndices.pseudoCode = i;
  }

  // 收集伪代码术语
  const pseudoCodeRules = [];

  // 处理注意要点_中英（跳过标题行）
  for (let i = 1; i < fullTranslationData.length; i++) {
    const row = fullTranslationData[i];
    if (!row || row.length < 2) continue;

    // 使用表头驱动的列索引
    const chinese = columnIndices.chinese >= 0 ? String(row[columnIndices.chinese] || '').trim() : String(row[0] || '').trim();
    const english = columnIndices.english >= 0 ? String(row[columnIndices.english] || '').trim() : String(row[1] || '').trim();
    const note = columnIndices.note >= 0 && row[columnIndices.note] ? String(row[columnIndices.note]).trim() : (row[2] ? String(row[2]).trim() : '');
    const isPseudoCode = columnIndices.pseudoCode >= 0 && row[columnIndices.pseudoCode] ? String(row[columnIndices.pseudoCode]).trim() === '是' : false;

    if (!chinese) continue;

    // 转义markdown特殊字符
    const escapedChinese = chinese.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
    const escapedEnglish = (english || '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
    const escapedNote = note.replace(/\|/g, '\\|').replace(/\n/g, '<br>');

    markdown += `| ${escapedChinese} | ${escapedEnglish} | ${escapedNote} |\n`;

    // 收集伪代码术语
    if (isPseudoCode && chinese && english) {
      pseudoCodeRules.push({
        chinese,
        english,
        note
      });
    }
  }

  // 追加伪代码术语详细说明区块
  if (pseudoCodeRules.length > 0) {
    markdown += `
### 伪代码术语详细说明

`;
    for (const rule of pseudoCodeRules) {
      const noteText = rule.note ? rule.note.replace(/\n/g, '<br>') : '';
      markdown += `- **${rule.chinese}**: ${rule.english}`;
      if (noteText) {
        markdown += ` - ${noteText}`;
      }
      markdown += '\n';
    }
  }

  markdown += `
## 翻译规则

### 核心原则
- **只修改英文翻译列，不修改中文词条**
- 如果中文不规范，在"备注1"列记录不规范现象

### 占位符保护
- 保持原文本中的占位符不变：\`{}\`, \`{:.3f}\`, \`%1\`, \`%2\` 等
- 占位符格式：\`[{}]\`, \`{:.3f}\`, \`%1\`, \`%2\`

### 标点符号处理
- 保持原文本中的标点符号（逗号、冒号、括号等）
- 中文标点转换为英文标点：\`，\` → \`,\`，\`：\` → \`:\`，\`。\` → \`.\`

### 特殊规则
- 省略号统一：中文 \`……\` → 英文 \`...\`
- 按钮文本：\`关闭\` → \`Close\`，\`退出\` → \`Exit\`
- 坐标轴：\`X轴\` → \`X-axis\`（大写X，不要写成x轴）

## 中文规范性检查规则

### 不规范现象示例
- 混用中英文标点：\`，\` 和 \`,\` 混用
- 多余空格：词条前后或中间有多余空格
- 标点符号错误：使用错误的标点符号
- 格式不一致：同一类词条格式不统一
- 占位符格式错误：占位符格式不符合规范
`;

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(outputPath, markdown, 'utf8');
  console.log(`翻译规则文档已生成: ${outputPath}`);
}

/**
 * 主函数
 */
function main() {
  const excelPath = process.argv[2] || path.join(__dirname, 'glossary', '常用注意要点清单.xlsx');
  const outputPath = process.argv[3] || path.join(__dirname, 'glossary', 'translation-rules.md');

  try {
    // 提取数据
    const { abbreviationData, fullTranslationData } = extractGlossaryData(excelPath);
    
    // 生成翻译规则文档
    generateTranslationRules(abbreviationData, fullTranslationData, outputPath);
    
    console.log('术语库提取完成！');
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { extractGlossaryData, generateTranslationRules };
