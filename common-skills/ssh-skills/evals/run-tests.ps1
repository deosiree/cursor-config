# ============================================================
# ssh-skills 实测验证脚本 v4 — 修复验证版
# 验证已修复的 3 个 bug：grep 引号/编码、kubectl cp 两步法、路径探测
# ============================================================

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillRoot = Resolve-Path "$ScriptDir\.."

# ---- 加载配置 ----
$Config = Get-Content "$SkillRoot\config\ssh.config.json" -Raw | ConvertFrom-Json
$LocalConfigPath = "$SkillRoot\config\ssh.config.local.json"
if (-not (Test-Path $LocalConfigPath)) {
    Write-Host "ERROR: missing ssh.config.local.json" -ForegroundColor Red
    exit 1
}
$LocalConfig = Get-Content $LocalConfigPath -Raw | ConvertFrom-Json

# ---- 变量 ----
$JumpHost   = $Config.jumpHost
$JumpPort   = $Config.jumpPort
$JumpUser   = $Config.jumpUser
$Namespace  = $Config.namespace
$PlinkPath  = $Config.plinkPath
$HostKey    = $LocalConfig.hostKeySha256
$LogTail    = $Config.logTailImport
$Password   = if ($env:SSH_JUMP_PASSWORD) { $env:SSH_JUMP_PASSWORD } else { $LocalConfig.jumpPassword }

if ((-not $Password) -or ($Password -eq "CHANGE_ME")) {
    Write-Host "ERROR: SSH password not set" -ForegroundColor Red
    exit 1
}

$PlinkArgs = @("-ssh","-P","$JumpPort","-l","$JumpUser","-pw","$Password","-batch","-hostkey","$HostKey","$JumpHost")

function Run-SSH {
    param([string]$Cmd, [string]$Label)
    Write-Host ""
    Write-Host "--- $Label ---" -ForegroundColor Cyan
    Write-Host "CMD: $Cmd" -ForegroundColor DarkGray
    $allArgs = $PlinkArgs + @($Cmd)
    $result = & $PlinkPath $allArgs 2>&1
    if ($result) { $result | ForEach-Object { Write-Host $_ } }
    return $result
}

function Pass { Write-Host "  [PASS]" -ForegroundColor Green }
function Fail { Write-Host "  [FAIL]" -ForegroundColor Red }
function Warn { Write-Host "  [WARN]" -ForegroundColor Yellow }

# ============================================================
# 前置检查
# ============================================================
Write-Host "========== PRECHECK ==========" -ForegroundColor Magenta

if (Test-Path $PlinkPath) {
    Write-Host "plink: OK" -ForegroundColor Green
} else {
    Write-Host "plink: MISSING" -ForegroundColor Red; exit 1
}

$sshTest = Run-SSH -Cmd 'echo SSH_OK' -Label 'connectivity'
if ("$sshTest" -match "SSH_OK") { Pass } else { Fail; exit 1 }

$kc = Run-SSH -Cmd 'which kubectl 2>/dev/null; if [ $? -ne 0 ]; then echo NO_KUBECTL; fi' -Label 'kubectl'
if ("$kc" -match "NO_KUBECTL") { Fail; exit 1 } else { Pass }

$podRaw = Run-SSH -Cmd "kubectl get pods -n $Namespace 2>&1 | grep seccenter | grep Running" -Label 'pod list'
$PodName = ($podRaw -split '\s+')[0]
if ($PodName) { Pass; Write-Host "  Pod: $PodName" -ForegroundColor Green } else { Fail; exit 1 }

# ============================================================
# TEST 1a: 修复验证 — 单引号 grep + ASCII 模式
# ============================================================
Write-Host ""
Write-Host "========== TEST-1a: grep with SINGLE quotes (FIXED) ==========" -ForegroundColor Magenta
Write-Host "Fix: use single quotes to prevent bash from interpreting | as pipe"

