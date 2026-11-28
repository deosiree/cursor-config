import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const legacyIntegration = ["cursor", "agent"].join("-");

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8"));
}

test("Spec Kit metadata defaults to the agent-neutral integration", () => {
  const integration = readJson(".specify/integration.json");
  const initOptions = readJson(".specify/init-options.json");

  assert.equal(integration.default_integration, "none");
  assert.equal(integration.integration, "none");
  assert.equal(initOptions.integration, "none");
  assert.ok(integration.installed_integrations.includes("none"));
});

test("uninstalled integration metadata is absent while existing skill files stay intact", () => {
  const integration = readJson(".specify/integration.json");
  const cursorManifest = resolve(
    repoRoot,
    ".specify/integrations",
    `${legacyIntegration}.manifest.json`
  );
  const existingSkills = [
    ".cursor/skills/speckit-analyze/SKILL.md",
    ".cursor/skills/speckit-plan/SKILL.md",
    ".cursor/skills/speckit-specify/SKILL.md"
  ];

  assert.ok(!integration.installed_integrations.includes(legacyIntegration));
  assert.ok(!(legacyIntegration in integration.integration_settings));
  assert.equal(existsSync(cursorManifest), false);
  assert.ok(existingSkills.every((skill) => existsSync(resolve(repoRoot, skill))));
});

test("local workflow state and catalog caches are ignored by Git", () => {
  for (const path of [
    ".specify/workflows/runs/__test__/state.json",
    ".specify/integrations/.cache/__test__.json"
  ]) {
    execFileSync("git", ["check-ignore", "--no-index", "--quiet", path], {
      cwd: repoRoot,
      stdio: "ignore"
    });
  }
});

test("Issue PR Loop evaluation assets are valid JSON", () => {
  for (const path of [
    "git-skills/issue-pr-loop/evals/evals.json",
    "git-skills/issue-pr-loop/test-prompts.json",
    "git-skills/issue-pr-loop/trigger-tests.json"
  ]) {
    assert.doesNotThrow(() => readJson(path), path);
  }
});
