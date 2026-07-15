# 模型可用性探测报告

生成时间: 2026/7/14 21:35:42

## 汇总

- usable_text (ok 且含 mt/chat): 8
- usable_mt: 1
- failed: 1
- skipped_no_key: 0
- unsupported_for_text_ping: 0

## 明细

| provider | modelId | capability | ok | latency_ms | status | error |
|---|---|---|---|---:|---|---|
| xfyun | xophunyuan7bmt | mt | true | 1077 | ok |  |
| siliconflow | Qwen/Qwen3.5-4B | chat,vision | true | 3859 | ok |  |
| siliconflow | PaddlePaddle/PaddleOCR-VL-1.5 | vision,ocr | true | 216 | ok |  |
| siliconflow | deepseek-ai/DeepSeek-OCR | vision,ocr | true | 394 | ok |  |
| siliconflow | tencent/Hunyuan-MT-7B | mt,chat | false | 31275 | failed | read ECONNRESET |
| siliconflow | deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | chat | true | 8813 | ok |  |
| siliconflow | Qwen/Qwen3-8B | chat | true | 9009 | ok |  |
| siliconflow | THUDM/GLM-Z1-9B-0414 | chat | true | 3487 | ok |  |
| siliconflow | THUDM/GLM-4-9B-0414 | chat | true | 364 | ok |  |
| siliconflow | Qwen/Qwen2.5-7B-Instruct | chat | true | 930 | ok |  |
| zhipu | glm-4-flash | chat | true | 649 | ok |  |

Key masks: xfyun=f810...MTg3 (len=65) silicon=sk-f...mhat (len=51) zhipu=11a6...CNgn (len=49)
