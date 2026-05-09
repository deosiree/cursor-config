# 新i18n-编译宏外的定义点包trans+消费点包t

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

在编译宏外把定义点改成 trans 标记，再让消费点继续包 t。

## 何时使用

- 定义点不是模板内联文本，而是字段配置、规则中心等编译宏外结构，需要抽取脚本识别 key。

## 来源版本

- 主模板来源：`microfb` `462a31dbe13af101443bac1869b021803af6e945`，侧重点：formRules 与校验器消费点
- Few-shot 来源：
- `microfb-462a31d`：仓库 `microfb`，提交 `462a31dbe13af101443bac1869b021803af6e945`，侧重点：formRules 与校验器消费点
- `microfb-c05f40d`：仓库 `microfb`，提交 `c05f40d07ec4f4092305df331bc94277ef2272da`，侧重点：组件字段定义点使用 trans

## 模板与 few-shot

- 更新型 skill，主模板使用 `template/before` 与 `template/after`。
- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。
- `assets/few-shot-example/`：保存每个成功历史版本的独立 few-shot，供人类和 agent 举一反三。

## 完成态

- 能按真实历史版本还原本功能的成功实现
- 能区分主模板与其他 few-shot 变体
- 不再依赖伪造的 before/after 内容
