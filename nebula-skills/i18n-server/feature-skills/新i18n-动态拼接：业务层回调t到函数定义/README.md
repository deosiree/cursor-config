# 新i18n-动态拼接：业务层回调t到函数定义

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

当函数定义内部存在动态拼接文本时，把翻译责任回调给业务层 t。

## 何时使用

- 纯 TS helper、业务函数或动态规则函数内部需要翻译，但无法直接靠 trans 解决动态拼接。

## 来源版本

- 主模板来源：`microfb` `6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`，侧重点：login-mfa 等动态拼接函数
- Few-shot 来源：
- `microfb-6a3e495`：仓库 `microfb`，提交 `6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`，侧重点：动态 helper 与业务函数
- `apex_dev-fd02487`：仓库 `apex_dev`，提交 `fd02487fd927b3c35a02bea9ce3daac7a4228007`，侧重点：租户管理与动态规则函数

## 模板与 few-shot

- 更新型 skill，主模板使用 `template/before` 与 `template/after`。
- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。
- `assets/few-shot-example/`：保存每个成功历史版本的独立 few-shot，供人类和 agent 举一反三。

## 完成态

- 能按真实历史版本还原本功能的成功实现
- 能区分主模板与其他 few-shot 变体
- 不再依赖伪造的 before/after 内容

## 使用示例

```text
当前问题出在动态 helper 或规则函数里，trans 不够用，需要业务层回调 t 到函数定义。
```

```text
formRules 或动态校验函数里需要翻译，但我不想把最终展示文案冻结在 util 层。
```
