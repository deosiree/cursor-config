# -*- coding: utf-8 -*-
"""生成 menu.cases.json 与 login.cases.json（v3 计划）。"""
from __future__ import annotations

import json
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parent.parent
CONFIGS = SKILL_ROOT / "configs"

MENU_ENV = "测试环境；路由 /Apex/system/menu"
MICROFB_ENV = "测试环境；基座 microfb :8080"
LOGIN_ENV = "测试环境；基座 microfb :8080；路由 /login"


def c(
    name: str,
    feature_set: str,
    precondition: str,
    steps: str,
    expected: str,
    *,
    direction: str = "正向",
    sort_order: int = 1,
    env: str | None = None,
    purpose: str = "",
    remark: str = "",
    level: int = 0,
) -> dict:
    row: dict = {
        "name": name,
        "featureSet": feature_set,
        "direction": direction,
        "level": level,
        "precondition": precondition,
        "steps": steps,
        "expected": expected,
        "reserve1": "ui",
        "sortOrder": sort_order,
    }
    if env:
        row["env"] = env
    if purpose:
        row["purpose"] = purpose
    if remark:
        row["remark"] = remark
    return row


MENU_DEFAULTS = {
    "标签": "1",
    "执行方式": "4",
    "最新结果": "0",
    "创建人员": "惠岩",
    "子系统": "17",
    "模块名": "菜单管理界面",
    "重试次数": "0",
    "超时时间": "60",
    "审核状态": "0",
    "修改时间": "1970/1/1 0:00",
    "自测结果": "0",
    "支持系统": "0",
}

LOGIN_DEFAULTS = {**MENU_DEFAULTS, "模块名": "登录界面"}