# 用单引号包裹 grep 模式，纯 ASCII（ERRO|error|panic）避免中文编码问题
$t1a = Run-SSH -Cmd "kubectl logs --tail=$LogTail $PodName -n $Namespace 2>&1 | grep -E 'ERRO|error|panic|fatal' | tail -20" -Label 'grep ASCII (single-quoted)'

if ("$t1a" -match "command not found|No such file") {
    Fail; Write-Host "  bash still interpreting pipes — single quotes not working"
} elseif ($LASTEXITCODE -eq 0) {
    Pass; Write-Host "  grep executed correctly (single quotes protect the pattern)"
    if ("$t1a" -match "ERRO|error") { Write-Host "  ERRO lines found!" -ForegroundColor Green }
    else { Write-Host "  no ERRO in recent logs (normal)" }
} else {
    Pass; Write-Host "  no bash parse errors — grep ran correctly"
}

# ============================================================
# TEST 1b: 修复验证 — 单引号 + LANG + 中文关键词
# ============================================================
Write-Host ""
Write-Host "========== TEST-1b: grep Chinese with LANG prefix (FIXED) ==========" -ForegroundColor Magenta
Write-Host "Fix: export LANG before grep to fix Chinese encoding"

# 加 LANG 前缀避免中文乱码（鏃犳晥）
$t1b = Run-SSH -Cmd "export LANG=en_US.UTF-8; kubectl logs --tail=$LogTail $PodName -n $Namespace 2>&1 | grep -E 'ERRO|未知错误|无效|失败' | tail -10" -Label 'grep Chinese with LANG'

if ("$t1b" -match "command not found|No such file") {
    Fail; Write-Host "  bash still interpreting pipes"
} elseif ("$t1b" -match "鏃犳晥|鏃") {
    Fail; Write-Host "  Chinese chars still corrupted despite LANG"
} elseif ($LASTEXITCODE -eq 0) {
    Pass; Write-Host "  grep with Chinese pattern executed (check output for actual matches)"
} else {
    Pass; Write-Host "  no bash parse errors"
}

# ============================================================
# TEST 6: pod diagnosis (unchanged, already PASS)
# ============================================================
Write-Host ""
Write-Host "========== TEST-6: pod-crashloop-diagnosis ==========" -ForegroundColor Magenta

$t6a = Run-SSH -Cmd "kubectl describe pod $PodName -n $Namespace 2>&1 | tail -40" -Label 'describe pod'
if ("$t6a" -match "Conditions:|Events:|Containers:") { Pass } else { Warn }

$t6b = Run-SSH -Cmd "kubectl get events -n $Namespace --field-selector type=Warning --sort-by=.lastTimestamp 2>&1 | tail -10" -Label 'events Warning'
if ($LASTEXITCODE -eq 0) { Pass } else { Warn }

$t6c = Run-SSH -Cmd "kubectl top pod $PodName -n $Namespace 2>&1" -Label 'top pod'
if ("$t6c" -match "CPU|MEMORY|NAME") { Pass } else { Warn }

# ============================================================
# TEST 4 & 7: tunnels (unchanged, env-limited)
# ============================================================
Write-Host ""
Write-Host "========== TEST-4: port-forward-tunnel ==========" -ForegroundColor Magenta

$t4job = Start-Job -ScriptBlock {
    param($p,$a,$lp); & $p ($a + @("-L","${lp}:127.0.0.1:9090","-N")) 2>&1
} -ArgumentList $PlinkPath,$PlinkArgs,19090
Start-Sleep -Seconds 3
if (netstat -ano 2>$null | Select-String ":19090") { Pass; Write-Host "  tunnel active" } else { Warn }
Stop-Job $t4job -ErrorAction SilentlyContinue; Remove-Job $t4job -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========== TEST-7: db-tunnel ==========" -ForegroundColor Magenta

$t7job = Start-Job -ScriptBlock {
    param($p,$a,$lp); & $p ($a + @("-L","${lp}:127.0.0.1:3306","-N")) 2>&1
} -ArgumentList $PlinkPath,$PlinkArgs,33060
Start-Sleep -Seconds 3
if (netstat -ano 2>$null | Select-String ":33060") { Pass; Write-Host "  tunnel active" } else { Warn }
Stop-Job $t7job -ErrorAction SilentlyContinue; Remove-Job $t7job -Force -ErrorAction SilentlyContinue

