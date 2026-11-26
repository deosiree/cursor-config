import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  buildTaskPayload,
  dispatchRequest,
  loadSchemeRegistry,
  parseArgs,
  serializeAsciiJson,
} from './delegate-t3-task.mjs';
import {
  detectAgentEnvironment,
  loadAgentRegistry,
} from './detect-agent-env.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(SCRIPT_DIR, '../assets');

/**
 * 校验默认方案加载与参数覆盖。
 * @param {import('node:test').TestContext} testContext 当前测试上下文
 * @returns {void}
 */
function testSchemeLoading(testContext) {
  const registry = loadSchemeRegistry(ASSETS_DIR);
  assert.equal(registry.defaultSchemeId, 'plan-exec-verify-current-to-luna');
  const options = parseArgs(['--task', 'smoke', '--plan', 'plan.md', '--client-request-id', 'test-id']);
  const payload = buildTaskPayload(options, registry);
  assert.equal(payload.clientRequestId, 'test-id');
  assert.equal(payload.target.providerInstanceId, 'codex');
  assert.equal(payload.target.model, 'gpt-6-luna');
  assert.equal(payload.task.includes('plan.md'), true);
  assert.equal(payload.target.options.find((option) => option.id === 'reasoningEffort').value, 'max');
  assert.equal(payload.target.options.find((option) => option.id === 'serviceTier').value, 'priority');
  testContext.diagnostic('默认方案仍生成 Codex GPT-6 Luna max/priority 负载');
}

/**
 * 校验 Unicode JSON 的 ASCII 转义可逆。
 * @returns {void}
 */
function testUnicodeSerialization() {
  const value = { task: '中文任务 🚀', nested: ['雪', { label: '验收' }] };
  const asciiJson = serializeAsciiJson(value);
  assert.match(asciiJson, /^[\x00-\x7F]*$/);
  assert.deepEqual(JSON.parse(asciiJson), value);
}

/**
 * 校验非法 CLI 参数会在执行前被拒绝。
 * @returns {void}
 */
function testInvalidArguments() {
  assert.throws(() => parseArgs(['--task', 'smoke', '--mode', 'immediate']), /mode/);
  assert.throws(() => parseArgs(['--task']), /缺少/);
  assert.throws(() => parseArgs(['--mode', 'async']), /--task/);
}

/**
 * 校验缺失 ACP 环境与不存在的可执行文件退出码。
 * @returns {void}
 */
