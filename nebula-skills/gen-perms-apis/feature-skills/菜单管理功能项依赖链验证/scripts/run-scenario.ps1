# 菜单管理 E2E — 单场景执行 (PowerShell)
# 用法: .\run-scenario.ps1 scenarios\01-only-import.json
param(
  [Parameter(Mandatory=$true)] [string]$ScenarioFile,
  [string]$Admin = "p2ejw7ww",
  [string]$Test  = "q5prwymq",
  [string]$Base  = "http://localhost:8080"
)

$scenario = Get-Content $ScenarioFile -Raw -Encoding UTF8 | ConvertFrom-Json
$checks = $scenario.check
Write-Host "`n=== $($scenario.id) $($scenario.title) ===" -ForegroundColor Cyan

# Step 0
Write-Host "📋 Step 0" -ForegroundColor Green
cmd /c "opencli --profile $Admin browser admin open $Base/cloud/Apex/system/role 2>&1"
Start-Sleep 3
$e1 = 'var rows=document.querySelectorAll("table tbody tr");for(var i=0;i<rows.length;i++){if(rows[i].textContent.includes("权限测试角色")){rows[i].querySelector("[data-op-label=\""编辑\""]").click();break;}}"done"'
cmd /c "opencli --profile $Admin browser admin eval `"$e1`" 2>&1"
Start-Sleep 2
$e2 = 'var ts=document.querySelectorAll(".el-tabs__item");for(var i=0;i<ts.length;i++){if(ts[i].textContent.trim()==="菜单权限"){ts[i].click();break;}}"tab"'
cmd /c "opencli --profile $Admin browser admin eval `"$e2`" 2>&1"
Start-Sleep 2
# 找搜索框 ref
$e3 = 'var inps=document.querySelectorAll("*");var idx=0;for(var i=0;i<inps.length;i++){if(inps[i].placeholder==="请输入关键字进行搜索"){idx=i;break;}}JSON.stringify({ref:idx})'
$sr = cmd /c "opencli --profile $Admin browser admin eval `"$e3`" 2>&1"
Write-Host "  findRef: $sr"
$ref = 0; try { $ref = ($sr | ConvertFrom-Json).ref } catch {}
if ($ref -eq 0) { Write-Host "❌ 搜索框未找到" -ForegroundColor Red; exit 1 }
cmd /c "opencli --profile $Admin browser admin type $ref 菜单管理 2>&1"
Start-Sleep 1
$e4 = 'var ls=document.querySelectorAll(".node-label");for(var i=0;i<ls.length;i++){if(ls[i].textContent.trim()==="菜单管理"){ls[i].click();break;}}"node"'
cmd /c "opencli --profile $Admin browser admin eval `"$e4`" 2>&1"
cmd /c "opencli --profile $Admin browser admin wait selector .el-checkbox__label 2>&1"
Write-Host "  ✅ 弹窗就绪" -ForegroundColor Green

