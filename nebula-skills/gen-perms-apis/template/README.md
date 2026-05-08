# template

## 用途

这个目录放“给人看”的模板与样本。

## 文件分工

- `route-component-perm-api-output.md`
  - 通用文档模板，只保留结构、表头、占位说明
- `boundary-file-example.md`
  - 默认边界文件样例
- `sample-run/apex_dev-route-component-perm-api.md`
  - 主结构样本，用来验证模板是否足够清晰
- `sample-run/apex_dev-route-component-perm-api-iteration.md`
  - 多轮补全与人工介入闭环样本，用来验证迭代式 few-shot 是否清晰
- `sample-run/apex_dev-api-backtrace-focus-iteration.md`
  - API 反查与关注路由迭代样本，用来验证 gateway、子组件抬升、补充契约和非关注策略是否清晰

## 约束

- 模板正文不允许写死仓库专属路由、组件、权限标识
- 样本试跑可以使用 `apex_dev` 的真实内容，但必须和通用模板分离
- 第二份样本不是第二个成品模板，而是“如何从不完整条件出发，经过人工回答，生成可审计迭代结果”的 few-shot 演示
- 第一份样本回答“最终长什么样”
- 第二份样本回答“条件不完整时怎么继续做”
- 第三份样本回答“API 反查漏看 gateway/emit/base URL 后怎么修正”
