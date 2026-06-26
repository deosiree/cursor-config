---
name: 策略-新增服务域
description: 在已有 Agent 中新增 services 业务域包。Use when 新增 services 领域、PreTranslateService、领域编排。
---

# 策略-新增服务域

## 何时使用

- 新增业务域（审核、批处理、治理 API 等），需 `services/<domain>/`

## GREEN 步骤

1. 复制 [[../../template/services域包骨架/tree.txt]]
2. [[../../feature-skills/搭建-services领域包/SKILL.md]] 创建 service/single/mappers/tests
3. `api/router.py` 新增端点，只调 `services/<domain>/service.py`
4. 更新项目根 README 主要目录表

## 输出契约

- `services/<domain>/service.py` 编排入口
- `services/<domain>/tests/` 契约测试
- router 薄壳委托

## 金样

[[../../assets/few-shot-example/terminology-agent/services-pre_translate-tree.txt]]
