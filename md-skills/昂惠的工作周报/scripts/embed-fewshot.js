/**
 * embed-fewshot.js
 * 读取成功生成的周报 few-shot 文件，格式化为 prompt block。
 * 供 feature-skills/生成-周报文档 调用，省去 LLM 运行时读文件的 token 消耗。
 *
 * 用法：node embed-fewshot.js
 * 输出：格式化后的 few-shot prompt block
 */

const fs = require('fs');
const path = require('path');

const FEWSHOT_PATH = path.join(
  'D:', 'FILE', 'Obsidian Vault', '昂惠的工作周报', '昂惠的工作周报-2026-05-31.md'
);

function embed() {
  const raw = fs.readFileSync(FEWSHOT_PATH, 'utf-8');
  const cleaned = raw.trim();

  return `## Few-shot 示例

以下是上一份成功生成的周报，请参考其：
- 领域的划分方式（抖音达人BD / 小红书PR种草 / 素材 & 内容二创 / 运营 & 规划 / 会议）
- 进度的标注格式（**进展100%** / **进展____%** / **进展50%**）
- 总结的口吻（资深BD，以推进/梳理/产出驱动，不用了解/学习/构思）
- 合并的粒度（8条，同领域执行层合并，预算独立，会议汇聚）

\`\`\`markdown
${cleaned}
\`\`\`
`;
}

if (require.main === module) {
  console.log(embed());
}

module.exports = { embed };
