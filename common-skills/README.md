# Common Skills — 通用能力路由中心

> **原则：** 只做路由，不做拷贝。每个子目录是一个"能力类别"，内含 `SKILL.md`（Agent 可读的路由逻辑）和 `README.md`（人类可读的说明）。

## 快速索引：我需要……

| 需求 | 去哪个目录 | 提供什么 |
|------|-----------|---------|
| 🧑‍🏫 用费曼/苏格拉底/金字塔写内容 | [[方法论skills/SKILL.md]] | 根据知识点特征选择方法论 → 跳转到已有方法文档 |
| 📊 画流程图/架构图/数据表 | [[渲染图skills/SKILL.md]] | Mermaid（内嵌）或 output-html（独立页面） |
| 🔍 探索本地仓库/GitHub/网站 | [[探索skills/SKILL.md]] | 本地 tree+read / GitHub raw / OpenCLI 网站抓取 |
| 🖼️ 生成图片 | [[生图skills/SKILL.md]] | image-gen · Mermaid→PNG · HTML截图 |
| 🎬 生成视频 | [[视频skills/SKILL.md]] | Remotion · OpenMontage · TikTok模板 |
| 🔊 文字转语音 | [[语音tts-skills/SKILL.md]] | edge-tts（免费）· 文档转播客 · OpenAI TTS |
| 🌐 浏览器自动化 | [[浏览器自动化-skills/OpenCLI/SKILL.md]] | OpenCLI 驱动真实 Chrome · 自动化测试 · 手动操作模拟 · SPA 爬虫 |

## 目录结构

```
common-skills/
├── README.md              ← 你在这里
├── 浏览器自动化-skills/     ← OpenCLI 驱动真实 Chrome（自动化测试/手动操作/爬虫）
├── 方法论skills/           ← 费曼/苏格拉底/金字塔 路由
│   ├── SKILL.md
│   ├── README.md
│   └── references/
├── 渲染图skills/           ← Mermaid/HTML/AI生图 路由
│   ├── SKILL.md
│   ├── README.md
│   └── references/
├── 探索skills/             ← 本地仓库/GitHub/网站 路由
│   ├── SKILL.md
│   ├── README.md
│   └── references/
├── 生图skills/             ← 待建
├── 视频skills/             ← 待建
└── 语音tts-skills/         ← 待建
```

## 如何使用（Agent 视角）

```
1. 判断你需要什么能力 → 查"快速索引"
2. 读对应目录的 SKILL.md → 按路由规则跳转
3. 所有实际内容都在外部已有 skill 中，本目录不拷贝
```

## 引用源总览

| 被引用的已有 Skill | 被哪些路由中心引用 |
|-------------------|-------------------|
| `agent-skills/QA转面经/方法论库/` | 方法论skills |
| `role-skills/feynman-skill/` | 方法论skills |
| `html-skills/output-html/` | 渲染图skills · 生图skills |
| `md-skills/通用-Mermaid绘图/` | 渲染图skills |
| `md-skills/文档转播客/` | 语音tts-skills（MP3 脚本） |
| `html-skills/output-html/subskills/image-gen/` | 生图skills |
| `test-skills/opencli-ux-role-tab-validation/` | 浏览器自动化-skills/OpenCLI |
| `test-skills/opencli-ux-tenant/` | 浏览器自动化-skills/OpenCLI |
| `common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档/` | 浏览器自动化-skills/OpenCLI |

## 外部工具生态

| 工具 | 用途 | 路由中心 | 安装命令 |
|------|------|---------|---------|
| [rany2/edge-tts](https://github.com/rany2/edge-tts)（11k⭐） | 免费微软 TTS CLI | 语音tts-skills | `pip install edge-tts` |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion)（25k⭐） | React 渲染视频 | 视频skills | `npx create-video@latest` |
| [SamurAIGPT/Generative-Media-Skills](https://github.com/SamurAIGPT/Generative-Media-Skills)（3.4k⭐） | 41个工作流 + 100+AI模型 | 生图skills · 视频skills | `npm install -g muapi-cli && npx skills add SamurAIGPT/Generative-Media-Skills --all` |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage)（4k⭐） | Agentic 视频制作 | 视频skills | 见仓库 README |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit)（1.3k⭐） | Claude Code 视频工具 | 视频skills | 见仓库 README |

### 一键安装全部外部工具

```bash
# TTS
pip install edge-tts

# 生图 + AI 视频（100+ 模型，需要 API key：https://muapi.ai/dashboard）
npm install -g muapi-cli
muapi auth configure
npx skills add SamurAIGPT/Generative-Media-Skills --all

# React 视频
npx create-video@latest my-video-project

# 可选：AI 生图/视频（付费，不配置也不影响 Remotion + edge-tts + moviepy 免费路径）
# 配置指南 → [[references/muapi-api-key配置指南.md]]
# npm install -g muapi-cli && muapi auth configure
```

## 新增能力类别

1. 在 `common-skills/` 下新建 `{类别名}/`
2. 至少包含：`SKILL.md`（Agent 路由）+ `README.md`（人类说明）
3. 如有外部引用，加 `references/source-map.md`
4. 更新本文件的"快速索引"表
