# OpenCLI-下载飞书文档

## 用途

用 OpenCLI browser 打开任意飞书文档 URL，逐页滚动提取全文 Markdown，保存到本地。

## 快速开始

```bash
cd common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档

# 下载指定飞书文档
node scripts/download.js \
  --url "https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX" \
  --out "./output/cache.md"
```

## 前置条件

- `opencli` 已安装：`npm install -g @jackwener/opencli`
- `opencli doctor` 全部通过（daemon + browser bridge 已连接）
- 浏览器中已登录飞书

## 文件索引

| 路径 | 说明 |
|------|------|
| `SKILL.md` | 功能契约 |
| `scripts/download.js` | 主入口 |
| `lib/opencli.js` | OpenCLI 封装 |
| `configs/download.config.json` | 运行时参数 |
| `references/feishu-spa-scroll.md` | SPA 滚动知识 |
