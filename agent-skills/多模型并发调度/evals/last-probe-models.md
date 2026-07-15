# 模型可用性探测报告

生成时间: 2026/7/15 10:11:17

## 路权总览

| 池 | 总路数 | 可用模型数 | 可用路数 |
|------|--------|------------|----------|
| 免费池 | 27 | 2 / 8 | 21 |
| 主力池 | 3000 | 0 / 2 | 0 |

免费池明细：
- xfyun:xophunyuan7bmt — 20 路 — ✅
- siliconflow:tencent/Hunyuan-MT-7B — 1 路 — ❌ failed
- siliconflow:deepseek-ai/DeepSeek-R1-0528-Qwen3-8B — 1 路 — ❌ failed
- siliconflow:Qwen/Qwen3-8B — 1 路 — ❌ failed
- siliconflow:THUDM/GLM-Z1-9B-0414 — 1 路 — ❌ failed
- siliconflow:THUDM/GLM-4-9B-0414 — 1 路 — ❌ failed
- siliconflow:Qwen/Qwen2.5-7B-Instruct — 1 路 — ❌ failed
- zhipu:glm-4-flash — 1 路 — ✅

## 汇总

- usable_text (ok 且含 mt/chat): 2
- usable_mt: 1
- failed: 8
- skipped_no_key: 0
- unsupported_for_text_ping: 0

## 明细

| provider | modelId | lanes | tier | capability | ok | latency_ms | status | error |
|---|---|---:|---|----|---:|---|---|
| xfyun | xophunyuan7bmt | 20 | free | mt | true | 1006 | ok |  |
| siliconflow | Hunyuan-MT-7B | 1 | free | mt,chat | false | 220 | failed | {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null} |
| siliconflow | DeepSeek-R1-0528-Qwen3-8B | 1 | free | chat | false | 198 | failed | {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null} |
| siliconflow | Qwen3-8B | 1 | free | chat | false | 189 | failed | {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null} |
| siliconflow | GLM-Z1-9B-0414 | 1 | free | chat | false | 217 | failed | {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null} |
| siliconflow | GLM-4-9B-0414 | 1 | free | chat | false | 238 | failed | {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null} |
| siliconflow | Qwen2.5-7B-Instruct | 1 | free | chat | false | 246 | failed | {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null} |
| zhipu | GLM-4-Flash | 1 | free | chat | true | 1767 | ok |  |
| deepseek | DeepSeek-V4-Pro | 500 | primary | chat,reasoning | false | 281 | failed | {"error":{"message":"The supported API model names are deepseek-v4-pro or deepseek-v4-flash, but you passed DeepSeek-V4-Pro.","type":"invalid_request_error","param":null,"code":"in |
| deepseek | DeepSeek-V4-Flash | 2500 | primary | chat,reasoning | false | 249 | failed | {"error":{"message":"The supported API model names are deepseek-v4-pro or deepseek-v4-flash, but you passed DeepSeek-V4-Flash.","type":"invalid_request_error","param":null,"code":" |

Key masks: xfyun=f810...MTg3 (len=65) silicon=sk-f...mhat (len=51) zhipu=11a6...CNgn (len=49) deepseek=sk-f...b0db (len=35)
