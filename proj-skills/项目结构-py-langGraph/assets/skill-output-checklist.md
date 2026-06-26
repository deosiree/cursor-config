# Skill 输出自检清单

## 新建 Agent 项目

- [ ] `app/api/router.py` 薄壳，只调 services
- [ ] 至少一个 `services/<domain>/service.py`
- [ ] 至少一个 `graph/<workflow>/` 含 builder + runner
- [ ] `graph/<workflow>/README.md` 含双轨 Mermaid
- [ ] `graph/README.md` 域索引
- [ ] 项目根 README 含全项目结构树
- [ ] `conftest.py` + 共置 tests/
- [ ] `pytest -v` 可运行

## 新增 graph 工作域

- [ ] 完整域包（state/builder/runner/nodes/edges/...）
- [ ] 域 README 双轨 Mermaid 与 builder 一致
- [ ] graph/README.md 已登记
- [ ] graph/<workflow>/tests/

## 新增 services 领域

- [ ] service.py 编排入口
- [ ] tests/ 契约测试
- [ ] router 委托

## 重构反模式

- [ ] 无 orchestration/ 顶层目录
- [ ] 无 graph 根平铺 routes/*_graph/trace_utils
- [ ] import 全量替换
- [ ] pytest 全绿

## Mermaid 双轨

- [ ] 每张流程图有「源码对照」+「业务说明」两节
- [ ] 中文图可读、与业务一致