def build_menu_cases() -> list[dict]:
    cases: list[dict] = []
    perm_pre = "系统中已存在角色「权限测试角色」且已分配给待验证平台租户用户"

    cases.extend([
        c("菜单管理-进入页面-项目下拉与Tab正常展示", "页面加载",
          "1. 用户已登录且具备 sys:menu:query 2. microfb 8080 与 apex 子应用可用",
          "1. 进入「系统管理」>「菜单管理」\n2. 查看顶部项目下拉框\n3. 查看 Tab 区域与下方表格/空态区域",
          "1. 项目下拉框可见且已选中某一项目\n2. 存在根菜单 Tab 或空态占位\n3. 下方展示菜单树表格或「暂无菜单/未找到匹配」空态",
          env=MENU_ENV, purpose="index.vue menuTableData", sort_order=1),
        c("无 sys:menu:query 权限时不加载菜单树", "页面加载",
          "1. 用户已登录 2. perms 不含 sys:menu:query 3. 可访问菜单管理路由",
          "1. 使用无 query 权限账号进入菜单管理\n2. 观察搜索区与表格\n3. 确认页面无报错",
          "1. 关键字搜索与列设置不显示\n2. 表格无菜单数据\n3. 页面不白屏、不崩溃",
          direction="逆向", env=MENU_ENV, purpose="index.vue canQuery", sort_order=2),
        c("当前项目无根菜单时展示空态Tab", "页面加载",
          "1. 用户已登录且具备 query 2. 选择无菜单数据的项目",
          "1. 进入菜单管理\n2. 切换至无菜单的项目\n3. 观察 Tab 与内容区",
          "1. Tab 区域显示空态或无 Tab 头\n2. 内容区提示暂无菜单\n3. 不出现报错",
          direction="边界", env=MENU_ENV, sort_order=3),
        c("切换项目后Tab与表格按项目刷新", "页面加载",
          "1. 用户已登录且具备 query 2. 至少两个项目各有不同菜单树",
          "1. 记录当前 Tab/树\n2. 切换项目下拉\n3. 观察 Tab 与表格",
          "1. Tab 列表切换为新项目根菜单\n2. 表格展示新项目树\n3. 无残留上一项目数据",
          env=MENU_ENV, purpose="index.vue selectedProjectId", sort_order=4),
    ])

    perm_specs = [
        ("菜单管理-权限配置-只选导入-工具栏仅导入可见",
         "1. 工具栏「导入」可见\n2. 「搜索」「新增」「导出」不可见\n3. 树/表格未加载", "S1"),
        ("菜单管理-权限配置-只选导出-工具栏仅导出可见",
         "1. 工具栏「导出」可见\n2. 「搜索」「新增」「导入」不可见", "S2"),
        ("菜单管理-权限配置-只选新建-工具栏仅新增可见",
         "1. 工具栏「新增」可见\n2. 「搜索」「导入」「导出」不可见", "S3"),
        ("菜单管理-权限配置-只选查询-搜索可见且树加载",
         "1. 「搜索」可见\n2. 树/表格已加载\n3. 行操作无编辑/删除/权限配置", "S4"),
        ("菜单管理-权限配置-查询加新建-搜索与新增可见",
         "1. 「搜索」「新增」可见\n2. 树已加载\n3. 「导入」「导出」不可见", "S5"),
        ("菜单管理-权限配置-查询加编辑-行内编辑与权限配置可见",
         "1. 「搜索」可见，树已加载\n2. 行操作有「编辑」「权限配置」\n3. 无「删除」", "S6"),
        ("菜单管理-权限配置-查询加删除-行内仅删除可见",
         "1. 「搜索」可见，树已加载\n2. 行操作仅「删除」", "S7"),
        ("菜单管理-权限配置-查询编辑API-权限配置弹窗内API配置可见",
         "1. 行操作有「编辑」「权限配置」\n2. 弹窗内可见「API配置」\n3. 无「删除」", "S8"),
    ]
    for i, (name, expected, sid) in enumerate(perm_specs, 1):
        cases.append(c(name, "页面权限", perm_pre,
                       "1. 所有者配置「权限测试角色」菜单权限\n2. 测试用户登录\n3. 进入菜单管理\n4. 查看工具栏与行操作",
                       expected, env=MENU_ENV, remark=f"gen-perms-apis {sid}", sort_order=i))

    cases.extend([
        c("菜单管理-关键字搜索-过滤菜单树", "筛选查询",
          "1. 已登录且具备 query 2. 当前项目有菜单",
          "1. 输入已知子菜单关键字\n2. 按 Enter 或点「搜索」",
          "1. 表格仅保留命中节点及父级\n2. Tab 同步缩小", env=MENU_ENV, sort_order=1),
        c("菜单管理-清空搜索-恢复完整菜单树", "筛选查询",
          "1. 已登录 2. 已执行关键字搜索",
          "1. 点击搜索框清空\n2. 观察 Tab 与表格",
          "1. 搜索框为空\n2. Tab 与表格恢复完整", env=MENU_ENV, sort_order=2),
        c("菜单管理-搜索无匹配-显示未找到空态", "筛选查询",
          "1. 已登录且具备 query",
          "1. 输入不存在关键字\n2. 点击「搜索」",
          "1. 展示「未找到匹配的菜单」空态", direction="边界", env=MENU_ENV, sort_order=3),
        c("菜单管理-切换Tab-表格展示对应根菜单子树", "筛选查询",
          "1. 已登录 2. 至少两个根 Tab",
          "1. 点击第二个根 Tab\n2. 刷新页面",
          "1. Tab 高亮切换\n2. 刷新后仍停留上次 Tab", env=MENU_ENV, sort_order=4),
    ])

    cases.extend([
        c("菜单名称过长时表格省略且悬浮显示全称", "界面布局",
          "1. 已登录 2. 存在长名称节点",
          "1. 找到被省略的名称\n2. 鼠标悬浮",
          "1. 省略号展示\n2. tooltip 显示全称", remark="legacyId 155", env=MENU_ENV, sort_order=1),
        c("编辑菜单后列表名称更新且Tag变待刷新", "界面布局",
          "1. 已登录且具备 edit",
          "1. 编辑名称并保存\n2. 观察列表与 Tag",
          "1. 名称已更新\n2. Tag 为黄色「待刷新」且不闪白", remark="legacyId 156", env=MENU_ENV, sort_order=2),
        c("列设置可控制表格列显隐", "界面布局",
          "1. 已登录且具备 query",
          "1. 打开列设置切换列\n2. 刷新页面",
          "1. 列显隐生效\n2. 刷新后配置保留", env=MENU_ENV, sort_order=3),
        c("切换英文后Tab标签与操作列自适应", "界面布局",
          "1. 基座可切换 English",
          "1. 切换 English\n2. 进入菜单管理",
          "1. 文案为英文\n2. 操作列无严重裁切", env=MENU_ENV, sort_order=4),
        c("工具栏更多菜单含白名单导入导出入口", "界面布局",
          "1. 已登录且具备 whitelist/import/export",
          "1. 查看工具栏更多/下拉\n2. 点击各入口",
          "1. 按权限显示白名单/导入/导出\n2. 可打开对应弹窗", env=MENU_ENV, sort_order=5),
        c("树形表格可展开折叠子节点", "界面布局",
          "1. 已登录 2. 有多级菜单",
          "1. 点击展开/折叠图标",
          "1. 子节点展开折叠正常", env=MENU_ENV, sort_order=6),
    ])

    cases.extend([
        c("表格展示节点类型标签", "表格展示", "1. 已登录 2. 树含各类型节点",
          "1. 查看类型列", "1. 目录/菜单/页面/功能项可区分", env=MENU_ENV, sort_order=1),
        c("表格展示排序值列", "表格展示", "1. 已登录", "1. 查看排序列",
          "1. 排序列可见且与顺序一致", env=MENU_ENV, sort_order=2),
        c("表格展示显示状态与仅平台显示状态", "表格展示", "1. 已登录 2. 有隐藏或仅平台节点",
          "1. 查看状态列", "1. 状态可辨识", env=MENU_ENV, sort_order=3),
    ])

    cases.extend([
        c("目录变更后Tag显示待刷新", "侧栏同步", "1. 刚编辑目录或页面",
          "1. 保存后查看 Tag", "1. Tag 为黄色「待刷新」", env=MENU_ENV, sort_order=1),
        c("点击待刷新Tag同步基座侧栏变最新", "侧栏同步", "1. Tag 为待刷新",
          "1. 点击黄 Tag\n2. 查看侧栏",
          "1. Tag 变绿「最新」\n2. 侧栏与菜单一致\n3. 不跳首页", env=MENU_ENV, purpose="useMenuListRefreshState", sort_order=2),
        c("功能项变更后Tag保持最新不变黄", "侧栏同步", "1. 仅改功能项",
          "1. 保存后查看 Tag", "1. Tag 保持绿色", env=MENU_ENV, sort_order=3),
        c("编辑菜单后不自动整页刷新", "侧栏同步", "1. 已登录且具备 edit",
          "1. 编辑保存\n2. 观察是否闪白",
          "1. 列表就地更新\n2. 无整页闪白", env=MENU_ENV, sort_order=4),
    ])

    cases.extend([
        c("登录后基座侧栏展示当前角色可见菜单", "基座侧栏", "1. 已登录 microfb",
          "1. 查看左侧菜单", "1. 侧栏有菜单且可点击", env=MICROFB_ENV, sort_order=1),
        c("点击侧栏菜单进入对应子应用页面", "基座侧栏", "1. 已登录",
          "1. 点击「菜单管理」", "1. URL 变化\n2. 加载子应用页", env=MICROFB_ENV, sort_order=2),
        c("隐藏菜单不在基座侧栏展示", "基座侧栏", "1. 存在隐藏菜单节点",
          "1. 在侧栏查找该名称", "1. 侧栏不可见", direction="边界", env=MICROFB_ENV, sort_order=3),
        c("TagsView切换时侧栏激活项同步", "基座侧栏", "1. 已打开多个 Tags",
          "1. 切换 Tags 标签", "1. 侧栏高亮匹配当前路由", env=MICROFB_ENV, sort_order=4),
        c("侧栏父级菜单可展开折叠", "基座侧栏", "1. 侧栏有多级菜单",
          "1. 展开/折叠父级", "1. 子菜单正常展开折叠", env=MICROFB_ENV, sort_order=5),
        c("侧栏折叠按钮可收起展开导航", "基座侧栏", "1. 已登录",
          "1. 点击侧栏折叠按钮", "1. 侧栏收起/展开正常", env=MICROFB_ENV, sort_order=6),
    ])

    cases.extend([
        c("改目录名同步后基座侧栏名称更新", "基座菜单同步", "1. 已改目录名并点黄 Tag",
          "1. 查看侧栏名称", "1. 侧栏名称已更新", env=MICROFB_ENV, sort_order=1),
        c("角色菜单权限变更后基座侧栏与子应用按钮同步", "基座菜单同步",
          "1. 已登录子应用 2. 权限刚变更", "1. 刷新菜单\n2. 观察侧栏与按钮",
          "1. 侧栏与按钮与权限一致", remark="legacyId 421", env=MICROFB_ENV, sort_order=2),
        c("删除菜单节点同步后基座侧栏不再显示", "基座菜单同步", "1. 已删除可见菜单并同步",
          "1. 查看侧栏", "1. 被删节点不再出现", env=MICROFB_ENV, sort_order=3),
        c("全量菜单刷新后仍停留在当前页面", "基座菜单同步", "1. 在子应用某有效页",
          "1. 触发全量菜单刷新", "1. 不无故跳首页\n2. 侧栏已更新", env=MICROFB_ENV, sort_order=4),
    ])

    cases.extend([
        c("点击新增打开菜单表单弹窗", "弹窗交互", "1. 已登录且具备 add",
          "1. 点击「新增」", "1. 弹出新增表单\n2. 含类型名称父级字段", env=MENU_ENV, sort_order=1),
        c("新增目录节点提交成功", "弹窗交互", "1. 已登录且具备 add",
          "1. 新增选「目录」填必填\n2. 确定", "1. 提示成功\n2. 列表出现新目录", env=MENU_ENV, sort_order=2),
        c("新增页面节点提交成功", "弹窗交互", "1. 已登录且具备 add",
          "1. 新增选「页面」填路由\n2. 确定", "1. 提示成功\n2. 列表出现新页面", env=MENU_ENV, sort_order=3),
        c("编辑菜单节点回填并保存成功", "弹窗交互", "1. 已登录且具备 edit",
          "1. 点「编辑」\n2. 修改保存", "1. 回填正确\n2. 保存成功", env=MENU_ENV, sort_order=4),
        c("目录行添加子项父级已预选", "弹窗交互", "1. 已登录且具备 add",
          "1. 点目录「添加子项」", "1. 弹窗打开\n2. 父级已选该目录", env=MENU_ENV, sort_order=5),
        c("取消新增菜单弹窗不保存", "弹窗交互", "1. 已登录且具备 add",
          "1. 新增后点取消", "1. 弹窗关闭\n2. 无新记录", env=MENU_ENV, sort_order=6),
        c("点击权限配置打开功能项弹窗", "弹窗交互", "1. 已登录且具备 edit",
          "1. 点「权限配置」", "1. 弹窗打开\n2. 展示功能项列表", env=MENU_ENV, sort_order=7),
        c("权限配置中新增功能项成功", "弹窗交互", "1. 权限配置弹窗已开",
          "1. 新增功能项填 perm\n2. 保存", "1. 列表出现新功能项", env=MENU_ENV, sort_order=8),
        c("权限配置中删除功能项成功", "弹窗交互", "1. 弹窗已开且有测试项",
          "1. 删除测试功能项", "1. 提示成功\n2. 列表移除", env=MENU_ENV, sort_order=9),
        c("API配置弹窗绑定接口成功", "弹窗交互", "1. 已登录且具备 configApi",
          "1. 打开 API 配置\n2. 新增并保存", "1. 提示成功\n2. 列表有记录", env=MENU_ENV, sort_order=10),
        c("点击导入打开菜单导入对话框", "弹窗交互", "1. 已登录且具备 import",
          "1. 点击「导入」", "1. 打开导入对话框\n2. 可选 YAML", env=MENU_ENV, sort_order=11),
        c("导入YAML预览后确认导入", "弹窗交互", "1. 导入弹窗已开 2. 有合法 YAML",
          "1. 选文件\n2. 预览\n3. 确认", "1. 预览正常\n2. 确认后提示成功", env=MENU_ENV, sort_order=12),
        c("点击导出弹出确认并下载", "弹窗交互", "1. 已登录且具备 export",
          "1. 点「导出」\n2. 确认", "1. 弹出确认\n2. 下载或成功提示", env=MENU_ENV, sort_order=13),
        c("编辑模式类型字段不可修改", "弹窗交互", "1. 编辑已有节点",
          "1. 打开编辑查看类型", "1. 类型为禁用态", direction="边界", env=MENU_ENV, sort_order=14),
        c("新增功能项仅含权限标识字段", "弹窗交互", "1. 在权限配置内新增",
          "1. 查看表单", "1. 有权限标识\n2. 无路由路径字段", env=MENU_ENV, sort_order=15),
        c("白名单弹窗点击新增打开表单", "弹窗交互", "1. 白名单弹窗已开",
          "1. 点「新增」", "1. 打开白名单表单", env=MENU_ENV, sort_order=16),
    ])

    cases.extend([
        c("路由路径为空提交提示必填", "表单校验", "1. 新增页面",
          "1. 不填路由路径\n2. 确定", "1. 路由路径下方红字必填提示", direction="逆向", env=MENU_ENV, sort_order=1),
        c("路由路径首字符为数字或下划线校验失败", "表单校验", "1. 新增页面",
          "1. 路由以数字或_开头\n2. 确定", "1. 格式错误提示", remark="legacyId 160", env=MENU_ENV, sort_order=2),
        c("路由路径含非法字符校验失败", "表单校验", "1. 新增页面",
          "1. 输入非法字符\n2. 确定", "1. 格式错误提示", env=MENU_ENV, sort_order=3),
        c("同项目下重复路由路径提交失败", "表单校验", "1. 已存在相同 routePath",
          "1. 新增页面填重复路径\n2. 确定", "1. 唯一性错误提示\n2. 不保存", env=MENU_ENV, purpose="ensureRoutePathUnique", sort_order=4),
        c("菜单名超长校验失败", "表单校验", "1. 新增节点",
          "1. 输入超长名称\n2. 确定", "1. 名称长度错误提示", remark="legacyId 菜单名", env=MENU_ENV, sort_order=5),
        c("菜单名首字符为数字或下划线校验失败", "表单校验", "1. 新增节点",
          "1. 名称以数字或_开头", "1. 格式错误提示", env=MENU_ENV, sort_order=6),
        c("父节点隐藏时子节点显示开关灰禁", "表单校验", "1. 父节点为隐藏",
          "1. 添加子项查看显示开关", "1. 显示为否且灰禁\n2. 提示父节点已被隐藏", remark="legacyId 159", env=MENU_ENV, sort_order=7),
        c("权限标识为空提交提示必填", "表单校验", "1. 新增功能项",
          "1. 不填 perm\n2. 确定", "1. 权限标识必填提示", env=MENU_ENV, sort_order=8),
        c("父节点仅平台显示时子节点开关与父一致", "表单校验", "1. 父 isSystemOnly=true",
          "1. 添加子项查看仅平台显示", "1. 与父一致且灰禁", env=MENU_ENV, sort_order=9),
        c("i18n菜单名通过多语言输入保存", "表单校验", "1. 新增节点",
          "1. 点名称旁 i18n\n2. 填英文\n3. 保存", "1. 保存成功\n2. 切英文后展示英文名", env=MENU_ENV, sort_order=10),
    ])

    cases.extend([
        c("删除含子节点菜单后树中全部消失", "删除操作", "1. 存在含子节点的目录",
          "1. 删除父节点并确认\n2. 刷新或重进页面",
          "1. 父与子均不在树中", remark="legacyId 158 改写", env=MENU_ENV, sort_order=1),
        c("单行删除菜单确认后成功", "删除操作", "1. 已登录且具备 delete 2. 有无子节点测试项",
          "1. 点「删除」\n2. 确认", "1. 提示成功\n2. 节点消失", env=MENU_ENV, sort_order=2),
        c("删除菜单点取消不删除", "删除操作", "1. 已登录且具备 delete",
          "1. 点删除\n2. 取消", "1. 节点仍在", env=MENU_ENV, sort_order=3),
        c("删除菜单失败时提示删除菜单失败", "删除操作", "1. 后端返回删除业务错误",
          "1. 删除被引用节点\n2. 确认", "1. 提示「删除菜单失败」或业务错误", direction="异常", remark="legacyId 534", env=MENU_ENV, sort_order=4),
    ])

    cases.extend([
        c("顶级新建节点排序值为同级数加一", "排序默认值", "1. 已存在顶级菜单",
          "1. 点顶部「新建」\n2. 查看排序默认值", "1. 排序值为同级节点数+1", remark="legacyId 157-1", env=MENU_ENV, sort_order=1),
        c("目录添加子项排序值为兄弟数加一", "排序默认值", "1. 存在目录节点",
          "1. 点「添加子项」\n2. 查看排序", "1. 排序为兄弟数+1", remark="legacyId 157-2", env=MENU_ENV, sort_order=2),
        c("兄弟排序值重复时新节点排序为最大加一", "排序默认值", "1. 同级排序均为1",
          "1. 添加子项", "1. 新排序值为4（3兄弟+1）", direction="边界", remark="legacyId 157-4", env=MENU_ENV, sort_order=3),
        c("清空父级选择回退默认顶级菜单", "排序默认值", "1. 新增弹窗已开",
          "1. 选父级后点×清空", "1. 父级回退「顶级菜单」", env=MENU_ENV, sort_order=4),
    ])

    cases.extend([
        c("新建子节点继承父显示与仅平台显示状态", "级联状态", "1. 父有明确显示状态",
          "1. 添加子项查看开关", "1. 子继承父的两项状态", remark="legacyId 159-1", env=MENU_ENV, sort_order=1),
        c("父隐藏级联更新所有子为隐藏", "级联状态", "1. 父有多个子",
          "1. 编辑父设为隐藏并保存\n2. 查看子节点", "1. 所有子显示为否", remark="legacyId 159-4", env=MENU_ENV, sort_order=2),
        c("父仅平台显示级联更新子一致", "级联状态", "1. 父有子节点",
          "1. 编辑父设仅平台显示\n2. 查看子", "1. 子均为仅平台显示", remark="legacyId 159-5", env=MENU_ENV, sort_order=3),
        c("功能项不受显示与仅平台显示约束", "级联状态", "1. 在权限配置中",
          "1. 查看功能项表单", "1. 无显示/仅平台开关或不受影响", remark="legacyId 159-6", env=MENU_ENV, sort_order=4),
    ])

    wl = [
        ("菜单管理-点击白名单按钮-打开编辑白名单弹窗",
         "1. 已登录且具备 whitelist",
         "1. 点「白名单」",
         "1. 弹出「编辑白名单」\n2. 有表格与新增删除"),
        ("API白名单-新增合法路径-提交成功并刷新列表",
         "1. 白名单弹窗已开",
         "1. 新增填合法 API\n2. 确定",
         "1. 提示新增成功\n2. 列表刷新"),
        ("API白名单-新增空API路径-表单校验提示",
         "1. 白名单弹窗已开",
         "1. 新增不填 API\n2. 确定",
         "1. 提示请输入 API 路径", "逆向"),
        ("API白名单-新增非法API路径-表单校验提示",
         "1. 白名单弹窗已开",
         "1. API 不以/开头\n2. 确定",
         "1. 路径格式错误提示", "逆向"),
        ("API白名单-编辑已有记录-修改成功",
         "1. 列表有记录",
         "1. 编辑改描述\n2. 确定",
         "1. 提示修改成功"),
        ("API白名单-单行删除-确认后删除成功",
         "1. 有可删测试记录",
         "1. 点删除\n2. 确认",
         "1. 提示删除成功\n2. 记录消失"),
        ("API白名单-未勾选批量删除-提示请选择",
         "1. 白名单弹窗已开",
         "1. 不勾选点删除",
         "1. 提示请选择要删除的白名单", "逆向"),
        ("API白名单-勾选多行批量删除-确认后删除成功",
         "1. 至少两条测试记录",
         "1. 勾选两条\n2. 删除确认",
         "1. 提示删除成功\n2. 记录消失"),
    ]
    for i, item in enumerate(wl, 1):
        name, pre, steps, exp = item[0], item[1], item[2], item[3]
        d = item[4] if len(item) > 4 else "正向"
        cases.append(c(name, "API白名单", pre, steps, exp, direction=d, env=MENU_ENV, sort_order=i))

    cases.extend([
        c("无import权限时导入按钮不可见", "导入导出", "1. perms 无 import",
          "1. 进入菜单管理", "1. 无导入入口", direction="逆向", env=MENU_ENV, sort_order=1),
        c("无export权限时导出入口不可见", "导入导出", "1. perms 无 export",
          "1. 进入菜单管理", "1. 无导出入口", direction="逆向", env=MENU_ENV, sort_order=2),
        c("导入失败时提示错误信息", "导入导出", "1. 导入非法 YAML",
          "1. 选文件导入", "1. 提示导入失败或校验错误", direction="异常", env=MENU_ENV, sort_order=3),
        c("导出确认取消不下载", "导入导出", "1. 已登录且具备 export",
          "1. 点导出\n2. 取消", "1. 不触发下载", env=MENU_ENV, sort_order=4),
    ])

    cases.extend([
        c("切换英文后菜单Tab名称更新", "国际化", "1. 菜单有多语言名",
          "1. 切 English\n2. 查看 Tab", "1. Tab 显示英文名", env=MENU_ENV, sort_order=1),
        c("切换英文后基座侧栏菜单名更新", "国际化", "1. 侧栏有多语言名",
          "1. 切 English", "1. 侧栏显示英文名", env=MICROFB_ENV, sort_order=2),
        c("关键字搜索命中i18n英文名", "国际化", "1. 节点有英文名",
          "1. 切 English\n2. 搜索英文名", "1. 可搜到对应节点", env=MENU_ENV, sort_order=3),
    ])

    cases.extend([
        c("菜单加载失败时提示加载菜单数据失败", "异常处理", "1. 菜单接口业务错误",
          "1. 登录或刷新", "1. 弹出一次「加载菜单数据失败」类通知", direction="异常", remark="legacyId 419", env=MICROFB_ENV, sort_order=1),
        c("权限数据加载失败时提示加载权限数据失败", "异常处理", "1. 权限接口业务错误",
          "1. 刷新菜单相关", "1. 弹出权限加载失败通知", direction="异常", remark="legacyId 420", env=MENU_ENV, sort_order=2),
        c("创建菜单失败时提示创建菜单失败", "异常处理", "1. 创建返回业务错误",
          "1. 创建并触发错误", "1. 提示「创建菜单失败」", direction="异常", remark="legacyId 423", env=MENU_ENV, sort_order=3),
        c("更新菜单失败时提示更新菜单失败", "异常处理", "1. 更新返回业务错误",
          "1. 编辑保存触发错误", "1. 提示「更新菜单失败」", direction="异常", remark="legacyId 533", env=MENU_ENV, sort_order=4),
        c("路由数据加载失败时提示获取路由数据失败", "异常处理", "1. 路由接口错误",
          "1. 登录或刷新", "1. 提示「获取路由数据失败」", direction="异常", remark="legacyId 535", env=MICROFB_ENV, sort_order=5),
    ])

    return cases


