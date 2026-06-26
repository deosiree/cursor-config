---
name: 撰写-utils断言助手
description: 撰写 utils.py：assert_success、unwrap_response、generate_unique_name、camelCase 兼容、RSA 密码。
---

# Feature：撰写 utils 断言助手

## 职责

`utils.py` 统一 HTTP 断言与测试数据生成；**黄金样本**：`nebula/seccenter/tests/utils.py`

## 必选函数

| 函数 | 用途 |
|------|------|
| `assert_success(resp, msg="")` | status 200 + 业务 success |
| `assert_error(resp, expected_code=..., msg="")` | 预期失败 |
| `unwrap_response(resp)` | 剥 `data` / `@type` |
| `is_success(resp)` | 布尔，供 fixture 判断 |
| `generate_unique_name(suffix)` | `TEST_AUTO_{suffix}_{id}` |
| `generate_unique_email(prefix)` | 唯一邮箱 |
| `safe_get_id(entity)` | id / hash id 提取 |
| `maybe_encrypt_password(pw, base_url, session)` | 读 loginSetting 决定是否 RSA |

## camelCase 规则

响应字段读取一律：

```python
value = obj.get("snake_case") or obj.get("camelCase")
```

## 可选依赖

- `hashids` — 解码 user/tenant hash id
- `cryptography` — RSA 加密密码

`requirements.txt` 注明可选包；缺包时相关测试 `pytest.skip` 或明确 ImportError。

## 禁止

- 在 `assert_success` 里吞掉错误信息
- 测试数据不用 `TEST_PREFIX`（config 中 `TEST_AUTO_`）

## 模板

[[../../template/新模块骨架/after/SKILL.md]] §utils
