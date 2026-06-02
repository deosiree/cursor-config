# 对 Reasonix 暴露所有 .cursor skills
使用 $cook-link-skills
sourceDir: .cursor
targetDir: .reasonix/skills
purpose: 让 Reasonix 始终能使用 Cursor 中的 skill，一处修改处处生效

# 预期行为
1. 扫描 .cursor 下所有根级 SKILL.md（排除 feature-skills/intention-skills/template 等）
2. 为每个 skill 在 .reasonix/skills/ 下建立扁平 .md 硬链接
3. 中文 name 字段自动改为 ASCII（目录名）
4. 输出 created/skipped/failed 计数
