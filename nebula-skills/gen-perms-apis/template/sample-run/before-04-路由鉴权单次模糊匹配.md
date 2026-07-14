# before-04：路由鉴权单次模糊匹配（RED）

> 本文件沉淀改造前 resolveScope 口径。  
> 对应 write-skill「真实历史样本型模板 — 基于 RED 写 before」。  
> 已被 `after-04-路由鉴权迭代剥离.md` 取代。

## 旧算法（已删除）

### fuzzyMatchByPrefix

精确/后缀匹配无候选后，**单次**调用最长前缀匹配：

```
遍历 routeProjectMap:
  if routePath.startsWith(nodePath + "/"):
    取最长前缀候选
```

问题：

1. **不检查节点 type**：directory 也可作为模糊命中目标，子 URL 误继承 directory「空 perm」或错误 scope
2. **无 fuzzyRejected**：路由鉴权失败与权限不足无法区分
3. **无守卫重定向**：resolveScope 返回空 perms，页面仍渲染，按钮全灭
4. **单级回退**：只做一次前缀匹配，未迭代剥离 `/detail`、`/:id` 等末段

## 典型失败场景

| URL | 菜单树 | 旧行为 | 用户感知 |
|-----|--------|--------|---------|
| `/Opsdeck/projectManage/detail` | 父 page `/Opsdeck/projectManage` | 可能命中 | 按钮正常（若 fuzzy 生效） |
| `/Opsdeck/foo/detail` | 仅 directory `/Opsdeck` | 命中 directory | 按钮全灭或误显 |
| `/404` | — | 继续鉴权迭代 | DEV 日志噪音 |

## 与权限鉴权混淆

旧排障路径：有 role perm → 查 `getAllowed()` → 为空 → 误判为「function 挂错」。

实际可能是：**路由鉴权未通过**（未命中 page），perm 层尚未生效。

## 迁移指向

- GREEN：`[[after-04-路由鉴权迭代剥离.md]]`
- 决策：`[[snapshot-04-路由鉴权决策.md]]`
- 权威：`[[../../references/route-scope-auth-chain.md]]`
