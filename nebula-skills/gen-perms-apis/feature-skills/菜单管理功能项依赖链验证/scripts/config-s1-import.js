// S1: 只选导入 — admin 配置脚本
// opencli eval 直接执行本文件内容

var btns=document.querySelectorAll('#pane-permission button');
btns[3].click();  // 清空

var targets=['导入菜单'];
var labels=document.querySelectorAll('.el-dialog__body .el-checkbox__label');
for(var i=0;i<labels.length;i++){
  var t=labels[i].textContent.trim();
  if(targets.indexOf(t)!==-1){labels[i].closest('.el-checkbox').click();}
}

var inps=document.querySelectorAll('.el-dialog__body input[type=checkbox]');
var s={};
for(var i=0;i<inps.length;i++){
  var t=inps[i].parentElement.parentElement.textContent.trim();
  if(t.match(/菜单|API/))s[t]=inps[i].checked;
}
JSON.stringify(s);  // 验证状态

var btns2=document.querySelectorAll('button');
for(var i=0;i<btns2.length;i++){
  if(btns2[i].offsetParent!==null&&btns2[i].textContent.trim()==='确 定'){
    btns2[i].click();break;
  }
}
'saved'
