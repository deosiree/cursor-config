# hardlink-gotchas

## NTFS 硬链接约束

### 同卷要求
硬链接的源和目标必须在同一 NTFS 卷上。
- 判断方法：`fsutil fsinfo ntfsinfo <path>` 查看卷序列号是否一致
- 跨卷时降级为 copy，需告知用户不再双向同步

### linkCount 陷阱
- 文件 linkCount > 1 说明有硬链接存在，删一个路径不会删除数据
- linkCount = 1 说明这是唯一引用，可能是独立拷贝而非硬链接
- 脚本使用 `Get-Item $dst -Force | Select LinkCount` 判断

### 应用层透明性
- 硬链接对应用层完全透明，不像符号链接有 ReparsePoint 标记
- Reasonix 沙箱可正常 read_file 硬链接文件
- 目录联结（Directory Junction）不可用于文件，Reasonix 需扁平 .md 而非目录

## 各目标系统 skill 加载约定

### Reasonix
- 路径：`<repo>/.reasonix/skills/<name>.md`
- 格式：扁平 .md 文件，YAML frontmatter
- name 字段：`[a-zA-Z0-9_.-]`，中文会被拒绝
- 加载时机：启动时扫描，`install_skill` 注册的同会话立即可用

### Hermes（待验证）
- 推测路径：`hermes-config/skills/`
- 格式：待确认

### OpenClaw（待验证）
- 推测路径：`openclaw-config/skills/`
- 格式：待确认
