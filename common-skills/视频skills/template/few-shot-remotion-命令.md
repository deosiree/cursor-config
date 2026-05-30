# Remotion 视频 — 可执行命令

> ⚠️ 本模板为**可执行命令示例**（非描述性说明）。视频生成需要安装 Remotion，但命令本身可直接复制运行。

**触发：** "把 Agent Loop 的 12 步流程做成 60 秒动画视频"

**命令（安装 + 运行）：**
```bash
# 1. 初始化 Remotion 项目
npx create-video@latest agent-loop-video

# 2. 渲染视频
cd agent-loop-video
npx remotion render src/index.ts out/agent-loop.mp4 --props='{"duration": 60}'
```

**需要的 React 组件（Agent 生成，非模板）：**
- `AgentLoopScene.tsx`：逐帧展示 12 步流程
- 每步一个 `<Transition>` 淡入淡出
- 底部 `<SubtitleBar>` 显示步骤名称

**预计产出：**
- `out/agent-loop.mp4`（1080p，60 秒）

**外部参考：**
- Remotion 官方模板：`npx create-video@latest --template tiktok`
- TikTok 竖屏模板：[remotion-dev/template-tiktok](https://github.com/remotion-dev/template-tiktok)
- Claude Code 视频工具包：[claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit)
