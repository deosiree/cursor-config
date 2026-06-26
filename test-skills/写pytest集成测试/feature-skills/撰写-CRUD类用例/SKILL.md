---
name: 撰写-CRUD类用例
description: 撰写 Test*CRUD 类：create/read/update/delete 环、内联清理或 fixture、assert_success 链。
---

# Feature：撰写 CRUD 类用例

## 类模板

```python
class Test{Module}CRUD:
    """{模块} CRUD 测试"""

    def test_create_{entity}(self, session):
        """测试创建{实体}"""
        ...
```

## 标准流程

1. 构造 payload（`generate_unique_name`、唯一 email/phone）
2. `session.post(f"{BASE_URL}/.../create", json=data)`
3. `assert_success(resp, msg="CreateXxx")`
4. `unwrap_response` → `safe_get_id`
5. 断言关键字段（兼容 camelCase）
6. `# 清理` — delete 或 update 回滚

## 变体

| 场景 | 写法 |
|------|------|
| 内联创建 | 用例末尾 delete（见 few-shot 租户） |
| 复用实体 | 依赖 `test_tenant` fixture |
| update | create → update → assert → delete |
| soft delete | delete 后再 create 同名应成功 |

## 反向用例

```python
def test_create_{entity}_missing_required_field(self, session):
    """缺少必填字段应失败"""
    resp = session.post(..., json={})
    assert_error(resp, msg="CreateXxx")
```

## Few-shot

[[../../assets/few-shot-example/租户CRUD最小样本/SKILL.md]]
