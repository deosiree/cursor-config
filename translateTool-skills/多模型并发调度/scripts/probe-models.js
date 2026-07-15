/**
 * 探测 models.config.json 内全部模型是否可用
 *
 * 用法:
 *   node scripts/probe-models.js [输出目录] [--check-pricing]
 *
 * 报告默认: evals/last-probe-models.md
 *
 * 增强项（v3.0）:
 * - 从 models.config.json 读取模型列表（支持多供应商：讯飞/硅基/智谱/DeepSeek）
 * - 输出 lanes（路数）和 tier（免费/主力）信息
 * - --check-pricing 检查付费模型定价是否过期（>30天）
 * - 路权总览（免费池总路数 + 主力池总路数 + 可用路数）
 */
const path = require('path');
const fs = require('fs');
const https = require('https');

// axios 来自 translate 套件已安装的依赖
const axios = require('../../translate/node_modules/axios');
const {
  listAllModels,
  listFreeModels,
  listPrimaryModels,
  getProviderConfig,
  listStalePricingModels,
  listTranslateModels
} = require('../../translate/lib/modelCatalog');

const ROOT = path.resolve(__dirname, '../../..');
const SKILL_ROOT = path.resolve(__dirname, '..');

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const raw of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnvFile(path.join(ROOT, '.env'));
loadDotEnvFile(path.join(ROOT, '.env.local'));

const TLS_INSECURE = !['0', 'false', 'no', 'off'].includes(
  String(process.env.TRANSLATE_TLS_INSECURE === undefined ? '1' : process.env.TRANSLATE_TLS_INSECURE).toLowerCase()
);
const HTTPS_AGENT = new https.Agent({ rejectUnauthorized: !TLS_INSECURE });

function chatUrl(base) {
  const b = String(base || '').replace(/\/$/, '');
  return /\/chat\/completions$/i.test(b) ? b : `${b}/chat/completions`;
}

function mask(key) {
  const s = String(key || '');
  if (!s) return '(empty)';
  if (s.length <= 8) return '****';
  return `${s.slice(0, 4)}...${s.slice(-4)} (len=${s.length})`;
}

async function pingChat({ provider, modelId, capabilities, baseURL, apiKey, headersExtra }) {
  if (!apiKey) {
    return {
      provider,
      modelId,
      capabilities: (capabilities || []).join(','),
      ok: false,
      latency_ms: 0,
      error: 'skipped_no_key',
      status: 'skipped_no_key'
    };
  }
  const t0 = Date.now();
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(headersExtra || {})
    };
    const response = await axios.post(
      baseURL,
      {
        model: modelId,
        messages: [
          { role: 'user', content: 'ping' }
        ],
        temperature: 0,
        max_tokens: 8
      },
      { headers, timeout: 45000, httpsAgent: HTTPS_AGENT }
    );
    const latency = Date.now() - t0;
    const hasChoice = !!(response.data && response.data.choices && response.data.choices[0]);
    if (!hasChoice) {
      return {
        provider,
        modelId,
        capabilities: (capabilities || []).join(','),
        ok: false,
        latency_ms: latency,
        error: 'bad_response_shape',
        status: 'failed'
      };
    }
    return {
      provider,
      modelId,
      capabilities: (capabilities || []).join(','),
      ok: true,
      latency_ms: latency,
      error: '',
      status: 'ok'
    };
  } catch (err) {
    const latency = Date.now() - t0;
    const detail = err.response?.data
      ? JSON.stringify(err.response.data).slice(0, 180)
      : err.message;
    const caps = capabilities || [];
    const visionish = caps.includes('vision') || caps.includes('ocr');
    const status =
      visionish && /model|vision|image|not support|unsupported/i.test(String(detail))
        ? 'unsupported_for_text_ping'
        : 'failed';
    return {
      provider,
      modelId,
      capabilities: caps.join(','),
      ok: false,
      latency_ms: latency,
      error: detail,
      status
    };
  }
}

/**
 * 从 models.config.json 构建探测目标列表
 */
