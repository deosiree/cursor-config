/**
 * 工作流测试脚本
 * 测试各个模块的功能（不包括AI翻译，需要实际API）
 */

const fs = require('fs');
const path = require('path');
const {
  ensureGlossaryExtracted,
  loadTranslationRules,
  readCsvFile,
  validateChinese,
  validateTranslation,
  extractPlaceholders
} = require('./translateCsv');

async function testWorkflow() {
  console.log('=== 开始测试工作流 ===\n');
  
  const testResults = {
    glossaryExtraction: false,
    rulesLoading: false,
    csvReading: false,
    chineseValidation: false,
    translationValidation: false,
    placeholderExtraction: false
  };
  
  try {
    // 测试1: 术语库提取
    console.log('测试1: 术语库提取');
    const glossaryPath = path.join(__dirname, 'glossary', '常用注意要点清单.xlsx');
    const rulesPath = path.join(__dirname, 'glossary', 'translation-rules.md');
    
    if (fs.existsSync(glossaryPath)) {
      await ensureGlossaryExtracted(glossaryPath, rulesPath);
      if (fs.existsSync(rulesPath)) {
        testResults.glossaryExtraction = true;
        console.log('✅ 术语库提取成功\n');
      } else {
        console.log('❌ 术语库提取失败：规则文档未生成\n');
      }
    } else {
      console.log('⚠️  跳过：Excel文件不存在\n');
    }
    
    // 测试2: 加载翻译规则
    console.log('测试2: 加载翻译规则');
    if (fs.existsSync(rulesPath)) {
      const { abbreviationMap, fullTranslationMap } = loadTranslationRules(rulesPath);
      if (abbreviationMap.size > 0 || fullTranslationMap.size > 0) {
        testResults.rulesLoading = true;
        console.log(`✅ 翻译规则加载成功: 缩写 ${abbreviationMap.size} 条, 完整翻译 ${fullTranslationMap.size} 条\n`);
      } else {
        console.log('❌ 翻译规则加载失败：映射表为空\n');
      }
    } else {
      console.log('⚠️  跳过：规则文档不存在\n');
    }
    
    // 测试3: CSV读取
    console.log('测试3: CSV读取');
    const testCsvPath = path.join(__dirname, '..', '..', '..', 'DownLoads', '词条导出_20260128111948.csv');
    if (fs.existsSync(testCsvPath)) {
      const { headers, entries } = readCsvFile(testCsvPath);
      if (headers.length > 0 && entries.length > 0) {
        testResults.csvReading = true;
        console.log(`✅ CSV读取成功: ${entries.length} 条词条\n`);
      } else {
        console.log('❌ CSV读取失败：数据为空\n');
      }
    } else {
      console.log('⚠️  跳过：测试CSV文件不存在\n');
    }
    
    // 测试4: 中文规范性检查
    console.log('测试4: 中文规范性检查');
    const testCases = [
      { text: '正常词条', expected: true },
      { text: ' 前后有空格 ', expected: false },
      { text: '混用标点，test, 这里', expected: false }, // 中文逗号和英文逗号混用
      { text: '中间  有多个空格', expected: false },
      { text: '包含占位符: {}', expected: true },
      { text: '包含占位符: %1', expected: true }
    ];
    
    let passed = 0;
    for (const testCase of testCases) {
      const result = validateChinese(testCase.text);
      if (result.isValid === testCase.expected) {
        passed++;
      } else {
        console.log(`  失败: "${testCase.text}" - 期望 ${testCase.expected}, 实际 ${result.isValid}`);
      }
    }
    
    if (passed === testCases.length) {
      testResults.chineseValidation = true;
      console.log(`✅ 中文规范性检查测试通过: ${passed}/${testCases.length}\n`);
    } else {
      console.log(`❌ 中文规范性检查测试失败: ${passed}/${testCases.length}\n`);
    }
    
    // 测试5: 占位符提取
    console.log('测试5: 占位符提取');
    const placeholderTestCases = [
      { text: '测试 {} 占位符', expectedCount: 1 },
      { text: '测试 {:.3f} 占位符', expectedCount: 1 },
      { text: '测试 %1 和 %2', expectedCount: 2 },
      { text: '测试 [{}] 占位符', expectedCount: 1 }, // [{}] 应该只匹配一次
      { text: '测试 {} 和 {:.3f} 和 %1', expectedCount: 3 }
    ];
    
    passed = 0;
    for (const testCase of placeholderTestCases) {
      const placeholders = extractPlaceholders(testCase.text);
      if (placeholders.length === testCase.expectedCount) {
        passed++;
      } else {
        console.log(`  失败: "${testCase.text}" - 期望 ${testCase.expectedCount}, 实际 ${placeholders.length}`);
      }
    }
    
    if (passed === placeholderTestCases.length) {
      testResults.placeholderExtraction = true;
      console.log(`✅ 占位符提取测试通过: ${passed}/${placeholderTestCases.length}\n`);
    } else {
      console.log(`❌ 占位符提取测试失败: ${passed}/${placeholderTestCases.length}\n`);
    }
    
    // 测试6: 翻译结果验证
    console.log('测试6: 翻译结果验证');
    const validationTestCases = [
      {
        original: '测试 {} 占位符',
        translated: 'Test {} placeholder',
        placeholders: [{ original: '{}' }],
        expected: true
      },
      {
        original: '测试 {} 占位符',
        translated: 'Test placeholder',
        placeholders: [{ original: '{}' }],
        expected: false  // 占位符丢失
      },
      {
        original: '测试文本',
        translated: '',
        placeholders: [],
        expected: false  // 翻译为空
      }
    ];
    
    passed = 0;
    for (const testCase of validationTestCases) {
      const result = validateTranslation(
        testCase.original,
        testCase.translated,
        testCase.placeholders
      );
      if (result.isValid === testCase.expected) {
        passed++;
      } else {
        console.log(`  失败: 期望 ${testCase.expected}, 实际 ${result.isValid}, 问题: ${result.issues.join(', ')}`);
      }
    }
    
    if (passed === validationTestCases.length) {
      testResults.translationValidation = true;
      console.log(`✅ 翻译结果验证测试通过: ${passed}/${validationTestCases.length}\n`);
    } else {
      console.log(`❌ 翻译结果验证测试失败: ${passed}/${validationTestCases.length}\n`);
    }
    
    // 汇总结果
    console.log('=== 测试结果汇总 ===');
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(r => r).length;
    
    console.log(`总计: ${totalTests} 项测试`);
    console.log(`通过: ${passedTests} 项`);
    console.log(`失败: ${totalTests - passedTests} 项\n`);
    
    for (const [testName, result] of Object.entries(testResults)) {
      console.log(`${result ? '✅' : '❌'} ${testName}`);
    }
    
    if (passedTests === totalTests) {
      console.log('\n🎉 所有测试通过！');
      process.exit(0);
    } else {
      console.log('\n⚠️  部分测试失败，请检查上述错误');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testWorkflow();
}

module.exports = { testWorkflow };
