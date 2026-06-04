#!/usr/bin/env bash
# E2E 入口（PowerShell 主脚本在 Windows 上更稳；本脚本转调 pwsh）
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec pwsh -NoProfile -File "${SCRIPT_DIR}/run-e2e.ps1" "$@"
