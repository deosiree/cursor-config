/**
 * 缩短池 = free；验证 = DeepSeek（委托 sibling translate）
 */
const path = require('path');

// 复用 sibling translate 的依赖树
const translateNm = path.join(__dirname, '../../translate/node_modules');
if (!module.paths.includes(translateNm)) {
  module.paths.unshift(translateNm);
}

// 加载 translateCsv 会副作用加载 huiyanSkills/.env
const translate = require(path.join(__dirname, '../../translate/translateCsv.js'));

/** 缩短优先序：top5 实测稳定 → MT → 其余 → 讯飞 Busy 多放最后 */
const SHORTEN_PREF = [
  'zhipu:glm-4-flash',
  'siliconflow:THUDM/GLM-4-9B-0414',
  'siliconflow:Qwen/Qwen3-8B',
  'siliconflow:tencent/Hunyuan-MT-7B',
  'siliconflow:THUDM/GLM-Z1-9B-0414',
  'siliconflow:Qwen/Qwen2.5-7B-Instruct',
  'siliconflow:deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  'xfyun:xophunyuan7bmt'
];

function sortShortenWorkers(workers) {
  const rank = new Map(SHORTEN_PREF.map((id, i) => [id, i]));
  return workers.slice().sort((a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id) : 50;
    const rb = rank.has(b.id) ? rank.get(b.id) : 50;
    return ra - rb;
  });
}

/**
 * 活跃缩短 workers：multi-model free 池；显式去掉 deepseek；按稳定优先序排序
 * @param {{ multiModel?: boolean, models?: string }} [options]
 */
function resolveShortenWorkers(options = {}) {
  const workers = translate.resolveActiveTranslateWorkers({
    multiModel: options.multiModel !== false,
    models: options.models != null ? options.models : 'all',
    excludeEn2RuEchoOnly: false
  });
  return sortShortenWorkers(workers.filter((w) => w.provider !== 'deepseek'));
}

function resolveVerifyWorker() {
  return translate.resolveVerifyWorker();
}

module.exports = {
  resolveShortenWorkers,
  resolveVerifyWorker,
  parseBatchTranslationResponse: translate.parseBatchTranslationResponse,
  readXlsxFile: translate.readXlsxFile,
  writeXlsxPreviewFile: translate.writeXlsxPreviewFile,
  BATCH_NL_TOKEN: translate.BATCH_NL_TOKEN,
  sortShortenWorkers
};
