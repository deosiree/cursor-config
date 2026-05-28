"use strict";

const fs = require("fs");
const path = require("path");

const SKILL_ROOT = path.join(__dirname, "..");

function readManifest() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "template-sync.manifest.json"), "utf8"));
}

function readSource(manifest) {
  return fs.readFileSync(path.join(SKILL_ROOT, manifest.source), "utf8");
}

function normalizeForCompare(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findBalanced(source, openIndex, openChar, closeChar) {
  let depth = 1;
  let i = openIndex + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === openChar) depth++;
    else if (ch === closeChar) depth--;
    i++;
  }
  return i;
}

function skipTemplateLiteral(source, start) {
  let i = start + 1;
  while (i < source.length) {
    if (source[i] === "\\") {
      i += 2;
      continue;
    }
    if (source[i] === "`") return i + 1;
    i++;
  }
  throw new Error("Unterminated template literal");
}

function extractFromIndex(source, startIndex) {
  const head = source.slice(startIndex, startIndex + 80);

  if (/^\s*export\s+type\b/.test(head) || /^\s*type\b/.test(head)) {
    const semi = source.indexOf(";", startIndex);
    if (semi === -1) throw new Error("Unterminated type near " + startIndex);
    return source.slice(startIndex, semi + 1);
  }

  if (/^\s*export\s+interface\b/.test(head) || /^\s*interface\b/.test(head)) {
    const brace = source.indexOf("{", startIndex);
    if (brace === -1) throw new Error("No interface body near " + startIndex);
    const end = findBalanced(source, brace, "{", "}");
    return source.slice(startIndex, end);
  }

  if (/^\s*export\s+function\b/.test(head) || /^\s*function\b/.test(head)) {
    const brace = source.indexOf("{", startIndex);
    if (brace === -1) throw new Error("No function body for " + startIndex);
    const end = findBalanced(source, brace, "{", "}");
    return source.slice(startIndex, end);
  }

  const eq = source.indexOf("=", startIndex);
  if (eq === -1) throw new Error("No = for const near " + startIndex);
  let i = eq + 1;
  while (i < source.length && /\s/.test(source[i])) i++;

  if (source[i] === "{") {
    const end = findBalanced(source, i, "{", "}");
    let j = end;
    while (j < source.length && source[j] !== ";") j++;
    return source.slice(startIndex, j + 1);
  }

  if (source[i] === "`") {
    i = skipTemplateLiteral(source, i);
    while (i < source.length && source[i] !== ";") i++;
    return source.slice(startIndex, i + 1);
  }

  while (i < source.length && source[i] !== ";") i++;
  return source.slice(startIndex, i + 1);
}

function indexOfDeclaration(source, name, kind) {
  const tries = [];
  if (kind === "exportType") {
    tries.push(`export type ${name}`);
    tries.push(`export interface ${name}`);
  }
  if (kind === "type") tries.push(`type ${name}`);
  if (kind === "exportConst") tries.push(`export const ${name}`);
  if (kind === "const") tries.push(`const ${name}`);
  if (kind === "exportFunction") tries.push(`export function ${name}`);
  if (kind === "function") tries.push(`function ${name}`);

  for (const needle of tries) {
    let idx = 0;
    while (true) {
      const at = source.indexOf(needle, idx);
      if (at === -1) break;
      const before = source[at - 1];
      if (at === 0 || /[\s;(}]/.test(before)) {
        let start = at;
        const lineStart = source.lastIndexOf("\n", at) + 1;
        const prefix = source.slice(lineStart, at);
        const docEnd = prefix.lastIndexOf("*/");
        if (docEnd !== -1 && !prefix.slice(docEnd + 2).trim()) {
          const docStart = source.lastIndexOf("/**", at);
          if (docStart >= lineStart - 200 && docStart < at) start = docStart;
        }
        return start;
      }
      idx = at + 1;
    }
  }
  throw new Error(`Declaration not found: ${name} (${kind})`);
}

function extractSymbol(source, name, kind) {
  const start = indexOfDeclaration(source, name, kind);
  return extractFromIndex(source, start).trim();
}

function buildFragmentBody(source, fragmentConfig) {
  return fragmentConfig.symbols
    .map((sym) => extractSymbol(source, sym.name, sym.kind))
    .join("\n\n");
}

function buildFragmentFile(source, fragmentName, fragmentConfig) {
  const header = [
    "/**",
    " * AUTO-GENERATED from formRules.ts — do not edit.",
    " * Regenerate: node scripts/extract-fragments.js",
    " */",
    ...fragmentConfig.imports,
    "",
  ].join("\n");

  return header + buildFragmentBody(source, fragmentConfig) + "\n";
}

function extractFragmentBlocks(source, manifest) {
  const blocks = {};
  for (const [fileName, config] of Object.entries(manifest.fragments)) {
    blocks[fileName] = buildFragmentBody(source, config);
  }
  return blocks;
}

function readFragmentBody(fragmentPath) {
  const raw = fs.readFileSync(fragmentPath, "utf8");
  const endHeader = raw.indexOf("*/");
  if (endHeader === -1) throw new Error("No header in " + fragmentPath);
  let body = raw.slice(endHeader + 2).trim();
  const importsEnd = body.lastIndexOf('from "@/i18n";');
  if (importsEnd !== -1) {
    body = body.slice(importsEnd + 'from "@/i18n";'.length).trim();
  }
  return body;
}

module.exports = {
  SKILL_ROOT,
  readManifest,
  readSource,
  normalizeForCompare,
  extractSymbol,
  buildFragmentFile,
  buildFragmentBody,
  extractFragmentBlocks,
  readFragmentBody,
};
