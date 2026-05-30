# Remotion 视频 — 带语音详细版 真实输出

**触发：** "做一个详细介绍所有通用 skill 的视频，要有语音解说"
**语音：** edge-tts 生成（zh-CN-YunxiNeural，男声新闻播报风格）

**产出文件：**
- **`few-shot-detailed-intro.mp4`**（17 MB，6 分钟，1080p，h264 + 语音）

**视频内容结构（6 分钟）：**

| 时间段 | 内容 | 展示形式 |
|--------|------|---------|
| 0:00-0:10 | 🎯 标题：通用能力路由中心 | 全屏标题 |
| 0:10-0:38 | 🧑‍🏫 方法论skills 路由表 | 4 行触发→方法→目标 表格 |
| 0:38-1:00 | 方法论skills 真实输出示例 | 费曼/苏格拉底/金字塔/不嵌入 效果卡片 |
| 1:00-1:28 | 📊 渲染图skills 路由表 | Mermaid/output-html/生图 分发规则 |
| 1:28-1:50 | 渲染图skills 真实输出示例 | 窄版规则/HTML模板/AI生图 |
| 1:50-2:18 | 🔍 探索skills 路由表 | 本地/GitHub/网站(OpenCLI) 策略 |
| 2:18-2:40 | 探索skills 真实输出示例 | 目录结构/README摘要/网站结构树 |
| 2:40-3:08 | 🔊 语音tts-skills 路由表 | edge-tts/文档转播客/Node.js 集成 |
| 3:08-3:30 | 语音tts-skills 真实输出示例 | MP3+SRT/中文语音选项 |
| 3:30-3:58 | 🎬 视频skills 路由表 | muapi/Remotion/OpenMontage |
| 3:58-4:20 | 视频skills 真实输出示例 | 真实 mp4 文件大小 |
| 4:20-4:48 | 🖼️ 生图skills 路由表 | muapi/Midjourney/Flux/41 工作流 |
| 4:48-5:10 | 生图skills 真实输出示例 | 100+模型/MCP 工具 |
| 5:10-5:30 | 🚀 安装指南 | 一键安装全部外部工具 |
| 5:30-5:40 | 🎯 结尾 | 只做路由，不做拷贝 |

**技术栈：**
- Remotion（React 渲染视频）
- edge-tts（语音合成）
- 字幕：无（语音内嵌为 MP4 音轨）

**渲染命令：**
```bash
C:\Users\huiyan\Documents\Repertory\agent-loop-video\node_modules\.bin\remotion.cmd render \
  C:\Users\huiyan\Documents\Repertory\agent-loop-video\src\index.js \
  DetailedIntro \
  C:\Users\huiyan\Documents\Repertory\agent-loop-video\out\detailed-intro.mp4
```
