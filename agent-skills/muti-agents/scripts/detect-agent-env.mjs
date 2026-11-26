import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REGISTRY_DIR = resolve(SCRIPT_DIR, '../assets');

/**
 * 读取 JSON 注册表文件。
 * @param {string} filePath 注册表文件路径
 * @returns {object} 已解析的 JSON 对象
 */
function readRegistryFile(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

/**
 * 加载受支持 Agent 注册表。
 * @param {string} registryDir 注册表目录
 * @returns {object} Agent 注册表
 */
export function loadAgentRegistry(registryDir = DEFAULT_REGISTRY_DIR) {
  return readRegistryFile(resolve(registryDir, 'agents-registry.json'));
}

/**
 * 加载委派方案注册表。
 * @param {string} registryDir 注册表目录
 * @returns {object} 方案注册表
 */
export function loadSchemeRegistry(registryDir = DEFAULT_REGISTRY_DIR) {
  return readRegistryFile(resolve(registryDir, 'schemes-registry.json'));
}

/**
 * 将 Node 平台名映射为注册表使用的平台名。
 * @param {string} platform Node 平台标识
 * @returns {string} 规范化的平台名
 */
function normalizePlatform(platform) {
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'darwin';
  if (platform === 'linux') return 'linux';
  return platform;
}

/**
 * 只判断环境变量是否存在非空值，不返回其内容。
 * @param {object} env 环境变量集合
 * @param {string} name 环境变量名
 * @returns {boolean} 是否存在
 */
function hasValue(env, name) {
  return typeof env[name] === 'string' && env[name].length > 0;
}

/**
 * 探测 Agent 运行信号并组合注册表信息，不暴露环境变量原值。
 * @param {object} options 探测环境与注册表选项
 * @param {string} [options.registryDir] 注册表目录
 * @param {object} [options.env] 待探测环境变量
 * @param {string} [options.platform] Node 平台标识
 * @param {string} [options.arch] CPU 架构
 * @param {string} [options.nodeVersion] Node 版本
 * @param {string|null} [options.shell] 当前 Shell
 * @returns {object} 脱敏后的环境探测结果
 */
export function detectAgentEnvironment({
  registryDir = DEFAULT_REGISTRY_DIR,
  env = process.env,
  platform = process.platform,
  arch = process.arch,
  nodeVersion = process.version,
  shell = env.SHELL || env.ComSpec || null,
} = {}) {
  const agentRegistry = loadAgentRegistry(registryDir);
  const schemeRegistry = loadSchemeRegistry(registryDir);
  const t3AcpMcpCallExists = hasValue(env, 'T3_ACP_MCP_CALL');
  const t3AcpMcpNodeExists = hasValue(env, 'T3_ACP_MCP_NODE');
  const t3AcpMcpEntrypointExists = hasValue(env, 'T3_ACP_MCP_ENTRYPOINT');
  const normalizedPlatform = normalizePlatform(platform);
  const detectedAgent = t3AcpMcpCallExists || t3AcpMcpNodeExists ? 't3-code' : 'unknown';
  const transportRecommendation = normalizedPlatform === 'windows'
    ? (t3AcpMcpCallExists ? 'acp_mcp_call_windows' : 'native_mcp_or_manual_confirm')
    : (t3AcpMcpCallExists || t3AcpMcpNodeExists
      ? 'acp_mcp_call_posix'
      : 'native_mcp_or_manual_confirm');

  return {
    platform: normalizedPlatform,
    arch,
    nodeVersion,
    shell,
    signals: {
      hasT3AcpMcpCall: t3AcpMcpCallExists,
      hasT3AcpMcpNode: t3AcpMcpNodeExists,
      hasT3AcpMcpEntrypoint: t3AcpMcpEntrypointExists,
    },
    detectedAgent,
    transportRecommendation,
    supportedAgents: agentRegistry.agents
      .filter((agent) => agent.status === 'supported')
      .map((agent) => ({ id: agent.id, displayName: agent.displayName })),
    availableSchemes: schemeRegistry.schemes.map((scheme) => ({
      id: scheme.id,
      code: scheme.code,
      name: scheme.name,
      summary: scheme.summary,
    })),
  };
}

/**
 * 解析探测脚本的命令行参数。
 * @param {string[]} args 命令行参数
 * @returns {{ registryDir: string, compact: boolean }} 已解析选项
 */
function parseArgs(args) {
  const options = { registryDir: DEFAULT_REGISTRY_DIR, compact: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') {
      options.compact = true;
      continue;
    }
    if (arg === '--registry-dir') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('缺少 --registry-dir 的目录参数');
      options.registryDir = resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`未知参数: ${arg}`);
  }
  return options;
}

/**
 * 执行环境探测 CLI 并输出 JSON。
 * @param {string[]} args 命令行参数
 * @returns {number} 进程退出码
 */
function runCli(args) {
  try {
    const options = parseArgs(args);
    const result = detectAgentEnvironment({ registryDir: options.registryDir });
    process.stdout.write(`${JSON.stringify(result, null, options.compact ? 0 : 2)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runCli(process.argv.slice(2));
}
