#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性：从实跑 build_excel 逻辑生成 configs/*.json（开发用）。"""
from __future__ import annotations

import json
import re
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
CONFIGS = SKILL / "configs"


def main() -> None:
    domain_dict = [
        {"域名标签": "登录鉴权", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "microfb", "映射线索": "scope=auth/login; views/login; MFA/验证码/激活", "备注": "microfb 登录流程主责"},
        {"域名标签": "租户管理", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "apex_dev", "映射线索": "scope=tenant; views/tenant", "备注": ""},
        {"域名标签": "用户管理", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "apex_dev", "映射线索": "scope=user; views/system/user", "备注": ""},
        {"域名标签": "角色管理", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "apex_dev", "映射线索": "scope=role; views/system/role", "备注": ""},
        {"域名标签": "菜单管理", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "apex_dev", "映射线索": "scope=menu; views/system/menu", "备注": ""},
        {"域名标签": "个人中心", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "apex_dev", "映射线索": "scope=profile; views/profile", "备注": ""},
        {"域名标签": "安全配置", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "apex_dev", "映射线索": "scope=securityConfig", "备注": ""},
        {"域名标签": "密码框", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "nebula-ui; microfb; apex_dev", "映射线索": "NeSecretInput; GuardedSecretInput", "备注": "nebula-ui 主域为密码框组件"},
        {"域名标签": "权限鉴权", "是否惠岩主责主域": "是", "域名主责人": "惠岩", "典型仓库": "microfb; apex_dev; opsdeck", "映射线索": "scope=perm/iam; 查写二分", "备注": "跨仓"},
        {"域名标签": "路由鉴权", "是否惠岩主责主域": "否", "域名主责人": "杨欣静", "典型仓库": "microfb; apex_dev; opsdeck", "映射线索": "路由守卫; pageURL/funcURL", "备注": "惠岩辅助多子路由"},
        {"域名标签": "国际化", "是否惠岩主责主域": "否", "域名主责人": "叶倩", "典型仓库": "apex_dev", "映射线索": "scope=i18n; NeI18n", "备注": "惠岩协作接入"},
        {"域名标签": "工程化/类型", "是否惠岩主责主域": "否", "域名主责人": "惠岩", "典型仓库": "各仓", "映射线索": "vue-tsc; types", "备注": ""},
        {"域名标签": "API通道", "是否惠岩主责主域": "否", "域名主责人": "惠岩", "典型仓库": "apex_dev; microfb", "映射线索": "direct/forward", "备注": ""},
        {"域名标签": "通用视图/表单", "是否惠岩主责主域": "否", "域名主责人": "惠岩", "典型仓库": "apex_dev; microfb", "映射线索": "views/vue/form", "备注": ""},
    ]

    theme_title = {
        "密码框": "密码框组件与防误填（NeSecretInput/GuardedSecretInput）",
        "密码框-依赖升级": "密码框消费者依赖升级（@nebula/ui）",
        "登录-MFA": "登录 MFA / 发码灰禁",
        "登录-验证码": "登录图形验证码 / OTP / 人机验证",
        "登录-激活": "账号激活流程",
        "登录-表单反馈": "登录鉴权表单反馈与写侧",
        "401会话": "401 会话过期提示",
        "表单校验-邮箱": "邮箱全串校验",
        "表单校验-MFA长度": "MFA 验证码长度校验",
        "表单校验-规则": "表单校验规则工厂",
        "路由鉴权-守卫": "子应用路由守卫与最长前缀匹配",
        "路由鉴权-读侧": "路由权限读侧（pageURL 精确 + funcURL 模糊并集）",
        "权限-隐藏": "隐藏权限放过",
        "权限-查写二分": "查写二分权限（query/write）",
        "租户-创建流程": "创建租户流程（precheck / Step3 / 角色确认）",
        "租户-pubagg": "租户 pubagg / bound-check / enrich",
        "租户-转移所有者": "租户转移/更换所有者",
        "租户-其他": "租户管理杂项",
        "角色-模板": "角色模板",
        "角色-权限树": "角色菜单权限树（父级取勾 / SSOT）",
        "角色-其他": "角色管理杂项",
        "菜单-查写": "菜单管理查写二分",
        "菜单-API": "菜单 API 配置 / 批量删除 / 白名单导入",
        "菜单-路由": "菜单路由路径（routePath / 空路由）",
        "菜单-其他": "菜单管理杂项",
        "用户-查写": "用户管理查写二分",
        "用户-其他": "用户管理杂项",
        "个人中心": "个人中心（改密 / 绑定）",
        "安全配置": "安全配置项",
        "国际化": "国际化接入（叶倩主责，惠岩协作）",
        "工程化": "工程化与类型检查（vue-tsc / 内测临时）",
        "API通道": "API 通道 direct/forward 调整",
        "设备绑定": "绑定设备状态",
        "OpCol": "操作列 OpCol",
        "表格布局": "表格列 / PageTabShell / 布局",
    }

    cluster_rules = [
        ["密码框-依赖升级", r"nebulaUI|nebula/ui|@nebula/ui"],
        ["密码框", r"GuardedSecret|NeSecret|密码框|密码限长|防误填"],
        ["登录-MFA", r"MFA|发码|灰禁"],
        ["登录-验证码", r"图形验证码|130127|captcha|OTP|人机验证"],
        ["登录-激活", r"激活|activate"],
        ["登录-表单反馈", r"鉴权表单|回车防|登录写侧"],
        ["401会话", r"401|会话过期"],
        ["表单校验-邮箱", r"邮箱全串|ada@qq"],
        ["表单校验-MFA长度", r"MFA长度|4.?6"],
        ["表单校验-规则", r"规则工厂|名称的规则|表单校验规则"],
        ["路由鉴权-守卫", r"路由鉴权|路由守卫|子应用不做路由|多子路由"],
        ["路由鉴权-读侧", r"pageURL|funcURL|路由权限读侧"],
        ["权限-隐藏", r"隐藏的权限"],
        ["权限-查写二分", r"查写二分|无 write|query.*write"],
        ["租户-创建流程", r"创建租户|precheck|Step3|角色确认|角色模板联动"],
        ["租户-pubagg", r"pubagg|bound/check|enrich"],
        ["租户-转移所有者", r"转移所有者|更换所有者|beta2不上"],
        ["租户-其他", r"租户"],
        ["角色-模板", r"角色模板"],
        ["角色-权限树", r"父级取勾|SSOT|菜单权限"],
        ["角色-其他", r"角色"],
        ["菜单-查写", r"菜单管理查写|菜单.*write"],
        ["菜单-API", r"API 配置|批量删除|白名单的导入"],
        ["菜单-路由", r"路由路径|routePath|空路由|function.*路由"],
        ["菜单-其他", r"菜单"],
        ["用户-查写", r"用户管理权限|用户管理："],
        ["用户-其他", r"用户"],
        ["个人中心", r"个人中心|profile|改密|绑定"],
        ["安全配置", r"securityConfig|安全配置"],
        ["国际化", r"i18n|NeI18n|getLocalizedValue|国际化弹窗"],
        ["工程化", r"vue-tsc|内测临时|types"],
        ["API通道", r"direct.*forward|/direct|/forward"],
        ["设备绑定", r"绑定设备|devicebind|DISABLED"],
        ["OpCol", r"OpCol"],
        ["表格布局", r"表格列|PageTabShell|expand|fillHeight|下拉框"],
    ]

    theme_groups = {
        "route-auth": {
            "title": "路由鉴权（守卫与读侧；杨欣静主责，惠岩辅助）",
            "subs": {
                "路由鉴权-守卫": "子应用路由守卫与最长前缀匹配",
                "路由鉴权-读侧": "路由权限读侧 pageURL/funcURL",
            },
        },
        "secret-input": {
            "title": "密码框组件与防误填输入",
            "subs": {
                "密码框": "组件实现（NeSecretInput/GuardedSecretInput）",
                "密码框-依赖升级": "消费者依赖升级 @nebula/ui",
            },
        },
    }

    main_cfg = {
        "profileId": "nebula-huiyan",
        "metaRoot": "F:/Documents/Repertory/Sieyuan/nebula",
        "author": "惠岩",
        "defaultOwner": "惠岩",
        "since": "2026-07-07",
        "until": None,
        "outDir": "humanDocs/自测单/gitLog",
        "xlsxName": "0707-0807.xlsx",
        "rawJsonName": "commits_raw.json",
        "repos": {
            "microfb": "microfb",
            "apex_dev": "apex_dev",
            "nebula-ui": "nebula-ui",
            "opsdeck": "opsdeck",
        },
        "domainDictFile": "configs/nebula-huiyan.domain-dict.json",
        "themeRulesFile": "configs/nebula-huiyan.theme-rules.json",
        "themeGroupsFile": "configs/nebula-huiyan.theme-groups.json",
        "collaborators": {
            "路由鉴权": {"owner": "杨欣静", "myRole": "辅助"},
            "国际化": {"owner": "叶倩", "myRole": "协作接入"},
        },
    }

    CONFIGS.mkdir(parents=True, exist_ok=True)
    (CONFIGS / "nebula-huiyan.domain-dict.json").write_text(
        json.dumps(domain_dict, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (CONFIGS / "nebula-huiyan.theme-rules.json").write_text(
        json.dumps({"themeTitle": theme_title, "clusterRules": cluster_rules}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (CONFIGS / "nebula-huiyan.theme-groups.json").write_text(
        json.dumps(theme_groups, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (CONFIGS / "nebula-huiyan-0707-0807.config.json").write_text(
        json.dumps(main_cfg, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("wrote configs to", CONFIGS)


if __name__ == "__main__":
    main()
