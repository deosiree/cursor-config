import { existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REGISTRY_DIR = resolve(SCRIPT_DIR, '../assets');
const ENUM_VALUES = {
  reasoningEffort: ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  serviceTier: ['default', 'priority'],
  isolation: ['shared', 'worktree'],
  mode: ['async', 'wait'],
  role: ['implementation', 'research', 'review', 'design', 'test', 'general'],
  interactionMode: ['inherit', 'default', 'plan'],
  runtimeMode: ['inherit', 'approval-required', 'auto-accept-edits', 'auto', 'full-access'],
};
const VALUE_FLAGS = new Map([
  ['--task', 'task'],
  ['--plan', 'plan'],
  ['--scheme', 'scheme'],
  ['--title', 'title'],
  ['--provider', 'provider'],
  ['--model', 'model'],
  ['--reasoning-effort', 'reasoningEffort'],
  ['--service-tier', 'serviceTier'],
  ['--isolation', 'isolation'],
  ['--mode', 'mode'],
  ['--role', 'role'],
  ['--interaction-mode', 'interactionMode'],
  ['--runtime-mode', 'runtimeMode'],
  ['--client-request-id', 'clientRequestId'],
]);

/**
 * 加载方案注册表。
 * @param {string} registryDir 注册表目录
 * @returns {object} 方案注册表
 */
export function loadSchemeRegistry(registryDir = DEFAULT_REGISTRY_DIR) {
  return JSON.parse(readFileSync(resolve(registryDir, 'schemes-registry.json'), 'utf8'));
}

/**
 * 校验参数是否属于指定枚举集合。
 * @param {string} name 参数名
 * @param {string} value 参数值
 * @returns {void}
 */
function validateEnum(name, value) {
  const values = ENUM_VALUES[name];
  if (values && !values.includes(value)) {
    throw new Error(`--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} 必须是: ${values.join(', ')}`);
  }
}

/**
 * 解析并验证委派器 CLI 参数。
 * @param {string[]} args 命令行参数
 * @returns {object} 已解析选项
 */
export function parseArgs(args) {
  const options = { dryRun: false, listSchemes: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--list-schemes') {
      options.listSchemes = true;
      continue;
    }
    if (arg === '--help') {
      options.help = true;
      continue;
    }
    const property = VALUE_FLAGS.get(arg);
    if (!property) throw new Error(`未知参数: ${arg}`);
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`缺少 ${arg} 的参数值`);
    if (property !== 'title' && value.trim().length === 0) throw new Error(`${arg} 参数不能为空`);
    validateEnum(property, value);
    options[property] = value;
    index += 1;
  }
  if (!options.help && !options.listSchemes && !options.task) {
    throw new Error('--task 为必填参数');
  }
  return options;
}

/**
 * 为任务生成可追踪且不重复的请求标识。
 * @returns {string} 委派请求标识
 */
export function createClientRequestId() {
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  return `muti-agents-${timestamp}-${randomBytes(4).toString('hex')}`;
}

/**
 * 对象中按 id 更新选项，不改变输入数组。
 * @param {object[]} options 方案默认选项
 * @param {string} id 选项标识
 * @param {string} value 新选项值
 * @returns {object[]} 更新后的选项数组
 */
function upsertOption(options, id, value) {
  const updated = options.map((option) => ({ ...option }));
  const existing = updated.find((option) => option.id === id);
  if (existing) existing.value = value;
  else updated.push({ id, value });
  return updated;
}

/**
 * 根据方案和 CLI 覆盖项构造 T3 delegate_task 请求。
 * @param {object} options 已解析的 CLI 选项
 * @param {object} [registry] 方案注册表
 * @returns {object} 委派请求负载
 */
export function buildTaskPayload(options, registry = loadSchemeRegistry()) {
  const schemeId = options.scheme || registry.defaultSchemeId;
  const scheme = registry.schemes.find((item) => item.id === schemeId);
  if (!scheme) throw new Error(`未找到委派方案: ${schemeId}`);
  const defaults = scheme.delegation;
  let targetOptions = defaults.options.map((option) => ({ ...option }));
  if (options.reasoningEffort) targetOptions = upsertOption(targetOptions, 'reasoningEffort', options.reasoningEffort);
  if (options.serviceTier) targetOptions = upsertOption(targetOptions, 'serviceTier', options.serviceTier);

  const task = options.plan
    ? [
      '请严格按照以下计划文件执行，并在完成后回报改动文件清单与测试验证结果：',
      `计划文件: ${options.plan}`,
      '',
      '具体执行要求：',
      options.task,
    ].join('\n')
    : options.task;
  const payload = {
    task,
    role: options.role || defaults.role,
    interactionMode: options.interactionMode || defaults.interactionMode,
    isolation: options.isolation || defaults.isolation,
    mode: options.mode || defaults.mode,
    clientRequestId: options.clientRequestId || createClientRequestId(),
    target: {
      providerInstanceId: options.provider || defaults.providerInstanceId,
      model: options.model || defaults.model,
      options: targetOptions,
    },
  };
  if (options.title) payload.title = options.title;
  if (options.runtimeMode) payload.runtimeMode = options.runtimeMode;
  return payload;
}

/**
 * 将 JSON 中所有非 ASCII UTF-16 字符转成小写 \uXXXX 序列。
 * @param {object} value 待序列化对象
 * @returns {string} 仅含 ASCII 字符的 JSON
 */
