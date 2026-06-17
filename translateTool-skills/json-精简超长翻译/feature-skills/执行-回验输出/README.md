# 执行-回验输出

## 作用

运行 `scripts/check-russian.js --mode verify`，验证 LLM 缩短结果全部合规后，写入到同名+`_new` 后缀的输出目录。

## 资源入口

- 脚本：`[[../../scripts/check-russian.js]]`
- 模板：`[[template/before/]]` 缩短后有残余超标的场景
- 模板：`[[template/after/]]` 全部通过后写出的最终 JSON
- 校验：`[[evals/evals.json]]`

## 使用示例

```text
LLM 缩短完成。
使用 $执行-回验输出 运行回验脚本，通过后写入 db_new/。
```
