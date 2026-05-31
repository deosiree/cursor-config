#!/usr/bin/env node

/**
 * OpenCLI-下载飞书文档 — download.js
 *
 * 通过 OpenCLI 浏览器逐页滚动提取飞书文档全文，输出为本地 Markdown 文件。
 *
 * 用法:
 *   node download.js --url "<飞书文档URL>" --out "<输出路径>"
 *
 * 参数:
 *   --url   飞书文档完整 URL（必传，无默认值）
 *   --out   输出文件路径（必传，无默认值）
 *
 * 退出码:
 *   0  完整下载成功
 *   1  参数错误 / OpenCLI 不可用 / 下载失败
 *   2  部分下载（部分虚拟页无法渲染）
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ─── 参数解析 ────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { url: null, out: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && i + 1 < args.length) {
      opts.url = args[++i];
    } else if (args[i] === "--out" && i + 1 < args.length) {
      opts.out = args[++i];
    }
  }

  if (!opts.url) {
    console.error("❌ 缺少 --url 参数");
    process.exit(1);
  }
  if (!opts.out) {
    console.error("❌ 缺少 --out 参数");
    process.exit(1);
  }

  // 解析输出路径（相对路径基于 CWD）
  opts.out = path.resolve(process.cwd(), opts.out);

  return opts;
}

// ─── Shell 辅助 ───────────────────────────────────────────

function opencli(cmd, timeoutSec = 30) {
  try {
    const result = execSync(`opencli ${cmd}`, {
      timeout: timeoutSec * 1000,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, stdout: result };
  } catch (err) {
    return { ok: false, stdout: err.stdout || "", stderr: err.stderr || err.message };
  }
}

function sleep(ms) {
  execSync(`sleep ${ms / 1000}`, { timeout: (ms / 1000) + 2 });
}

// ─── 主流程 ───────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  console.log(`🔗 飞书文档: ${opts.url}`);
  console.log(`📄 输出路径: ${opts.out}`);

  // Step 1: 打开飞书文档
  console.log("🌐 打开飞书文档...");
  const r1 = opencli(`browser open "${opts.url}"`, 15);
  if (!r1.ok) {
    console.error("❌ 无法打开飞书文档，检查浏览器登录态和 OpenCLI 连接");
    console.error(r1.stderr);
    process.exit(1);
  }
  // 等待 SPA 渲染完成
  sleep(4);

  // Step 2: 获取滚动容器参数
  console.log("📐 获取页面尺寸...");
  const r2 = opencli(
    `eval "(()=>{const el=document.querySelector('.bear-web-x-container'); if(!el) return JSON.stringify({error:'NO_CONTAINER'}); return JSON.stringify({sh:el.scrollHeight,ch:el.clientHeight});})()"`,
    10
  );
  if (!r2.ok) {
    console.error("❌ 无法获取滚动容器参数");
    process.exit(1);
  }

  let dims;
  try {
    dims = JSON.parse(r2.stdout.trim());
  } catch {
    console.error("❌ 滚动容器参数解析失败，raw:", r2.stdout.slice(0, 200));
    process.exit(1);
  }

  if (dims.error === "NO_CONTAINER") {
    console.error("❌ 未找到 .bear-web-x-container，页面结构可能已变更");
    process.exit(1);
  }

  const { sh, ch } = dims;
  const viewports = Math.ceil(sh / ch);
  console.log(`   scrollHeight=${sh}, clientHeight=${ch}, 视口数=${viewports}`);

  // Step 3: 逐页滚动 + 提取
  console.log("📥 逐页提取...");
  const fullLines = new Set();
  let partialDownload = false;

  for (let i = 0; i < viewports; i++) {
    console.log(`   第 ${i + 1}/${viewports} 页...`);

    // 滚动
    opencli(`eval "document.querySelector('.bear-web-x-container').scrollTop = ${i * ch}"`, 10);
    sleep(2);

    // 提取
    const r3 = opencli("extract", 15);
    if (!r3.ok) {
      console.warn(`   ⚠️ 第 ${i + 1} 页提取失败，跳过`);
      partialDownload = true;
      continue;
    }

    // 按行去重追加
    const lines = r3.stdout.split("\n").map((l) => l.trimEnd());
    for (const line of lines) {
      fullLines.add(line);
    }
  }

  // Step 4: 写入输出文件
  const outDir = path.dirname(opts.out);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const content = [...fullLines].join("\n");
  fs.writeFileSync(opts.out, content, "utf-8");

  const stats = fs.statSync(opts.out);
  console.log(`✅ 下载完成: ${opts.out}`);
  console.log(`   大小: ${(stats.size / 1024).toFixed(1)} KB, 行数: ${fullLines.size}`);

  if (partialDownload) {
    console.warn("⚠️ 部分页面提取失败，标记为部分下载");
    process.exit(2);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ 未预期的错误:", err.message);
  process.exit(1);
});