function buildProbeTargets() {
  const targets = [];
  const allModels = listAllModels();

  for (const model of allModels) {
    const providerCfg = getProviderConfig(model.provider);
    if (!providerCfg) {
      console.warn(`⚠️ 未知供应商: ${model.provider}（模型 ${model.id}）`);
      continue;
    }

    const apiKey = process.env[providerCfg.apiKeyEnv] || '';
    const baseURL = chatUrl(providerCfg.apiBaseUrl || process.env[`${model.provider.toUpperCase()}_BASE_URL`] || '');

    // 供应商特殊 headers
    const headersExtra = {};
    if (model.provider === 'xfyun') {
      headersExtra['X-Service-Name'] = process.env.XFYUN_SERVICE || 'translation';
    }

    // 对于模型 id 如 "xfyun:xophunyuan7bmt"，提取裸 modelId
    const modelId = model.modelName || model.id.split(':').pop();

    // 讯飞用 env 中的模型名（兼容旧逻辑）
    const actualModelId = model.provider === 'xfyun'
      ? (process.env.XFYUN_MODEL || modelId)
      : modelId;

    targets.push({
      provider: model.provider,
      modelId: actualModelId,
      configId: model.id,
      capabilities: model.capabilities,
      lanes: model.lanes,
      tier: model.tier,
      pricing: model.pricing,
      pricing_last_checked: model.pricing_last_checked,
      baseURL,
      apiKey,
      headersExtra
    });
  }

  return targets;
}

function renderLaneSummary(targets, results) {
  const freePool = targets.filter((t) => t.tier === 'free');
  const primaryPool = targets.filter((t) => t.tier === 'primary');

  const freeLanes = freePool.reduce((s, t) => s + (t.lanes || 0), 0);
  const primaryLanes = primaryPool.reduce((s, t) => s + (t.lanes || 0), 0);

  const freeUsable = results.filter(
    (r) => r.ok && r.tier === 'free' && /(^|,)(mt|chat)(,|$)/.test(r.capabilities || '')
  );
  const primaryUsable = results.filter(
    (r) => r.ok && r.tier === 'primary' && /(^|,)(mt|chat)(,|$)/.test(r.capabilities || '')
  );

  let md = `## 路权总览\n\n`;
  md += `| 池 | 总路数 | 可用模型数 | 可用路数 |\n`;
  md += `|------|--------|------------|----------|\n`;
  md += `| 免费池 | ${freeLanes} | ${freeUsable.length} / ${freePool.length} | ${freeUsable.reduce((s, r) => s + (r.lanes || 0), 0)} |\n`;
  md += `| 主力池 | ${primaryLanes} | ${primaryUsable.length} / ${primaryPool.length} | ${primaryUsable.reduce((s, r) => s + (r.lanes || 0), 0)} |\n`;
  md += `\n`;
  md += `免费池明细：\n`;
  for (const t of freePool) {
    const r = results.find((x) => x.configId === t.configId);
    md += `- ${t.configId} — ${t.lanes} 路 — ${r && r.ok ? '✅' : '❌ ' + (r ? r.status : '?')}\n`;
  }
  md += `\n`;
  return md;
}

function renderPricingCheck() {
  const stale = listStalePricingModels();
  if (stale.length === 0) {
    return `## 定价检查\n\n✅ 所有付费模型定价确认在 30 天内。\n\n`;
  }
  let md = `## ⚠️ 定价过期检查\n\n以下付费模型定价超过 30 天未确认，请核实最新价格：\n\n`;
  md += `| 模型 | 上次确认 | 距今天数 | 当前记录价格 | 定价页 |\n`;
  md += `|------|----------|----------|-------------|--------|\n`;
  for (const { model, days } of stale) {
    const url = (model.urls && model.urls.pricing) || '';
    const price = model.pricing
      ? `$${model.pricing.input}/$${model.pricing.output} ${model.pricing.unit || ''}`
      : 'N/A';
    md += `| ${model.id} | ${model.pricing_last_checked || '从未'} | ${days} 天 | ${price} | ${url ? `[链接](${url})` : '—'} |\n`;
  }
  md += `\n`;
  return md;
}

