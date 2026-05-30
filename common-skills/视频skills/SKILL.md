---
name: 视频路由
description: 视频生成路由。muapi/Kling/Seedance（AI 视频）、Remotion（React 渲染）、OpenMontage、podcast-maker（播客视频）、template-tiktok（竖屏短视频）、claude-code-video-toolkit。触发词：生成视频、制作视频、AI视频、动画、幻灯片视频、产品视频、配音、字幕、播客、短视频、产品演示、演讲稿。
---

# 视频路由中心

## RED（失败基线）
- 对静态架构图用视频 → 杀鸡用牛刀，应该用 Mermaid 或 output-html
- 视频需求模糊（只说"做个视频"）→ 未确认时长/风格/用途前不要开始。必须暂停追问（见下方追问模板），不可自行假设
- muapi API key 不可用时 AI 视频静默失败 → 降级为命令预览，引导用户切换 Remotion 免费路径

### 追问模板（当用户只说"做个视频"时）

若用户只说"做个视频"而未说明需求 → 暂停追问：

```
需要确认几个细节：
  - 时长：多少秒？
  - 内容：你有文字稿/图片素材，还是需要 AI 生成？
  - 风格：教程动画 / 产品演示 / 短视频 / 播客？
  - 是否需要配音+字幕？
```

根据确认结果 → 走下方"判断优先级"决策树。

## 降级策略

| 路由 | 降级行为 |
|------|---------|
| muapi/Kling/Seedance | 展示命令预览，引导切换 Remotion → [[../references/muapi-api-key配置指南.md]] |
| Remotion 渲染 | ✅ 正常（免费） |
| 有声字幕视频 | Remotion 路径 ✅ / AI 路径 ⚠️ 降级预览 |
| OpenMontage | 降级为 Remotion（手动实现核心动画），提示"OpenMontage 不可用，已切换 Remotion 免费路径" |
| template-tiktok | 降级为 Remotion 手动竖屏渲染（设置 width=1080 height=1920） |
| podcast-maker | 降级为 [[../../语音tts-skills/SKILL.md\|语音tts-skills]] 的"文档转播客"路径 |
| claude-code-video-toolkit | 降级为 Remotion + edge-tts 手动组合 |

## GREEN（执行主线）

| 需求 | 路由目标 | 命令/工具 |
|------|---------|----------|
| **AI 视频生成（推荐）** | muapi + Kling/Seedance | `muapi video generate "..." --model kling-master` |
| **图转视频** | muapi i2v | `muapi video generate "..." --image ./photo.jpg --model seedance-2` |
| **产品广告视频** | Product Video Ad Maker | `npx skills run product-video-ad-maker --prompt "..." --duration 30` |
| **React 渲染视频** | Remotion | `npx remotion render src/index.js HelloWorld out/video.mp4` |
| **有声字幕视频** | Remotion + edge-tts + moviepy | [[subskills/生成有声字幕视频/SKILL.md]]（Agent 路由：Remotion/AI/图文 → 配音 → 合成） |
| **Agentic 视频制作** | OpenMontage | `git clone https://github.com/calesthio/OpenMontage && cd OpenMontage && python3 pipeline/run.py --prompt "..."` |
| **Claude Code 视频工具包** | claude-code-video-toolkit | `npx claude-code-video-toolkit --script src/video.ts --voice elevenlabs` |
| **短视频（TikTok）** | remotion-dev/template-tiktok | `npx create-video@latest --template tiktok && npx remotion render src/index.ts out/tiktok.mp4 --props='{"width":1080,"height":1920}'` |

## 安装

```bash
# AI 视频（Kling/Seedance/Veo3）
npm install -g muapi-cli
muapi auth configure
npx skills add SamurAIGPT/Generative-Media-Skills --all

# React 视频
npx create-video@latest my-project
cd my-project && npm install
```

## 判断优先级

