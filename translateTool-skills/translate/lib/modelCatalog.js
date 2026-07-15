/**
 * 模型目录 — 从 models.config.json 读取模型定义、路权、定价、供应商信息。
 * 供 translateCsv.js / probe-models.js / laneDispatcher.js 共用。
 *
 * 与旧版 modelCatalog（硬编码 SILICONFLOW_MODELS 常量）向后兼容：保留同名导出。
 */
const fs = require('fs');
const path = require('path');

/**
 * translate 已从 agent-skills 迁到 translateTool-skills：
 * 旧相对路径 `../../多模型并发调度` 在 agent-skills 下成立，
 * 在 translateTool-skills 下需回退到 `../../agent-skills/多模型并发调度`。
 */
function resolveModelsConfigPath() {
  if (process.env.MODELS_CONFIG_PATH) {
    return path.resolve(process.env.MODELS_CONFIG_PATH);
  }
  const candidates = [
    path.resolve(__dirname, '../../多模型并发调度/lib/models.config.json'),
    path.resolve(__dirname, '../../../agent-skills/多模型并发调度/lib/models.config.json'),
    path.resolve(__dirname, '../../agent-skills/多模型并发调度/lib/models.config.json')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

const CONFIG_PATH = resolveModelsConfigPath();

/** @type {object|null} */
let _configCache = null;

function loadConfig() {
  if (_configCache) return _configCache;
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `找不到 models.config.json（translate 迁移后路径变更）。试过: ` +
        `${path.resolve(__dirname, '../../多模型并发调度/lib/models.config.json')} 与 ` +
        `${path.resolve(__dirname, '../../../agent-skills/多模型并发调度/lib/models.config.json')}。` +
        `也可设 MODELS_CONFIG_PATH。`
    );
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  _configCache = JSON.parse(raw);
  return _configCache;
}

/**
 * 获取所有模型条目
 * @returns {Array<object>}
 */
function listAllModels() {
  return (loadConfig().models || []).slice();
}

/**
 * 按 tier 过滤模型
 * @param {'free'|'primary'} tier
 * @returns {Array<object>}
 */
function listModelsByTier(tier) {
  return listAllModels().filter((m) => m.tier === tier);
}

/**
 * 获取免费/限免模型池
 * @returns {Array<object>}
 */
function listFreeModels() {
  return listModelsByTier('free');
}

/**
 * 获取主力付费模型池
 * @returns {Array<object>}
 */
function listPrimaryModels() {
  return listModelsByTier('primary');
}

/**
 * 按 provider 过滤模型
 * @param {string} provider - xfyun|siliconflow|zhipu|deepseek
 * @returns {Array<object>}
 */
function listModelsByProvider(provider) {
  return listAllModels().filter((m) => m.provider === provider);
}

/**
 * 检查模型是否为文本可翻译类型（含 mt 或 chat 能力）
 * @param {string[]} caps
 * @returns {boolean}
 */
function isTextTranslateCapable(caps) {
  return (caps || []).some((c) => c === 'mt' || c === 'chat');
}

/** 限制标签：英翻俄批次易英文回显，translate en2ru 全模型并发应绕过 */
const EN2RU_ECHO_ONLY_LIMIT = '英翻俄时只能输出英';

/** en2ru 语义验收 / 疑难重译固定模型 id */
const VERIFY_WORKER_CONFIG_ID = 'deepseek:deepseek-v4-flash';

/**
 * 解析 en2ru 验收模型元数据；缺配置或缺 DEEPSEEK_API_KEY 时抛错（禁止回落免费模型）
 * @returns {object} models.config 中的模型条目
 */
function resolveVerifyWorker() {
  const model =
    findModelById(VERIFY_WORKER_CONFIG_ID) ||
    resolveModelByAlias('deepseek-v4-flash') ||
    resolveModelByAlias('v4-flash');
  if (!model || model.provider !== 'deepseek') {
    throw new Error(
      `验收模型未在 models.config.json 中找到：${VERIFY_WORKER_CONFIG_ID}。禁止用免费 MT/chat 冒充语义验收。`
    );
  }
  const providerCfg = getProviderConfig('deepseek');
  const keyEnv = (providerCfg && providerCfg.apiKeyEnv) || 'DEEPSEEK_API_KEY';
  if (!process.env[keyEnv]) {
    throw new Error(
      `未配置 ${keyEnv}。en2ru 语义验收固定使用 ${VERIFY_WORKER_CONFIG_ID}，禁止静默改用免费模型。`
    );
  }
  return model;
}

/**
 * 模型是否标记为「英翻俄易输出英文（回显）」
 * @param {object} model
 * @returns {boolean}
 */
function isEn2RuEchoOnlyModel(model) {
  if (!model) return false;
  const limits = model['限制'] || model.limits || [];
  return (Array.isArray(limits) ? limits : []).some(
    (x) => String(x).trim() === EN2RU_ECHO_ONLY_LIMIT
  );
}

/**
 * 按翻译模式过滤可用模型（en2ru 绕过「英翻俄时只能输出英」）
 * @param {string} [modeId]
 * @param {Array<object>} [models]
 * @returns {Array<object>}
 */
function listTranslateModelsForMode(modeId, models) {
  const pool = listTranslateModels(models);
  const mode = String(modeId || '').trim();
  if (mode === 'en2ru' || mode === 'pipeline') {
    return pool.filter((m) => !isEn2RuEchoOnlyModel(m));
  }
  return pool;
}

/**
 * 检查模型是否纯视觉/OCR 无文本翻译能力
 * @param {string[]} caps
 * @returns {boolean}
 */
function isVisionOnly(caps) {
  const set = new Set(caps || []);
  return (set.has('vision') || set.has('ocr')) && !set.has('mt') && !set.has('chat');
}

/**
 * 获取可参与翻译分摊的模型（含 mt 或纯 chat）
 * @param {Array<object>} [models] - 可选过滤池，默认 listAllModels()
 * @returns {Array<object>}
 */
function listTranslateModels(models) {
  const pool = models || listAllModels();
  return pool.filter((m) => {
    const caps = m.capabilities || [];
    if (caps.includes('mt')) return true;
    if (caps.includes('chat') && !caps.includes('vision') && !caps.includes('ocr')) return true;
    return false;
  });
}

/**
 * 按 provider:modelId 查找模型
 * @param {string} id - 如 "siliconflow:Qwen/Qwen3-8B"
 * @returns {object|null}
 */
function findModelById(id) {
  const t = String(id || '').trim();
  if (!t) return null;
  return listAllModels().find((m) => m.id === t) || null;
}

/**
 * 按短名/别名查找模型
 * @param {string} token - 如 "Hunyuan-MT"、"qwen3-8b"、"xfyun:xophunyuan7bmt"
 * @param {Array<object>} [pool] - 可选过滤池
 * @returns {object|null}
 */
function resolveModelByAlias(token, pool) {
  const t = String(token || '').trim();
  if (!t) return null;
  const models = pool || listAllModels();

  // 精确 id 匹配
  const exact = models.find((m) => m.id === t);
  if (exact) return exact;

  // provider:modelId 不区分大小写
  const lower = t.toLowerCase();
  const byId = models.find((m) => m.id.toLowerCase() === lower);
  if (byId) return byId;

  // 别名匹配
  for (const m of models) {
    if ((m.aliases || []).some((a) => String(a).toLowerCase() === lower)) return m;
    // 后缀匹配：modelId 的末段（如 "Qwen3-8B" ⊂ "siliconflow:Qwen/Qwen3-8B"）
    const last = m.id.split('/').pop().toLowerCase();
    if (last === lower) return m;
    const colonLast = m.id.split(':').pop().toLowerCase();
    if (colonLast === lower) return m;
  }
  return null;
}

/**
 * 解析 --models 列表（逗号/分号/空格分隔）
 * @param {string|string[]|null|undefined} raw
 * @returns {{ all: boolean, ids: string[], unknown: string[], models: object[] }}
 */
function parseModelsList(raw) {
  let parts = [];
  if (Array.isArray(raw)) parts = raw;
  else if (raw == null || raw === '') parts = [];
  else parts = String(raw).split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);

  if (parts.some((p) => p.toLowerCase() === 'all')) {
    const freeModels = listTranslateModels(listFreeModels());
    return { all: true, ids: freeModels.map((m) => m.id), unknown: [], models: freeModels };
  }

  const ids = [];
  const models = [];
  const unknown = [];
  const allModels = listAllModels();

  for (const p of parts) {
    const resolved = resolveModelByAlias(p, allModels);
    if (resolved) {
      ids.push(resolved.id);
      models.push(resolved);
    } else {
      unknown.push(p);
    }
  }
  return { all: false, ids: [...new Set(ids)], unknown, models: [...uniqueById(models)] };
}

