# 迁移-主skill改造为agent Darwin 演化说明

## 当前已覆盖

- 主 skill 过重
- 需要把示例、规则、门禁下沉到子skill

## 当前边界

- 当主 skill 不只需要 agent 化，还要继续拆成 intention / feature 两层时，需要再路由到拆层节点

## 何时继续 Darwin

- 主 `SKILL.md` 仍然持续回胖
- 子skill 仍然没有真正承担职责
