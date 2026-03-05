---
name: mf-route-home-alignment
description: Use when login redirect/default home in a micro-frontend app is inconsistent (e.g. /manage vs /Apex), causing 404 after login or refresh.
---

# 目标
统一主应用与子应用的登录落点、默认首页与历史路径兼容，避免“登录后 404 / 刷新后 404 / 回跳走丢”。

## 适用场景
1. 登录后没有回到目标页（`redirect` 丢失）。
2. 默认首页不稳定（有时进 `/Apex/dashboard`，有时进 `/manage` 或 `/404`）。
3. 主子应用前缀不一致（`activeRule`、`router base`、`menu.redirect` 混用）。
4. 历史链接仍在使用旧前缀（如 `/manage/*`）。

## 执行步骤
1. 定义唯一规范落点（例如 `/Apex/dashboard`），并声明为常量。
2. 统一路径规范化函数（仅接受站内路径，处理旧前缀映射与非法 URL 拦截）。
3. 统一守卫优先级：`redirect query` > `首个可访问菜单` > `默认首页`。
4. 配置层归一化：对 API/localStorage/public config 的 `activeRule` 与 `entry` 做旧值纠偏。
5. 路由兼容层补齐：新增 legacy 跳转（如 `/manage/:pathMatch* -> /Apex/...`）并保留 `query/hash`。
6. 子应用对齐：`qiankun base` 与主应用 `activeRule` 保持一致。
7. 执行回归用例并记录结果。

## 回归清单
1. 未登录直达目标页（如 `/cloud/Apex/dashboard`）后登录，必须回到该页。
2. 直接访问历史地址（如 `/cloud/manage`）必须跳到规范地址，且保留 `query/hash`。
3. 登录后刷新当前页不进入 404。
4. 菜单返回旧前缀（`/manage`）时，前端仍落到规范前缀（`/Apex`）。
5. 非法外链 `redirect`（`http://`、`//`）被拒绝。

## 输出要求
1. 给出“规范落点常量”和“路径规范化规则”。
2. 标注改动层级：`路由守卫`、`菜单解析`、`配置加载`、`legacy 兼容`、`子应用 base`。
3. 提供回归结果（通过/失败）和剩余风险。

