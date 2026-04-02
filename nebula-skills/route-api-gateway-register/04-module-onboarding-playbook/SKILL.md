---
name: module-onboarding-playbook
description: Use when adding a new business module or integrating another micro-service into nebula and you need a concrete file-level checklist centered on src/registry/sources/* and the unified @/registry consumption path.
---

# module-onboarding-playbook

## 目标
给出“新增模块/新增微服务”的文件级、变量级接入清单与验收清单。

## 场景
1. 同一子应用新增模块（页面、动作、网关、API）
2. 新增一个子应用接入基座注册中心与菜单绑定

## 使用前置
同一子应用新增模块时，先执行 `05-registry-module-template`，以 `src/registry/sources/__template__/` 为模块骨架来源。

## 强制输出
1. 文件改动清单（新增/修改）
2. 变量改动清单（单写点）
3. 验收命令与预期结果
