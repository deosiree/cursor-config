# API 契约解析规则

## 优先级
1. 默认 `api契约`
2. `补充契约路径`
3. 停止并请求人工介入

## 字段规则
- `apiMethod`：取 swagger path 下的方法名，输出统一大写
- `apiUrl`：取 swagger path key 原值
- `description`：
  - 优先 swagger `description`
  - 缺失回退 swagger `summary`
  - 若所有已知契约都未命中，则标记为“待人工确认”

## 多契约补充
如果默认 `seccenter.swagger.json` 不覆盖全部接口，可继续按顺序补读其他契约，例如 `dbres.json`。主说明仍把默认契约写成 `seccenter.swagger.json`，其余契约通过 `补充契约路径 / extra_api_contracts` 输入。

## 禁止事项
- 不允许在正式 API 表里把 `源码语义推断` 当成最终 description
- 不允许在契约缺失时主观补一个看起来合理的描述
- 契约缺失时，必须输出 `# 待人工介入`
