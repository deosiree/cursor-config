---
name: 更新技能源 few-shot
description: 完整展示从修改 cursor-config 的 skill 到生效的全过程。
---

# 示例

## 用户输入

```
更新技能源，我刚改好了预览隧道 skill 推到了 cursor-config
```

## 技能输出

### 步骤 1：发现最新 skill

```bash
cc-switch skills discover -a hermes
```

输出：发现预隧道已更新，新增了1个变更

### 步骤 2：同步到 Hermes

```bash
cc-switch skills sync -a hermes
```

输出：同步完成，预览隧道已更新 ✅

### 步骤 3：重启 Gateway

```bash
hermes gateway restart
```

输出：Gateway 重启中... ✅

### 步骤 4：验证

```bash
hermes gateway status
# → running ✅
```

**新 skill 已生效，可以打开预览试试了。** 🚀
