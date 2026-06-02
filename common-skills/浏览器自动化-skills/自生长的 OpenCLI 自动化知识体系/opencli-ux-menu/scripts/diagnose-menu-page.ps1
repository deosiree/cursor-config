# 菜单管理页诊断
# 用法: .\scripts\diagnose-menu-page.ps1 [-Profile local-subapp]

param(
    [string]$Profile = "local-subapp"
)

. (Join-Path $PSScriptRoot "Load-MenuUxConfig.ps1") -Profile $Profile
$Session = $MenuUxSession

function Oc([string[]]$Args) { opencli browser $Session @Args 2>&1 }

Write-Host "=== 菜单页诊断 session=$Session profile=$Profile ===" -ForegroundColor Cyan
Write-Host "MENU_URL: $MenuUxMenuUrl"
Oc open $MenuUxMenuUrl | Out-Null
Start-Sleep -Seconds 2

Write-Host "`n--- URL ---"
Oc get url

Write-Host "`n--- 当前项目 ---"
Oc eval "(() => (document.querySelector('.project-select .el-select__selected-item span')?.textContent || '').trim())()"

Write-Host "`n--- 表格 routePath（前 20 条）---"
$pathsJs = @'
JSON.stringify([...document.querySelectorAll('table tbody tr')].slice(0,20).map(r=>{
  const tds=[...r.querySelectorAll('td')];
  return { name: tds[0]?.innerText?.trim(), type: tds[1]?.innerText?.trim(), routePath: tds[2]?.innerText?.trim() };
}))
'@
Oc eval $pathsJs

Write-Host "`n--- 可见弹窗 ---"
$dlgJs = @'
(() => {
  const overlay = [...document.querySelectorAll('.el-overlay')].find(o => getComputedStyle(o).display === 'block');
  const dlg = overlay?.querySelector('.el-dialog');
  if (!dlg) return JSON.stringify({ visible: false });
  return JSON.stringify({
    visible: true,
    title: dlg.querySelector('.el-dialog__title')?.innerText?.trim(),
    errors: [...dlg.querySelectorAll('.el-form-item__error')].map(e => e.textContent.trim())
  });
})()
'@
Oc eval $dlgJs

Write-Host "`n--- opencli doctor ---"
opencli doctor

Write-Host "`n诊断完成。失败时可: opencli browser $Session screenshot screenshots/diag.png"