# Step 2a: 清空
Write-Host "🧹 2a:清空" -ForegroundColor Green
cmd /c "opencli --profile $Admin browser admin eval `"var btns=document.querySelectorAll('#pane-permission button');btns[3].click();'cleared'`" 2>&1"

# Step 2b: 勾选
Write-Host "☑️  2b:勾选" -ForegroundColor Green
$tj = ($checks | ConvertTo-Json -Compress)
$e5 = "var targets=$tj;var labels=document.querySelectorAll(`".el-dialog__body .el-checkbox__label`");for(var i=0;i<labels.length;i++){var t=labels[i].textContent.trim();if(targets.indexOf(t)!==-1){labels[i].closest(`".el-checkbox`").click();}}`"checked`""
cmd /c "opencli --profile $Admin browser admin eval `"$e5`" 2>&1"

# Step 2c: 验证 + 保存
Write-Host "💾 2c:保存" -ForegroundColor Green
$e6 = 'var inps=document.querySelectorAll(".el-dialog__body input[type=checkbox]");var s={};for(var i=0;i<inps.length;i++){var t=inps[i].parentElement.parentElement.textContent.trim();if(t.match(/菜单|API/))s[t]=inps[i].checked;};JSON.stringify(s)'
$state = cmd /c "opencli --profile $Admin browser admin eval `"$e6`" 2>&1"
Write-Host "  state: $state"
$e7 = 'var btns=document.querySelectorAll("button");for(var i=0;i<btns.length;i++){if(btns[i].offsetParent!==null&&btns[i].textContent.trim()==="确 定"){btns[i].click();break;}}"saved"'
cmd /c "opencli --profile $Admin browser admin eval `"$e7`" 2>&1"
Start-Sleep 3
$e8 = 'var d=document.querySelector(".el-dialog");d&&d.offsetParent!==null?"open":"closed"'
$dlg = cmd /c "opencli --profile $Admin browser admin eval `"$e8`" 2>&1"
Write-Host "  dialog: $dlg"

# Step 4: Test 退出重登
Write-Host "🔄 Step 4:Test退出重登" -ForegroundColor Green
$L1 = 'var u=document.querySelector("[id*=\""el-id\""][role=button][aria-haspopup=menu]");if(u)u.click();var ms=document.querySelectorAll("[role=menuitem]");for(var i=0;i<ms.length;i++){if(ms[i].textContent.trim()==="退出登录"){ms[i].click();break;}}"logout"'
cmd /c "opencli --profile $Test browser test eval `"$L1`" 2>&1"
Start-Sleep 1
cmd /c "opencli --profile $Test browser test eval `"var b=document.querySelector('.el-message-box__btns .el-button--primary');if(b)b.click();'confirmed'`" 2>&1"
Start-Sleep 4
Write-Host "  📝 登录"
cmd /c "opencli --profile $Test browser test fill `"input[placeholder*=`"手机号`"]`" 13813815913 2>&1"
cmd /c "opencli --profile $Test browser test fill `"input[placeholder*=`"密码`"]`" 123456 2>&1"
$stateOut = cmd /c "opencli --profile $Test browser test state 2>&1"
if ($stateOut -match '\[(\d+)\].*登录') { cmd /c "opencli --profile $Test browser test click $($matches[1]) 2>&1" }
else { cmd /c "opencli --profile $Test browser test eval `"var lb=Array.from(document.querySelectorAll('button span')).find(function(s){return s.textContent.trim()==='登录'});if(lb)lb.parentElement.click();'clicked'`" 2>&1"}
Start-Sleep 4

# Step 5: 验证
Write-Host "✅ Step 5:验证" -ForegroundColor Green
cmd /c "opencli --profile $Test browser test open $Base/cloud/Apex/system/menu 2>&1"
Start-Sleep 3
$V1 = 'var ui=JSON.parse(sessionStorage.getItem("userInfo")||"{}");var btns=Array.from(document.querySelectorAll(".action-buttons .el-button")).map(function(b){return b.textContent.trim()+(b.offsetParent!==null?":VIS":":hid")});JSON.stringify({perms:ui.perms,btns:btns})'
$verify = cmd /c "opencli --profile $Test browser test eval `"$V1`" 2>&1"
Write-Host "  verify: $verify" -ForegroundColor Cyan

# 对比
$ep = $scenario.expectedPerms; $eb = $scenario.expectToolbar
try {
  $v = $verify | ConvertFrom-Json
  $hp = ($ep | % { $v.perms -contains $_ }) -notcontains $false
  $hb = ($eb | % { $v.btns -contains $_ }) -notcontains $false
  if ($hp -and $hb) { Write-Host "`n🏁 PASS" -ForegroundColor Green }
  elseif (-not $hp) { Write-Host "`n🏁 FAIL expected=$ep got=$($v.perms -join ',')" -ForegroundColor Red }
  else { Write-Host "`n🏁 CHECK" -ForegroundColor Yellow }
} catch {
  Write-Host "`n🏁 PARSE_ERR: $_" -ForegroundColor Red
}