def build_login_cases() -> list[dict]:
    cases: list[dict] = []
    sec_pre = "安全配置已启用对应策略（参见 securityConfig 模块）"

    cases.extend([
        c("登录页首屏默认展示密码登录Tab", "页面加载", "1. 未登录",
          "1. 访问 /login", "1. 展示密码登录 Tab\n2. 有账号密码输入框", env=LOGIN_ENV, sort_order=1),
        c("登录安全配置未就绪时提示", "页面加载", "1. loginSetting 未加载完成",
          "1. 访问登录页", "1. 提示「登录安全配置未就绪」或等待后可操作", direction="异常", env=LOGIN_ENV, sort_order=2),
        c("登录页移动端窄屏布局正常", "页面加载", "1. 浏览器窄屏或移动模式",
          "1. 访问 /login", "1. 表单可完整操作\n2. 无横向溢出", direction="边界", env=LOGIN_ENV, sort_order=3),
    ])

    cases.extend([
        c("正确账号密码登录成功进入首页", "密码登录", "1. 有效测试账号",
          "1. 输入账号密码\n2. 点登录", "1. 进入首个有效菜单页\n2. 无错误 toast", env=LOGIN_ENV, sort_order=1),
        c("错误密码登录失败提示", "密码登录", "1. 有效账号",
          "1. 输错密码\n2. 登录", "1. 提示登录失败\n2. 仍在登录页", direction="逆向", env=LOGIN_ENV, sort_order=2),
        c("密码登录按Enter提交", "密码登录", "1. 有效账号",
          "1. 填完按 Enter", "1. 与点击登录效果一致", env=LOGIN_ENV, sort_order=3),
        c("登录中按钮loading防重复提交", "密码登录", "1. 有效账号",
          "1. 点登录\n2. 快速连点", "1. 按钮 loading\n2. 不重复提交", env=LOGIN_ENV, sort_order=4),
    ])

    cases.extend([
        c("验证码登录Tab发送OTP成功", "验证码登录", "1. 账号已绑定手机或邮箱",
          "1. 切验证码 Tab\n2. 输入账号\n3. 点发送", "1. 提示发送成功\n2. 出现倒计时", env=LOGIN_ENV, sort_order=1),
        c("OTP倒计时期间发送按钮禁用", "验证码登录", "1. 已发送 OTP",
          "1. 观察发送按钮", "1. 倒计时内不可重复发送", env=LOGIN_ENV, sort_order=2),
        c("正确OTP验证码登录成功", "验证码登录", "1. 已收到 OTP",
          "1. 输入 OTP\n2. 登录", "1. 登录成功进入系统", env=LOGIN_ENV, sort_order=3),
        c("不存在账号发送OTP提示警告", "验证码登录", "1. 不存在的账号",
          "1. 输入并发 OTP", "1. 账号不存在类警告", direction="边界", env=LOGIN_ENV, sort_order=4),
    ])

    cases.extend([
        c("账号为空提交提示必填", "表单校验", "1. 密码 Tab",
          "1. 不填账号\n2. 登录", "1. 账号必填红字", direction="逆向", env=LOGIN_ENV, sort_order=1),
        c("密码为空提交提示必填", "表单校验", "1. 密码 Tab",
          "1. 不填密码\n2. 登录", "1. 密码必填红字", direction="逆向", env=LOGIN_ENV, sort_order=2),
        c("手机号格式错误提示", "表单校验", "1. 验证码 Tab",
          "1. 输入非法手机号", "1. 格式错误提示", direction="逆向", env=LOGIN_ENV, sort_order=3),
        c("切换语言后表单校验文案更新", "表单校验", "1. 登录页",
          "1. 切 English\n2. 空提交", "1. 错误提示为英文", env=LOGIN_ENV, sort_order=4),
    ])

    cases.extend([
        c("登录失败后显示图形验证码", "图形验证码", sec_pre + "；触发模式 on_failure",
          "1. 故意输错密码\n2. 再次登录", "1. 显示图形验证码输入框", remark="legacyId 108", env=LOGIN_ENV, sort_order=1),
        c("图形验证码输错提示并刷新", "图形验证码", "1. 已显示验证码",
          "1. 输错验证码\n2. 登录", "1. 提示验证码错误或过期\n2. 验证码图片刷新", direction="逆向", remark="legacyId 108", env=LOGIN_ENV, sort_order=2),
        c("验证码策略always时常显图形验证码", "图形验证码", "1. 安全配置 captchaEnabled=always",
          "1. 打开登录页", "1. 首屏即有验证码", env=LOGIN_ENV, sort_order=3),
        c("点击验证码图片刷新", "图形验证码", "1. 已显示验证码",
          "1. 点击验证码图", "1. 验证码图片更换", env=LOGIN_ENV, sort_order=4),
        c("跨浏览器登录失败后本浏览器也需验证码", "图形验证码", sec_pre,
          "1. 浏览器A输错密码触发阈值\n2. 浏览器B用同账号登录",
          "1. B 也显示验证码\n2. 输入正确验证码可登录", remark="legacyId 107", env=LOGIN_ENV, sort_order=5),
    ])

    cases.extend([
        c("密码登录需MFA时跳转二次验证页", "MFA二次验证", "1. 账号开启 MFA",
          "1. 正确密码登录", "1. 跳转 /login/verify\n2. 展示验证方式", env=LOGIN_ENV, sort_order=1),
        c("MFA页发送验证码成功", "MFA二次验证", "1. 已在 verify 页",
          "1. 选择通道\n2. 发送", "1. 提示发送成功", env=LOGIN_ENV, sort_order=2),
        c("MFA验证码正确登录成功", "MFA二次验证", "1. 已收到 MFA 码",
          "1. 输入验证码\n2. 提交", "1. 进入系统首页", env=LOGIN_ENV, sort_order=3),
        c("MFA验证码错误提示失败", "MFA二次验证", "1. 已在 verify 页",
          "1. 输错验证码", "1. 验证失败提示\n2. 仍在 verify 页", direction="逆向", env=LOGIN_ENV, sort_order=4),
    ])

    cases.extend([
        c("忘记密码完整两步重置成功", "忘记密码", "1. 有效账号",
          "1. 点忘记密码\n2. 验证\n3. 重置密码\n4. 完成", "1. 提示成功\n2. 回到登录且账号已填", env=LOGIN_ENV, sort_order=1),
        c("忘记密码点返回回到登录", "忘记密码", "1. 在忘密流程",
          "1. 点返回/取消", "1. 回到登录表单", env=LOGIN_ENV, sort_order=2),
        c("忘记密码验证步空验证码校验", "忘记密码", "1. 在验证步",
          "1. 不填验证码提交", "1. 必填提示", direction="逆向", env=LOGIN_ENV, sort_order=3),
    ])

    cases.extend([
        c("有效token账号激活成功", "账号激活", "1. 有效 activate token",
          "1. 访问 /login/activate?token=...\n2. 设密码提交", "1. 激活成功\n2. 跳转登录", env=LOGIN_ENV + "；/login/activate", sort_order=1),
        c("无效token激活页提示错误", "账号激活", "1. 无效 token",
          "1. 访问激活链接", "1. 提示 token 无效或过期", direction="逆向", env=LOGIN_ENV + "；/login/activate", sort_order=2),
    ])

    cases.extend([
        c("登录成功后跳转首个有效菜单", "登录后跳转", "1. 账号有菜单权限",
          "1. 登录成功", "1. 进入首个有效菜单路径非 /login", env=LOGIN_ENV, sort_order=1),
        c("已登录访问login页重定向首页", "登录后跳转", "1. 已登录",
          "1. 访问 /login", "1. 自动跳转菜单或首页", env=LOGIN_ENV, sort_order=2),
    ])

    cases.append(c("未登录访问受保护路由跳转登录", "路由守卫", "1. 未登录",
                     "1. 直接访问 /Apex/system/menu", "1. 跳转 /login\n2. URL 含 redirect 参数", env=LOGIN_ENV, sort_order=1))

    cases.append(c("会话过期401提示并跳转登录", "会话过期", "1. 已登录 2. session 失效",
                     "1. 触发需鉴权操作", "1. 提示「登录已过期」类\n2. 跳转登录页", direction="异常", env=LOGIN_ENV, sort_order=1))

    cases.extend([
        c("点击退出登录确认后回到登录页", "退出登录", "1. 已登录",
          "1. 头像菜单点退出\n2. 确认", "1. 回到 /login\n2. 侧栏消失", env=LOGIN_ENV, sort_order=1),
        c("退出登录点取消保持当前页", "退出登录", "1. 已登录",
          "1. 点退出\n2. 取消", "1. 仍在当前页", env=LOGIN_ENV, sort_order=2),
    ])

    cases.extend([
        c("登录页切换英文成功", "语言切换", "1. 登录页",
          "1. 切 English", "1. 提示切换成功\n2. 表单文案英文", env=LOGIN_ENV, sort_order=1),
        c("登录页切换中文成功", "语言切换", "1. 当前 English",
          "1. 切中文", "1. 表单文案中文", env=LOGIN_ENV, sort_order=2),
    ])

    cases.extend([
        c("登录时权限加载失败仍进入首页且仅弹一次", "异常处理", "1. 登录时权限接口业务错误",
          "1. 登录\n2. 观察通知", "1. 仅弹一次错误通知\n2. 仍进入首页", direction="异常", remark="legacyId 418", env=LOGIN_ENV, sort_order=1),
        c("用户信息加载失败时提示获取用户信息失败", "异常处理", "1. 用户信息接口错误",
          "1. 登录或触发加载", "1. 提示「获取用户信息失败」或业务错误", direction="异常", remark="legacyId 422", env=LOGIN_ENV, sort_order=2),
    ])

    return cases


def main() -> None:
    menu_cases = build_menu_cases()
    login_cases = build_login_cases()

    menu_path = CONFIGS / "menu.cases.json"
    login_path = CONFIGS / "login.cases.json"

    menu_path.write_text(
        json.dumps({"fieldDefaults": MENU_DEFAULTS, "cases": menu_cases}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    login_path.write_text(
        json.dumps({"fieldDefaults": LOGIN_DEFAULTS, "cases": login_cases}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    for name, path, n in [("menu", menu_path, len(menu_cases)), ("login", login_path, len(login_cases))]:
        fs: dict[str, int] = {}
        for case in (menu_cases if name == "menu" else login_cases):
            fs[case["featureSet"]] = fs.get(case["featureSet"], 0) + 1
        print(f"{name}: {n} cases -> {path}")
        for k, v in sorted(fs.items()):
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
