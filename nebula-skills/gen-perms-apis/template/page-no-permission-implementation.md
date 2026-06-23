# 页面无权限空态落地计划

## 目标

- `targetRepo`：apex_dev（默认）
- `关注路由`：{{路由列表}}

## 执行序列

1. [[../feature-skills/盘点-页面权限空态反模式]]（可选，现状不清时）
2. [[../intention-skills/策略-页面权限空态]]（门控未定）
3. [[../feature-skills/判定-页面门控权限点]]
4. [[../feature-skills/接入-PageNoPermission空态]]
5. [[../intention-skills/编排-权限E2E测试]]（验收，可选）

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `src/components/PageNoPermission/index.vue` | 新建或对齐参考 |
| `src/views/tenant/index.vue` | 兄弟分支 + 删页面样式 |
| `src/views/dashboard/index.vue` | `PageNoPermission v-else` |

## 验收清单

- [ ] 无门控 perm 时显示「暂无页面访问权限」，非「暂无数据」
- [ ] 视觉与 `reference-02-设备数据UI参考` 一致
- [ ] `fetchData` / `loadData` 守卫保留
- [ ] 未改动非负责模块（如设备数据，除非用户明确）

## 源码对照

- before：[[sample-run/before-02-页面空态/]]
- after：[[sample-run/after-02-页面空态/]]
