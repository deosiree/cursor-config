# Discovery 工作表（幕1）

复制下表，填目标仓事实。空字段未清前不得写 harness 文件。

```yaml
targetPath: ""
topology: ""          # 单仓 | 多仓；模块列表
ownerDomains: []      # [{name, path}]
apiSsot: ""           # 契约文件路径；未知则 "待定"
verify:
  L0: ""
  L1: ""
  L2: ""
  missing: []
existingHarness:
  hasAgents: false
  hasIntake: false
  hasArchitecture: false
  hasReview: false
  hasQualityLoop: false
  hasEvals: false
  hasCli: false
gaps: []              # 对照 references/可迁移能力.md 的能力名
blockers: []          # 需 🔴 CHECKPOINT 问人的项
```

填完后对照 `[[../references/可迁移能力.md]]` 生成 `gapChecklist`。  