function testMissingEnvironmentAndExecutable() {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'muti-agents-env-'));
  try {
    const missingEnvironment = dispatchRequest({ task: 'smoke' }, { platform: 'win32', env: {} });
    assert.equal(missingEnvironment.status, 2);

    const missingExecutable = dispatchRequest({ task: 'smoke' }, {
      platform: 'win32',
      env: { T3_ACP_MCP_CALL: path.join(tempDir, 'missing.exe') },
    });
    assert.equal(missingExecutable.status, 3);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * 校验实际 mock 可执行文件收到 ASCII JSON 且透传退出码。
 * @returns {void}
 */
function testMockExecutableDispatch() {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'muti-agents-call-'));
  try {
    const readerPath = path.join(tempDir, 'mock-reader.mjs');
    const commandPath = path.join(tempDir, 'mock-acp-mcp-call.cmd');
    const nodeCommand = process.execPath.replace(/"/g, '""');
    writeFileSync(readerPath, [
      'let body = "";',
      'process.stdin.setEncoding("utf8");',
      'process.stdin.on("data", (chunk) => { body += chunk; });',
      'process.stdin.on("end", () => { process.stdout.write(body); process.exitCode = 17; });',
      '',
    ].join('\n'), 'utf8');
    writeFileSync(commandPath, [
      '@echo off',
      `"${nodeCommand}" "%~dp0mock-reader.mjs"`,
      'exit /b %errorlevel%',
      '',
    ].join('\r\n'), 'utf8');

    const expectedPayload = { task: '中文任务', clientRequestId: 'mock-id' };
    const result = dispatchRequest(expectedPayload, {
      platform: 'win32',
      env: { ...process.env, T3_ACP_MCP_CALL: commandPath },
    });
    assert.equal(result.status, 17);
    assert.deepEqual(JSON.parse(result.stdout), expectedPayload);
    assert.equal(result.stderr, '');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * 校验两份 JSON 注册表满足计划中的数据契约。
 * @param {import('node:test').TestContext} testContext 当前测试上下文
 * @returns {void}
 */
function testRegistryContracts(testContext) {
  const agents = loadAgentRegistry(ASSETS_DIR);
  const schemes = loadSchemeRegistry(ASSETS_DIR);
  assert.equal(agents.schemaVersion, '1.0.0');
  assert.equal(agents.agents.length, 1);
  assert.equal(agents.agents[0].id, 't3-code');
  assert.deepEqual(agents.agents[0].platforms, ['windows', 'darwin', 'linux']);
  assert.deepEqual(agents.agents[0].transports, [
    'native_mcp',
    'acp_mcp_call_windows',
    'acp_mcp_call_posix',
  ]);
  assert.equal(agents.unsupportedBehavior.maxRoundsWithoutProgress, 2);
  assert.equal(agents.unsupportedBehavior.forbidSilentDowngrade, true);

  assert.equal(schemes.schemaVersion, '1.0.0');
  assert.equal(schemes.defaultSchemeId, 'plan-exec-verify-current-to-luna');
  assert.deepEqual(schemes.schemes.map((scheme) => scheme.code), ['S-01', 'S-02']);
  assert.equal(new Set(schemes.schemes.map((scheme) => scheme.code)).size, schemes.schemes.length);
  assert.equal(new Set(schemes.schemes.map((scheme) => scheme.id)).size, schemes.schemes.length);
  const s01 = schemes.schemes.find((scheme) => scheme.code === 'S-01');
  const s02 = schemes.schemes.find((scheme) => scheme.code === 'S-02');
  assert.deepEqual(s01.stages.map((stage) => stage.id), ['plan', 'exec', 'verify']);
  assert.equal(s01.forbidSilentDowngrade, true);
  assert.equal(s01.sameModelPolicy, 'always-delegate');
  assert.equal(s02.id, 'plan-exec-verify-current-to-luna');
  assert.equal(s02.sameModelPolicy, 'always-delegate');
  assert.equal(s02.forbidSilentDowngrade, true);
  assert.equal(s02.stages[0].model, 'inherit-current');
  assert.equal(s02.stages[0].level, 'inherit-current');
  assert.equal(s02.stages[1].model, 'gpt-6-luna');
  assert.equal(s02.stages[1].level, 'max');
  assert.equal(s02.stages[2].model, 'inherit-current');
  assert.equal(s02.stages[2].level, 'inherit-current');
  assert.equal(s02.delegation.providerInstanceId, 'codex');
  assert.equal(s02.delegation.model, 'gpt-6-luna');
  assert.deepEqual(s02.delegation.options, [
    { id: 'reasoningEffort', value: 'max' },
    { id: 'serviceTier', value: 'priority' },
  ]);
  assert.equal(s02.delegation.isolation, 'shared');
  assert.equal(s02.delegation.mode, 'async');
  testContext.diagnostic('方案 ID、code、sameModelPolicy 与阶段配置均符合注册表契约');
}

/**
 * 运行 CLI 并捕获其退出码和标准输出。
 * @param {string[]} args 委派器命令行参数
 * @returns {{status: number | null, stdout: string, stderr: string}} 子进程结果
 */
function runCli(args) {
  const result = spawnSync(process.execPath, [resolve(SCRIPT_DIR, 'delegate-t3-task.mjs'), ...args], {
    encoding: 'utf8',
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/**
 * 校验方案列表命令同时返回 S-01 和 S-02。
 * @param {import('node:test').TestContext} testContext 当前测试上下文
 * @returns {void}
 */
function testCliListsSchemes(testContext) {
  const result = runCli(['--list-schemes']);
  assert.equal(result.status, 0, result.stderr);
  const schemes = JSON.parse(result.stdout);
  assert.deepEqual(schemes.map((scheme) => scheme.code), ['S-01', 'S-02']);
  assert.deepEqual(schemes.map((scheme) => scheme.id), [
    'plan-exec-verify-neon-luna',
    'plan-exec-verify-current-to-luna',
  ]);
  testContext.diagnostic('--list-schemes 返回 S-01 与 S-02');
}

/**
 * 校验显式选择 S-02 的 dry-run 请求负载。
 * @param {import('node:test').TestContext} testContext 当前测试上下文
 * @returns {void}
 */
function testCliBuildsS02Payload(testContext) {
  const result = runCli([
    '--scheme',
    'plan-exec-verify-current-to-luna',
    '--task',
    'S-02 smoke',
    '--plan',
    'plan.md',
    '--dry-run',
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.target.providerInstanceId, 'codex');
  assert.equal(payload.target.model, 'gpt-6-luna');
  assert.deepEqual(payload.target.options, [
    { id: 'reasoningEffort', value: 'max' },
    { id: 'serviceTier', value: 'priority' },
  ]);
  assert.equal(payload.isolation, 'shared');
  assert.equal(payload.mode, 'async');
  assert.match(payload.task, /S-02 smoke/);
  testContext.diagnostic('S-02 dry-run 负载固定为 Codex GPT-6 Luna max/priority');
}

/**
 * 校验探测结果脱敏并正确组合注册表内容。
 * @returns {void}
 */
function testEnvironmentDetectionAndRedaction() {
  const privateValues = {
    T3_ACP_MCP_CALL: 'private-call-token',
    T3_ACP_MCP_NODE: 'private-node-path',
    T3_ACP_MCP_ENTRYPOINT: 'private-entrypoint-path',
  };
  const detected = detectAgentEnvironment({
    registryDir: ASSETS_DIR,
    env: privateValues,
    platform: 'win32',
    arch: 'x64',
    nodeVersion: 'v-test',
    shell: 'pwsh',
  });
  const output = JSON.stringify(detected);
  assert.equal(detected.detectedAgent, 't3-code');
  assert.equal(detected.transportRecommendation, 'acp_mcp_call_windows');
  assert.equal(detected.signals.hasT3AcpMcpCall, true);
  assert.equal(detected.signals.hasT3AcpMcpNode, true);
  assert.equal(detected.signals.hasT3AcpMcpEntrypoint, true);
  assert.equal(detected.supportedAgents[0].id, 't3-code');
  assert.equal(detected.availableSchemes[0].id, 'plan-exec-verify-neon-luna');
  for (const secret of Object.values(privateValues)) assert.equal(output.includes(secret), false);

  const unknown = detectAgentEnvironment({ registryDir: ASSETS_DIR, env: {}, platform: 'linux' });
  assert.equal(unknown.detectedAgent, 'unknown');
  assert.equal(unknown.transportRecommendation, 'native_mcp_or_manual_confirm');
}

/**
 * 校验 POSIX 节点通道的 Electron 环境和参数选择。
 * @returns {void}
 */
function testPosixNodeFallback() {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'muti-agents-posix-'));
  try {
    const entrypoint = path.join(tempDir, 'entrypoint.mjs');
    writeFileSync(entrypoint, '', 'utf8');
    let captured;
    const env = { T3_ACP_MCP_NODE: '/mock/node', T3_ACP_MCP_ENTRYPOINT: entrypoint };
    const result = dispatchRequest({ task: 'smoke' }, {
      platform: 'linux',
      env,
      commandAvailable: () => true,
      spawnSyncImpl: (command, args, options) => {
        captured = { command, args, options };
        return { status: 0, stdout: '', stderr: '' };
      },
    });
    assert.equal(result.status, 0);
    assert.equal(captured.command, '/mock/node');
    assert.deepEqual(captured.args.slice(0, 2), [entrypoint, 'delegate_task']);
    assert.equal(captured.args[2].startsWith('{'), true);
    assert.equal(captured.options.env.ELECTRON_RUN_AS_NODE, '1');
    assert.equal(captured.options.input, undefined);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

test('loads the default scheme and applies CLI overrides', testSchemeLoading);
test('serializes Unicode as reversible ASCII JSON escapes', testUnicodeSerialization);
test('rejects invalid or incomplete CLI parameters', testInvalidArguments);
test('returns exit 2 without ACP environment and exit 3 for a missing executable', testMissingEnvironmentAndExecutable);
test('pipes JSON through a mock executable and preserves its exit code', testMockExecutableDispatch);
test('validates both registry JSON contracts', testRegistryContracts);
test('lists both registered schemes through the CLI', testCliListsSchemes);
test('builds the S-02 CLI dry-run payload', testCliBuildsS02Payload);
test('detects environment signals without exposing their values', testEnvironmentDetectionAndRedaction);
test('selects the POSIX node fallback and sets Electron mode', testPosixNodeFallback);
