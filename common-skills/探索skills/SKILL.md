---
name: 探索路由
description: 根据目标类型（本地仓库/GitHub/网站）分发探索策略。支持 OpenCLI JS 渲染抓取与三级回退。被学习助手等调用。
tags:
  - 探索
  - 浏览
  - 抓取
  - 仓库分析
  - 网站分析
should-trigger:
  - prompt 含 "探索" + 本地路径 / owner/repo / URL
  - prompt 含 "看看" 或 "浏览" + URL
  - prompt 含 "这个项目" + 已知路径
  - prompt 含 "目录结构" 或 "架构" + 项目名
should-not-trigger:
  - 用户只问了概念性问题（"什么是 Agent Loop"），无需抓取外部资源
  - 用户明确说 "不要上网" 或 "只看已有代码"
---

# 探索路由中心

> **定位：** 只做路由，不做拷贝。根据目标类型（本地仓库 / GitHub 仓库 / 网站）分发到对应的探索策略。
> **使用者：** 任何需要"浏览外部源码或网站内容"的 skill 套件。

## RED（失败基线）
- 对 GitHub 仓库用 web_fetch 而非 raw → 拿到 SPA 空壳
- 对 SPA 网站用 web_fetch → 内容为空
- 本地仓库探索深度 > 3 层 → token 爆炸

## GREEN（执行主线）
见下方"路由规则"和"使用方法"。

## 路由规则

| 目标类型 | 条件 | 策略文件 |
|---------|------|---------|
| 本地仓库 | 用户传了 `--repo-path` 或已知路径 | [[references/探索-本地仓库.md]] |
| GitHub 仓库 | 用户给了 `owner/repo` | [[references/探索-GitHub仓库.md]] |
| 网站/博客 | 非 GitHub 的 HTTP URL | [[references/探索-网站.md]] |

## 使用方法（Agent 视角）

```
1. 判断目标类型：
   - 有本地路径（C:\... / ./repo）？→ 探索-本地仓库
   - 有 owner/repo（如 Octane0411/the-claude-code）？→ 探索-GitHub仓库
   - 有 HTTP(S) URL 且非 GitHub 页面？→ 探索-网站
2. 读对应策略文件（references/探索-{类型}.md）：
   - 路径相对于本 SKILL.md 同级的 references/ 目录
   - 如果 wikilink `[[...]]` 不可解析，直接用相对路径读
3. 按策略文件的步骤执行探索
4. 输出：目录结构树 + 关键文件/页面内容摘要 + 架构初步判断
5. 返回给调用方（如学习助手），供后续分析使用
```

> 各策略的完整说明在 `references/` 下对应文件中，此处仅保留路由规则表。

## 检查点

- **抓取外部 URL 前**（GitHub raw / 网站）：确认 URL 格式正确，避免 `web_fetch` 收到 404 后浪费 token
- **主策略失败时**：输出 `⚠️ {主策略名} 不可用，切换至 {回退策略名}`，让调用方看到回退链路变化，避免静默降级
- **超大仓库触发时**（>2000 文件）：输出 `⚠️ 仓库文件超过 2000，已限制为只读 README.md + package.json`，提示用户指定关注点再深入
- **OpenCLI 不可用时**：先输出 `⚠️ OpenCLI 不可用，切换至 web_fetch 骨架提取`，再执行回退 1
- **探索完成后**：展示结果摘要（目录结构 + 关键文件列表），请用户确认"是否基于此结果继续分析？"

## 约束

- 本地仓库探索深度 ≤ 3 层（避免 token 爆炸）
- GitHub 探索优先 raw 文件，不爬 SPA 页面
- 网站探索不递归爬取；只抓入口页 + 最多 3 个关键子页

## REFACTOR（维护者参考）
- 新增目标类型（如 Docker 镜像、NPM 包）→ 在 `references/` 新增策略文件 + 更新路由规则表
- 探索策略变长 → 独立为 references/*.md（已做）
