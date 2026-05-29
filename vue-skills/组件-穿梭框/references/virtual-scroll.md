# virtual-scroll 使用要点

## 何时开启

| 场景 | 建议 | 样本 |
|------|------|------|
| Dialog 绑定设备、数千条 | `:virtual-scroll="true"` | BindDeviceDialog after |
| Tab 角色关联、数百条以内 | `:virtual-scroll="false"` | DeviceTab after |

## 前提

- 已安装 `vue3-virtual-scroll-list`
- `data.length > 0` 时组件内部才生效

## 行高

- 自定义 `#default` 行时保持行高一致，虚拟列表测量更稳定
- DeviceTab 使用 grid 行 + `min-height: 32px`

## 与 gateway 配合

虚拟滚动只解决 **渲染**；数据须 gateway 全量拉取（见 [`gateway-full-fetch.md`](gateway-full-fetch.md)），禁止页面层 `pageSize: 999999`。

## clearQuery

Dialog 关闭时：

```ts
transferRef.value?.clearQuery?.("left");
transferRef.value?.clearQuery?.("right");
```

勿直接操作 DOM 清搜索框。