1. 需要配音+字幕？ → [[subskills/生成有声字幕视频/SKILL.md]]
2. 竖屏短视频（≤60s，TikTok/Reels风格）？ → remotion-dev/template-tiktok
3. 复杂视频项目（多场景、多工具编排，>12步）？ → OpenMontage
4. AI 生成视频（用户给文字描述，无需自己编程）？ → muapi + Kling/Seedance
5. 需要 Claude Code 全流程驱动？ → claude-code-video-toolkit
6. 文档/文章转视频播客？ → podcast-maker
7. 否则（简单动画、架构讲解、React 可控渲染）→ Remotion

## 路由确认

选中路由后，执行前必须暂停询问用户确认：

> 「根据判断优先级第 [N] 条，将路由到 **[路由目标]**。是否继续？[继续/重新选择/取消]」

**例外：** 优先级第 7 条（Remotion 兜底）可省略确认，直接执行。

## 依赖预检

路由确认后、执行前，先检查对应工具可用性。不可用则走降级策略或自动安装。

| 路由 | 预检命令 | 不可用时 |
|------|---------|---------|
| Remotion | `npx remotion --version` | `npx create-video@latest` 初始化项目 |
| muapi | `muapi --version` | `npm install -g muapi-cli && muapi auth configure` |
| edge-tts | `pip show edge-tts` | `pip install edge-tts` |
| moviepy | `python -c "import moviepy"` 2>&1 | `pip install moviepy` |
| OpenMontage | `ls path/to/OpenMontage/` | 走降级（→Remotion） |
| template-tiktok | `ls node_modules/` 含 remotion | 走降级（→手动竖屏渲染） |
| podcast-maker | `ls path/to/podcast-maker/` | 走降级（→语音tts-skills 文档转播客） |
| claude-code-video-toolkit | `which claude-code-video-toolkit` 2>&1 | 走降级（→Remotion + edge-tts） |

**原则：** 依赖预检失败时，优先尝试自动安装；若安装失败或耗时 >30s，执行降级策略（见上方降级表），不静默失败。

## 生成前必读（Few-shot）

| 场景 | 必读示例 |
|------|---------|
| Remotion 视频（命令示例） | `[[template/few-shot-remotion-命令.md]]` |
| Remotion 视频（真实输出参考） | `[[template/few-shot-remotion-真实输出.md]]` |
| 有声字幕视频（文字稿→配音→合成 完整链路） | `[[template/few-shot-remotion-有声字幕.md]]` |
| SRT 字幕格式参考 | `[[template/few-shot-detailed-intro.srt]]` |

## 检查点

- **Remotion 渲染前**：确认 `durationInFrames`、`fps`、分辨率，请用户确认"渲染参数：[{fps}fps, {width}x{height}, {duration}s]？[继续/调整]"
- **AI 视频生成前**：展示 prompt + 模型选择 → 检查 muapi key → 不可用则降级预览
- **有声字幕视频**：检查点下沉到子技能（`[[subskills/生成有声字幕视频/SKILL.md]]`）

## REFACTOR
- 新增视频后端 → 更新路由表 + 检查点
- 视频制作最佳实践 → 独立为 `references/video-production-guide.md`

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "把这个架构讲解做成动画视频" | 视频需求 → Remotion（React 组件渲染） |
| "帮我生成一个 30 秒的产品演示" | 短视频 → template-tiktok 竖屏格式 |
| "用 Claude Code 做一个视频" | 工具包 → claude-code-video-toolkit |
| "把这个文档转成视频播客" | 播客视频 → podcast-maker |

## 外部参考

| 来源 | 说明 | Stars |
|------|------|:---:|
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | React 渲染视频框架 | 25k+ |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | 开源 agentic 视频制作系统 | 4.1k |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | Claude Code 视频工具包 | 1.3k |
| [remotion-dev/template-tiktok](https://github.com/remotion-dev/template-tiktok) | TikTok 竖屏模板 | 256 |
| [FelippeChemello/podcast-maker](https://github.com/FelippeChemello/podcast-maker) | 自动播客视频化 | 686 |