function uniqueById(arr) {
  const seen = new Set();
  return arr.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

/**
 * 获取供应商配置
 * @param {string} provider
 * @returns {object|null}
 */
function getProviderConfig(provider) {
  const cfg = loadConfig();
  return (cfg.providers && cfg.providers[provider]) || null;
}

/**
 * 检查定价数据是否过期（默认 30 天阈值）
 * @param {object} model
 * @param {number} [maxDays=30]
 * @returns {{ stale: boolean, days: number|null }}
 */
function checkPricingStale(model, maxDays = 30) {
  const last = model.pricing_last_checked;
  if (!last) return { stale: true, days: null };
  const lastDate = new Date(last);
  if (isNaN(lastDate.getTime())) return { stale: true, days: null };
  const days = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
  return { stale: days > maxDays, days: Math.round(days) };
}

/**
 * 列出定价已过期的模型
 * @param {number} [maxDays=30]
 * @returns {Array<{ model: object, days: number }>}
 */
function listStalePricingModels(maxDays = 30) {
  const result = [];
  for (const m of listAllModels()) {
    if (!m.pricing || m.pricing.free) continue; // 免费模型不检查
    const { stale, days } = checkPricingStale(m, maxDays);
    if (stale) result.push({ model: m, days: days || 0 });
  }
  return result;
}

/**
 * 按 tier + 翻译能力过滤后，按 priority 排序
 * @param {'free'|'primary'} tier
 * @param {boolean} [translateOnly=true]
 * @returns {Array<object>}
 */
function listActiveModelsForTier(tier, translateOnly = true) {
  let pool = listModelsByTier(tier);
  if (translateOnly) pool = listTranslateModels(pool);
  return pool.sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

// ---- 向后兼容导出（旧代码仍可用） ----

/** @deprecated 使用 models.config.json + listTranslateModels() */
const SILICONFLOW_MODELS = (() => {
  const sfModels = listModelsByProvider('siliconflow');
  return sfModels.map((m) => ({
    id: m.id.replace(/^siliconflow:/, ''),
    capabilities: m.capabilities,
    aliases: m.aliases,
    notes: m.pricing ? m.pricing.note : ''
  }));
})();

/** @deprecated 使用 resolveModelByAlias() */
function resolveSiliconModelId(token) {
  const t = String(token || '').trim();
  if (!t) return null;
  if (t.toLowerCase() === 'all') return 'all';
  const sfModels = listModelsByProvider('siliconflow');
  const resolved = resolveModelByAlias(t, sfModels);
  if (!resolved) return null;
  return resolved.id.replace(/^siliconflow:/, '');
}

/** @deprecated 使用 listTranslateModels() */
function listSiliconTranslateModels() {
  const sfModels = listModelsByProvider('siliconflow');
  return sfModels
    .filter((m) => isTextTranslateCapable(m.capabilities) && !isVisionOnly(m.capabilities))
    .map((m) => ({ id: m.id.replace(/^siliconflow:/, ''), capabilities: m.capabilities }));
}

module.exports = {
  // 新 API
  loadConfig,
  listAllModels,
  listModelsByTier,
  listFreeModels,
  listPrimaryModels,
  listModelsByProvider,
  listTranslateModels,
  listActiveModelsForTier,
  findModelById,
  resolveModelByAlias,
  parseModelsList,
  getProviderConfig,
  checkPricingStale,
  listStalePricingModels,
  isTextTranslateCapable,
  isVisionOnly,
  isEn2RuEchoOnlyModel,
  listTranslateModelsForMode,
  EN2RU_ECHO_ONLY_LIMIT,
  VERIFY_WORKER_CONFIG_ID,
  resolveVerifyWorker,

  // 向后兼容
  SILICONFLOW_MODELS,
  resolveSiliconModelId,
  listSiliconTranslateModels,

  // 配置路径
  CONFIG_PATH
};
