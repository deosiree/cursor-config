#!/usr/bin/env sh
# Called from .cursor husky pre-commit (Git Bash on Windows OK).
set -e
ROOT="$(git rev-parse --show-toplevel)"
exec node "$ROOT/vue-skills/表单校验-规则工厂formRules/scripts/pre-commit-skill-samples.js"
