# 列出当前项目菜单表格中的 routePath
# 用法: .\scripts\extract-route-paths.ps1 [-Profile local-subapp] [-Project test0415]

param(
    [string]$Profile = "local-subapp",
    [string]$Project = ""
)

. (Join-Path $PSScriptRoot "Load-MenuUxConfig.ps1") -Profile $Profile
$Session = $MenuUxSession

opencli browser $Session open $MenuUxMenuUrl 2>&1 | Out-Null
Start-Sleep -Seconds 2

if ($Project) {
    opencli browser $Session click --css ".project-select .el-select" 2>&1 | Out-Null
    Start-Sleep -Seconds 1
    opencli browser $Session click --role option --name $Project 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}

$js = @'
JSON.stringify([...document.querySelectorAll('table tbody tr')].map(r=>{
  const tds=[...r.querySelectorAll('td')];
  return (tds[2]?.innerText||'').trim();
}).filter(Boolean))
'@

Write-Host "session=$Session project=${Project:-<current>} paths:"
opencli browser $Session eval $js
