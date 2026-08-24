# 目标仓库 Profile

## nebula-huiyan（默认）

```yaml
profileId: nebula-huiyan
configFile: configs/nebula-huiyan-0707-0807.config.json
metaRoot: nebula  # Meta-Workspace 根
author: 惠岩
since: 2026-07-07
outDir: humanDocs/自测单/gitLog
repos:
  microfb: microfb
  apex_dev: apex_dev
  nebula-ui: nebula-ui
  opsdeck: opsdeck
collaborators:
  路由鉴权: { owner: 杨欣静, myRole: 辅助 }
  国际化: { owner: 叶倩, myRole: 协作接入 }
```

## 扩展新 profile

1. 复制 `configs/nebula-huiyan-0707-0807.config.json` → `configs/{profileId}.config.json`
2. 按需改 `domain-dict` / `theme-rules` / `theme-groups`
3. 在 `references/target-repo-profiles.md` 追加一节
4. 跨项目首次使用须走 `intention-skills/分析-项目属性与harness`

## 解析规则

- 未指定 profile → `nebula-huiyan`
- `metaRoot` 可为绝对路径或相对 skill 根
- CLI：`--meta-root` 覆盖 config 内 metaRoot