function renderReport(targets, results, showPricing) {
  const usableText = results.filter(
    (r) => r.ok && /(^|,)(mt|chat)(,|$)/.test(r.capabilities || '')
  );
  const usableMt = results.filter((r) => r.ok && /(^|,)mt(,|$)/.test(r.capabilities || ''));
  const failed = results.filter((r) => r.status === 'failed');
  const skipped = results.filter((r) => r.status === 'skipped_no_key');
  const unsupported = results.filter((r) => r.status === 'unsupported_for_text_ping');

  let md = `# 模型可用性探测报告\n\n`;
  md += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  md += renderLaneSummary(targets, results);

  if (showPricing) {
    md += renderPricingCheck();
  }

  md += `## 汇总\n\n`;
  md += `- usable_text (ok 且含 mt/chat): ${usableText.length}\n`;
  md += `- usable_mt: ${usableMt.length}\n`;
  md += `- failed: ${failed.length}\n`;
  md += `- skipped_no_key: ${skipped.length}\n`;
  md += `- unsupported_for_text_ping: ${unsupported.length}\n\n`;
  md += `## 明细\n\n`;
  md += `| provider | modelId | lanes | tier | capability | ok | latency_ms | status | error |\n`;
  md += `|---|---|---:|---|----|---:|---|---|\n`;
  for (const r of results) {
    const err = String(r.error || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    md += `| ${r.provider} | ${r.modelId} | ${r.lanes || '?'} | ${r.tier || '?'} | ${r.capabilities} | ${r.ok} | ${r.latency_ms} | ${r.status} | ${err} |\n`;
  }

  const keyProviders = [];
  if (process.env.XFYUN_API_KEY) keyProviders.push(`xfyun=${mask(process.env.XFYUN_API_KEY)}`);
  if (process.env.SILICONFLOW_API_KEY) keyProviders.push(`silicon=${mask(process.env.SILICONFLOW_API_KEY)}`);
  if (process.env.ZHIPU_API_KEY) keyProviders.push(`zhipu=${mask(process.env.ZHIPU_API_KEY)}`);
  if (process.env.DEEPSEEK_API_KEY) keyProviders.push(`deepseek=${mask(process.env.DEEPSEEK_API_KEY)}`);
  md += `\nKey masks: ${keyProviders.join(' ')}\n`;
  return md;
}

async function main() {
  const args = process.argv.slice(2);
  const checkPricing = args.includes('--check-pricing');
  const outDirArg = args.find((a) => !a.startsWith('--'));
  const outDir = outDirArg
    ? path.resolve(outDirArg)
    : path.join(SKILL_ROOT, 'evals');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`配置: ${path.join(SKILL_ROOT, 'lib', 'models.config.json')}`);
  console.log(`ROOT .env: ${path.join(ROOT, '.env')}`);

  if (checkPricing) {
    console.log('模式: 探测 + 定价检查\n');
  } else {
    console.log('模式: 探测\n');
  }

  const targets = buildProbeTargets();
  console.log(`待探测模型: ${targets.length}\n`);

  const results = [];
  for (const t of targets) {
    const label = `  ${t.provider}/${t.modelId} (${t.lanes}路·${t.tier})`;
    process.stdout.write(`${label.padEnd(60)} ... `);
    const r = await pingChat(t);
    // 附加上下文信息
    r.lanes = t.lanes;
    r.tier = t.tier;
    r.configId = t.configId;
    r.pricing_last_checked = t.pricing_last_checked;
    results.push(r);
    console.log(r.status + (r.ok ? ` ${r.latency_ms}ms` : ` ${String(r.error).slice(0, 80)}`));
  }

  const report = renderReport(targets, results, checkPricing);
  const outPath = path.join(outDir, 'last-probe-models.md');
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(`\nReport: ${outPath}`);

  const usable = results.filter((r) => r.ok).length;
  console.log(`Summary: ${usable}/${results.length} ok`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
