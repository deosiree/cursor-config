# muapi API Key 配置指南

> **状态：** 可选。没有 API key 时，AI 生图/视频路径降级为"命令预览"模式——展示会执行什么命令，但不实际调用付费 API。Remotion + edge-tts + moviepy 路径不受影响。

## 注册与获取 Key

```
1. 打开 https://muapi.ai
2. 点右上角 "Sign In" → "Continue with Google"
3. 登录后进入 Dashboard → API Keys → 复制 key
```

## 配置（选一种）

```bash
# 方式 A：muapi CLI 交互式配置（推荐，key 存在 ~/.muapi/ 不受 git 追踪）
muapi auth configure
# 提示输入 API key → 粘贴 → 完成

# 方式 B：环境变量（适合 CI/CD）
# Windows PowerShell:
[Environment]::SetEnvironmentVariable('MUAPI_API_KEY', 'sk-xxx', 'User')
```

## gitignore 保护

在全局 `~/.gitignore` 或项目 `.gitignore` 中：

```gitignore
# API keys
.env
.env.local
.muapi/
*_api_key
credentials.json
```

## 免费替代方案（无需 API key）

| 用途 | 方案 | 费用 |
|------|------|:---:|
| 语音合成 | `edge-tts`（微软免费 TTS） | 免费 |
| 视频渲染 | `Remotion`（React → MP4） | 免费 |
| 音视频合成 | `moviepy`（Python） | 免费 |
| AI 生图 | [Replicate](https://replicate.com) 新用户试用额度 | 免费试用 |
| AI 视频 | 暂无真正免费的 AI 视频 API | — |

## 降级策略（API key 不可用时的行为）

| 路由 | 无 API key 时的行为 |
|------|-------------------|
| **Remotion 配音** | ✅ 正常工作（不依赖 muapi） |
| **图文幻灯片配音** | ✅ 正常工作（不依赖 muapi） |
| **AI 视频配音** | ⚠️ 降级：展示 `muapi video generate` 命令预览，提示用户配置 API key 或改用 Remotion 路径 |
| **AI 生图** | ⚠️ 降级：提示"AI 生图需要 muapi API key。免费替代：Replicate 试用额度、Hugging Face Inference。" |

## 验证配置

```bash
# 检查是否已配置
muapi account balance

# 若输出余额信息 → 配置成功
# 若提示 "not authenticated" → 运行 muapi auth configure
```
