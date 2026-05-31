/**
 * embed-template.js
 * 读取昂惠的工作周报模板文件，格式化为 prompt block。
 * 供 feature-skills/生成-周报文档 调用，省去 LLM 运行时读文件的 token 消耗。
 *
 * 用法：node embed-template.js
 * 输出：格式化后的模板 prompt block
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(
  'D:', 'FILE', 'Obsidian Vault', '昂惠的工作周报', '昂惠的工作周报-template.md'
);

function embed() {
  const raw = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const cleaned = raw.trim();

  return `## 周报模板结构（四段式）

以下为模板的完整结构，请严格遵循四段划分和进度标记规则：

\`\`\`markdown
${cleaned}
\`\`\`

**关键约束提取：**
- 一、本周工作总结：按领域分点，每点1-2句，含关键数字
- 二、本周工作内容：≤10条，按领域分组，每条末尾（**进展XX%**）
- 三、需要协调与帮助：从工作内容中提取阻塞项
- 四、下周工作计划：逐条列出，无进度标记
- 附件说明/图片说明：默认 * --
`;
}

if (require.main === module) {
  console.log(embed());
}

module.exports = { embed };
