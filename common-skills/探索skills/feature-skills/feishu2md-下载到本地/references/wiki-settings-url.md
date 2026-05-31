# --wiki 模式 Settings URL 构造方法

## 问题

`feishu2md dl --wiki` 需要知识库的 **settings 页 URL**（格式：`/wiki/settings/SPACE_ID`），而不是普通的 wiki 页面 URL（`/wiki/NODE_TOKEN`）。

## 获取 Space ID

通过飞书 Open API 查询：

```python
import requests

# 1. 获取 tenant_access_token
resp = requests.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    json={'app_id': '<APP_ID>', 'app_secret': '<APP_SECRET>'})
token = resp.json()['tenant_access_token']

# 2. 查询 node info → 获取 space_id
resp = requests.get('https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node',
    headers={'Authorization': f'Bearer {token}'},
    params={'token': '<NODE_TOKEN>'})
space_id = resp.json()['data']['node']['space_id']
```

## 构造 Settings URL

```
https://{domain}.feishu.cn/wiki/settings/{space_id}
```

## 当前文档信息

- 文档 URL：`https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX`
- Node Token：`IbuLwEv7fituvMkrSaWc86CjncX`
- Space ID：`7630649543742213345`
- Settings URL：`https://zru9fxhvq5.feishu.cn/wiki/settings/7630649543742213345`
- has_child：`false`（无子页面，不需要 --wiki）
