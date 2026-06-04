# 菜单路由路径按项目判重 — PowerShell 版（TC1~TC3）
# 用法: .\scripts\menu-route-dup-check.ps1 [-Profile local-subapp]

param(
    [string]$Profile = "local-subapp"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Load-MenuUxConfig.ps1") -Profile $Profile
$Session = $MenuUxSession

function Invoke-Oc([string[]]$Args) {
    $out = & opencli browser $Session @Args 2>&1
    if ($LASTEXITCODE -ne 0) { throw ($out -join "`n") }
    return ($out -join "`n")
}

function Get-FormErrors {
    $js = @'
(() => {
  const overlay = [...document.querySelectorAll('.el-overlay')].find(o => getComputedStyle(o).display === 'block');
  const dlg = overlay?.querySelector('.el-dialog');
  if (!dlg) return JSON.stringify({ ok: false, errors: [] });
  const errors = [...dlg.querySelectorAll('.el-form-item__error')].map(e => e.textContent.trim()).filter(Boolean);
  return JSON.stringify({ ok: true, errors });
})()
'@
    $raw = Invoke-Oc eval $js
    if ($raw -match '\{.*\}') { return ($Matches[0] | ConvertFrom-Json) }
    return @{ ok = $false; errors = @() }
}

function Select-Project([string]$Name) {
    Write-Host "`n==> [project] 切换项目: $Name"
    Invoke-Oc click --css ".project-select .el-select" | Out-Null
    Start-Sleep -Seconds 1
    try {
        Invoke-Oc click --role option --name $Name | Out-Null
    } catch {
        $js = "(() => { const o=[...document.querySelectorAll('[role=option]')].find(x=>x.innerText.includes('$Name')); if(o){o.click();return 'ok';} return 'fail'; })()"
        Invoke-Oc eval $js | Out-Null
    }
    Start-Sleep -Seconds 2
}

function Open-AddDialog {
    $js = "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='新增'); if(b){b.click();return 'ok';} return 'fail'; })()"
    Invoke-Oc eval $js | Out-Null
    Invoke-Oc wait text "路由路径" --timeout 15000 | Out-Null
    Start-Sleep -Seconds 1
}

function Open-EditDialogByRoutePath([string]$Path) {
    Write-Host "`n==> [dialog] 编辑 routePath=$Path"
    $escaped = $Path -replace "'", "\'"
    $js = @"
(() => {
  const path = '$escaped';
  const rows = [...document.querySelectorAll('table tbody tr')];
  const row = rows.find(r => [...r.querySelectorAll('td')].some(td => (td.innerText || '').trim() === path));
  if (!row) return JSON.stringify({ ok: false, reason: 'row-not-found' });
  const edit = [...row.querySelectorAll('button, .el-button, span')].find(
    el => (el.innerText || '').replace(/\s+/g, '').trim() === '编辑'
      && el.closest('button, .el-button, [role=button]')
  );
  const clickTarget = edit?.closest('button, .el-button, [role=button]') || edit;
  if (!clickTarget) {
    const more = [...row.querySelectorAll('button')].find(b => /更多/.test(b.innerText || ''));
    if (more) {
      more.click();
      const item = [...document.querySelectorAll('.el-dropdown-menu__item')].find(el => (el.innerText || '').trim() === '编辑');
      if (item) { item.click(); return JSON.stringify({ ok: true, mode: 'dropdown' }); }
    }
    return JSON.stringify({ ok: false, reason: 'edit-not-found' });
  }
  clickTarget.click();
  return JSON.stringify({ ok: true, mode: 'direct' });
})()
"@
    $raw = Invoke-Oc eval $js
    if ($raw -notmatch '"ok":\s*true') { throw "未能打开编辑弹窗: $raw" }
    Invoke-Oc wait text "路由路径" --timeout 15000 | Out-Null
    Start-Sleep -Seconds 1
}

function Blur-RoutePath {
    Invoke-Oc click "input[maxlength='64']" | Out-Null
    Start-Sleep -Seconds 4
}

function Fill-RoutePathTest([string]$Name, [string]$Path) {
    Invoke-Oc fill "input[placeholder='请输入名称']" $Name | Out-Null
    Invoke-Oc fill "input[maxlength='64']" $Path | Out-Null
    Blur-RoutePath
}

function Assert-NoDupError([string]$Tag) {
    $e = Get-FormErrors
    $joined = $e.errors -join " "
    if ($joined | Select-String -SimpleMatch $MenuUxDupError) {
        throw "${Tag} 失败：不应出现「$MenuUxDupError」，实际: $joined"
    }
    Write-Host "${Tag} PASS"
}

Write-Host "==> [0] session=$Session profile=$Profile menu=$MenuUxMenuUrl"
Invoke-Oc open $MenuUxMenuUrl | Out-Null
Start-Sleep -Seconds 2

# TC1
Write-Host "`n==> [TC1] $MenuUxProjectDup 同项目重复"
Select-Project $MenuUxProjectDup
Open-AddDialog
Fill-RoutePathTest "dupps1" $MenuUxRoutePath
$e1 = Get-FormErrors
if (-not ($e1.errors -join " " | Select-String -SimpleMatch $MenuUxDupError)) {
    throw "TC1 失败：未出现「$MenuUxDupError」，实际: $($e1.errors -join ', ')"
}
Write-Host "TC1 PASS"
Invoke-Oc keys Escape | Out-Null
Start-Sleep -Seconds 1

# TC2
Write-Host "`n==> [TC2] $MenuUxProjectCross 跨项目允许"
Select-Project $MenuUxProjectCross
Open-AddDialog
Fill-RoutePathTest "dupps2" $MenuUxRoutePath
Assert-NoDupError "TC2"
Invoke-Oc keys Escape | Out-Null
Start-Sleep -Seconds 1

# TC3
Write-Host "`n==> [TC3] $MenuUxProjectDup 编辑自身"
Select-Project $MenuUxProjectDup
Open-EditDialogByRoutePath $MenuUxRoutePath
Blur-RoutePath
Assert-NoDupError "TC3"
Invoke-Oc keys Escape | Out-Null

Write-Host "`nPowerShell E2E 完成 (TC1~TC3, session=$Session)"