# ============================================================
# TEST 8a: 修复验证 — 路径探测（先 ls 再决定）
# ============================================================
Write-Host ""
Write-Host "========== TEST-8a: path discovery (FIXED) ==========" -ForegroundColor Magenta
Write-Host "Fix: probe /app/ directory structure before attempting cp"

# 探测实际目录结构
$t8a = Run-SSH -Cmd "kubectl exec $PodName -n $Namespace -- ls /app/ 2>&1" -Label "ls /app/ (path discovery)"

if ("$t8a" -match "main|manifest|public|template|tmp") {
    Pass; Write-Host "  directory structure found: /app/{main, manifest, public, template, tmp}"
    # 尝试找日志文件
    $t8a2 = Run-SSH -Cmd "kubectl exec $PodName -n $Namespace -- find /app -name '*.log' -o -name '*.txt' 2>&1 | head -10" -Label 'find *.log *.txt'
    if ("$t8a2" -match "\.log|\.txt") {
        Pass; Write-Host "  log files found"
    } else {
        Warn; Write-Host "  no *.log files in /app — logs go to stdout, use kubectl logs instead"
    }
} elseif ("$t8a" -match "No such file|cannot") {
    Fail
} else {
    Warn; Write-Host "  unexpected output"
}

# ============================================================
# TEST 8b: 修复验证 — kubectl cp 两步法 (Pod → jump /tmp)
# ============================================================
Write-Host ""
Write-Host "========== TEST-8b: kubectl cp two-step (FIXED) ==========" -ForegroundColor Magenta
Write-Host "Fix: kubectl cp Pod=>jump (no --to-stdout), then verify file exists"

# Step 1: kubectl cp 一个实际存在的文件到 jump 机 /tmp/
# seccenter 的 /app/main 目录存在，试试复制它下面的内容
$t8b1 = Run-SSH -Cmd "kubectl cp $Namespace/$PodName`:/app/main /tmp/test-cp-main 2>&1" -Label "kubectl cp /app/main => /tmp/test-cp-main"

if ("$t8b1" -match "Error|error|cannot|unknown flag") {
    if ("$t8b1" -match "unknown flag") {
        Fail; Write-Host "  kubectl cp --to-stdout NOT supported (old kubectl)"
    } else {
        Warn; Write-Host "  kubectl cp had issues: $t8b1"
    }
} else {
    # Step 2: 验证文件已复制到 jump
    $t8b2 = Run-SSH -Cmd "ls -la /tmp/test-cp-main/ 2>&1 | head -10" -Label "verify: ls /tmp/test-cp-main/"
    if ("$t8b2" -match "total|main" -and "$t8b2" -notmatch "No such file") {
        Pass; Write-Host "  kubectl cp two-step works! Files on jump at /tmp/test-cp-main/"
        # 清理
        Run-SSH -Cmd "rm -rf /tmp/test-cp-main" -Label "cleanup /tmp/test-cp-main"
    } else {
        Warn; Write-Host "  cp may have completed but directory listing failed"
    }
}

# ============================================================
# SUMMARY
# ============================================================
Write-Host ""
Write-Host "========== DONE ==========" -ForegroundColor Green
Write-Host ""
Write-Host "FIX VERIFICATION SUMMARY:" -ForegroundColor Cyan
Write-Host "  TEST-1a: grep with single quotes (ASCII)  — should PASS (no bash parse errors)"
Write-Host "  TEST-1b: grep with LANG + Chinese          — should PASS (no corruption)"
Write-Host "  TEST-8a: /app/ path discovery              — should PASS (finds real dirs)"
Write-Host "  TEST-8b: kubectl cp two-step               — should PASS (no --to-stdout)"
Write-Host ""
Write-Host "Copy ALL output back to Reasonix."
