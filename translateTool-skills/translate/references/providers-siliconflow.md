# 硅基流动（SiliconFlow）模型目录

Base URL：`https://api.siliconflow.cn/v1`（OpenAI 兼容 `/v1/chat/completions`）

环境变量见仓库根目录 `.env` / `.env.example`：`SILICONFLOW_API_KEY`、`SILICONFLOW_BASE_URL`、`SILICONFLOW_MODEL`。

与代码常量 `lib/modelCatalog.js` 的 `SILICONFLOW_MODELS` 保持同步。

## 对话 + 多模态（默认不进词条翻译 worker）

| modelId | capabilities | 说明 |
|---------|--------------|------|
| `Qwen/Qwen3.5-4B` | chat, vision | 视觉输入、工具调用；翻译可选 chat |
| `PaddlePaddle/PaddleOCR-VL-1.5` | vision, ocr | OCR；探测可文本 ping |
| `deepseek-ai/DeepSeek-OCR` | vision, ocr | OCR；探测可文本 ping |

## 对话 / 翻译（可进翻译分摊 / `--models all`）

| modelId | capabilities | 说明 |
|---------|--------------|------|
| `tencent/Hunyuan-MT-7B` | mt, chat | **硅基默认最高优先**（翻译） |
| `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B` | chat | 通用助手、推理、编程 |
| `Qwen/Qwen3-8B` | chat | 通用助手 |
| `THUDM/GLM-Z1-9B-0414` | chat | 长文本 / RAG |
| `THUDM/GLM-4-9B-0414` | chat | 文案、编程 |
| `Qwen/Qwen2.5-7B-Instruct` | chat | 文案、编程 |

## 与全局策略

| modelPolicy | 行为 |
|-------------|------|
| `single`（默认） | 只跑优先级最高的一个（讯飞 MT → 硅基 Hunyuan-MT → … → 智谱） |
| `list` | `--multi-model --models id1,id2` 分摊批次 |
| `all` | `--multi-model --models all`，全部 **mt+chat**（不含纯 OCR） |

详见：[`concurrency-dag.md`](concurrency-dag.md)、根 skill [README.md](../README.md)「多模型」专节、子 skill [探测-模型可用性](../feature-skills/探测-模型可用性/SKILL.md)。
