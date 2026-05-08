# 02 gateway 与契约修正记录

## 用户补充

用户指出业务层到 api 的链路中间通常还有 gateway 层，应该消费 `route-api-gateway` 的链路知识。不能看到业务层没有直接 import api 就停止。

## 修正链路：设备激活

```text
src/views/tenant/components/BindDeviceDialog.vue
-> DeviceGateway.deviceActivate
-> src/gateway/device/device.gateway.ts
-> DeviceAPI.deviceActivate
-> src/api/device/device.api.ts
-> /forward/device/activate
-> docs/api/devmgr.swagger.json
```

## 修正结论

- 错误菜单路径不是最终 API。
- 未解析设备 base URL 不是最终 API。
- 设备激活应匹配 `devmgr.swagger.json`。
- 如果未提供 `devmgr.swagger.json`，应进入 `# 待人工介入`，而不是写“无后端 API”。

## 修正链路：设备绑定列表

```text
业务层绑定设备列表入口
-> 资源/设备绑定 gateway
-> dbres api
-> /dbres/devicebind/list
-> docs/api/dbres.swagger.json
```

## 需要沉淀的规则

- 默认契约不覆盖时，要继续查 `补充契约路径`。
- 多契约命中时要保留命中的契约文件。
- gateway 内部映射函数、模型转换函数、常量、模板字符串必须继续追到 api 方法和最终 URL。