export function serializeAsciiJson(value) {
  return JSON.stringify(value).replace(/[^\x00-\x7F]/g, (character) => (
    `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`
  ));
}

/**
 * 检查可执行文件或 PATH 命令是否存在。
 * @param {string} command 命令或文件路径
 * @param {string} platform Node 平台标识
 * @param {object} env 子进程环境变量
 * @returns {boolean} 命令是否可解析
 */
export function isCommandAvailable(command, platform, env) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  if (pathApi.isAbsolute(command) || command.includes('/') || command.includes('\\')) {
    return existsSync(command);
  }
  const pathValue = platform === 'win32' ? (env.PATH || env.Path || '') : (env.PATH || '');
  const pathEntries = pathValue.split(platform === 'win32' ? ';' : ':').filter(Boolean);
  const extensions = platform === 'win32'
    ? ((env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';'))
    : [''];
  const hasExtension = pathApi.extname(command).length > 0;
  const candidates = hasExtension ? [command] : extensions.map((extension) => `${command}${extension}`);
  return pathEntries.some((directory) => candidates.some((candidate) => existsSync(pathApi.join(directory, candidate))));
}

/**
 * 选择 ACP MCP 通道并调用子进程，返回其输出和退出码。
 * @param {object} payload delegate_task 请求
 * @param {object} [options] 平台、环境及子进程依赖
 * @param {string} [options.platform] Node 平台标识
 * @param {object} [options.env] 子进程环境变量
 * @param {Function} [options.spawnSyncImpl] 子进程执行器
 * @param {Function} [options.commandAvailable] 命令存在性检查器
 * @returns {{ status: number, stdout: string, stderr: string }} 执行结果
 */
export function dispatchRequest(payload, {
  platform = process.platform,
  env = process.env,
  spawnSyncImpl = spawnSync,
  commandAvailable = isCommandAvailable,
} = {}) {
  const asciiJson = serializeAsciiJson(payload);
  let command;
  let args;
  let input = asciiJson;
  const childEnv = { ...env };

  if (platform === 'win32') {
    if (!env.T3_ACP_MCP_CALL) {
      return { status: 2, stdout: '', stderr: '未检测到 T3_ACP_MCP_CALL；拒绝静默降级。\n' };
    }
    command = env.T3_ACP_MCP_CALL;
    args = ['delegate_task', '-'];
  } else if (env.T3_ACP_MCP_CALL) {
    command = env.T3_ACP_MCP_CALL;
    args = ['delegate_task', '-'];
  } else if (env.T3_ACP_MCP_NODE) {
    childEnv.ELECTRON_RUN_AS_NODE = '1';
    if (env.T3_ACP_MCP_ENTRYPOINT) {
      command = env.T3_ACP_MCP_NODE;
      args = [env.T3_ACP_MCP_ENTRYPOINT, 'delegate_task', asciiJson];
    } else {
      command = 'acp-mcp-call';
      args = ['delegate_task', asciiJson];
    }
    input = undefined;
  } else {
    return { status: 2, stdout: '', stderr: '未检测到可用 ACP MCP 环境；拒绝静默降级。\n' };
  }

  if (!commandAvailable(command, platform, childEnv)) {
    return { status: 3, stdout: '', stderr: 'ACP MCP 可执行文件不存在或无法解析。\n' };
  }
  if (platform !== 'win32' && env.T3_ACP_MCP_ENTRYPOINT && !existsSync(env.T3_ACP_MCP_ENTRYPOINT)) {
    return { status: 3, stdout: '', stderr: 'T3_ACP_MCP_ENTRYPOINT 指向的文件不存在。\n' };
  }

  const result = spawnSyncImpl(command, args, {
    input,
    encoding: 'utf8',
    env: childEnv,
    shell: platform === 'win32' && /\.(cmd|bat)$/i.test(command),
  });
  if (result.error) {
    const status = result.error.code === 'ENOENT' || result.error.code === 'ENOTDIR' ? 3 : 1;
    return { status, stdout: '', stderr: status === 3 ? 'ACP MCP 可执行文件不存在或无法解析。\n' : 'ACP MCP 子进程启动失败。\n' };
  }
  return {
    status: Number.isInteger(result.status) ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/**
 * 返回命令行帮助文本。
 * @returns {string} 用法说明
 */
function helpText() {
  return [
    '用法: node delegate-t3-task.mjs --task <文本> [选项]',
    '选项: --plan --scheme --title --provider --model --reasoning-effort --service-tier',
    '      --isolation --mode --role --interaction-mode --runtime-mode --client-request-id',
    '      --dry-run --list-schemes --help',
  ].join('\n');
}

/**
 * 执行委派器 CLI。
 * @param {string[]} args 命令行参数
 * @returns {number} 进程退出码
 */
export function runCli(args) {
  try {
    const options = parseArgs(args);
    if (options.help) {
      process.stdout.write(`${helpText()}\n`);
      return 0;
    }
    const registry = loadSchemeRegistry();
    if (options.listSchemes) {
      const schemes = registry.schemes.map(({ code, id, name, summary }) => ({ code, id, name, summary }));
      process.stdout.write(`${JSON.stringify(schemes, null, 2)}\n`);
      return 0;
    }
    const payload = buildTaskPayload(options, registry);
    if (options.dryRun) {
      process.stdout.write(`${serializeAsciiJson(payload)}\n`);
      return 0;
    }
    const result = dispatchRequest(payload);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    return result.status;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runCli(process.argv.slice(2));
}
