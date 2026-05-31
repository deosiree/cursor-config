---
name: 提取-本周飞书内容
description: 从飞书文档《达人BD每日工作记录》中提取指定周的工作内容。先用 feishu2md 下载文档到本地，自动排版标题层级（## 时间段 / ### 星期），再按双锚点截取目标周内容，检测勾选状态，输出带 checked 标记的原始工作项 JSON 列表。触发词：提取飞书内容、提取本周内容、提取上周工作、parse feishu doc、extract weekly tasks、拉取飞书周报数据。
---

# 提取-本周飞书内容

## 依赖

- `feishu2md` CLI（通过 `feishu2md-下载到本地` skill 调用）
- `scripts/extract-week.js` — 本地脚本，双锚点截取目标周内容
- 飞书应用"爱马仕"（凭证已配置在 `%APPDATA%/feishu2md/config.json`）

## 输入

| 参数 | 说明 | 默认值 |
|------|------|--------|
| 飞书URL | `https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX` | — |
| targetWeek | 自然语言：`"本周"` / `"上周"` / `"上上周"` / `"5.18那周"` / `"5.18-5.22"` | `"本周"` |

## 流程

### 1. 下载飞书文档 → 本地缓存

调用 `feishu2md-下载到本地` skill：

```
默认 URL：https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX
默认输出：D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md\达人 BD 每日工作记录.md
```

```bash
D:\FILE\Repository\feishu2md-v2.4.5-windows-amd64\feishu2md.exe dl \
  -o "D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md" \
  "https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX"
```

> 每次下载覆盖旧文件。图片自动存入 `feishu2md/static/`。

### 2. 格式化标题层级

执行 `scripts/format-headings.py` 对下载的 Markdown 自动排版：

```bash
python scripts/format-headings.py \
  --input "D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md\达人 BD 每日工作记录.md" \
  --inplace
```

脚本内部规则（正则替换顺序，优先级从高到低）：

```python
# 1. 周时间范围 → ##（支持 5.11-5.15 / 5.18-22 两种日期格式）
#    加粗格式：**5.11-5.15** / **5.18-22 第三周工作记录**
DATE_RANGE = r'\d+\.\d+-\d+(?:\.\d+)?'
WEEK_SUFFIX = r'(?:第[一二三四五六七八九十]+周.*|工作记录.*)'
re.match(fr'^\*\*({DATE_RANGE})\s*({WEEK_SUFFIX})?\*\*$', line) → ##
re.match(fr'^({DATE_RANGE})\s+({WEEK_SUFFIX})$', line) → ##

# 2. 入职第X周 → ##（含日期后缀如 4.27-4.30）
re.match(r'^(入职第[一二三四五六七八九十百]+周.*)$', line) → ##

# 3. 星期几 → ###（兼容 **周一** 加粗格式）
re.match(r'^\*{0,2}(周[一二三四五六日](?:\s*\+\s*周[一二三四五六日])?)(?:：.*)?\*{0,2}$', line) → ###

# 4. 第一周自动补标题：第一个 ### 前如果没有 ## 则插入 ## 入职第一周

# 5. 下周计划 → ###
# 6. 挂车起号思路 → ##
```

> 原有加粗子段落（`**梳理工作时间：**`、`**绩效考核：**` 等）保持 `**` 不变，不会被上述规则误匹配。

脚本执行后原地覆盖输入文件。

### 3. 自然语言 → 日期范围 + 双锚点截取

```bash
# 方式 A：传入自然语言（脚本内置日期映射）
node scripts/extract-week.js \
  --cache "D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md\达人 BD 每日工作记录.md" \
  --target-week "本周"

# 方式 B：传入精确日期范围
node scripts/extract-week.js \
  --cache "D:\FILE\Obsidian Vault\昂惠的工作周报\feishu2md\达人 BD 每日工作记录.md" \
  --start "5.25" --end "5.29"
```

脚本自动完成：自然语言→日期范围→扫描周标记→匹配起始/终止锚点→截取→解析工作项（过滤日期标题、空行、图片链接）。

> **未来日期门禁：** 目标周超出文档最新记录时，脚本直接报错 `EXTRACT_FAILED`，不回退到最近一周。

算法详见 [[references/week-anchor-pattern.md]]。

#### LLM 兜底（脚本失败时）

当脚本无法匹配目标周时，带 `--fallback-llm` 重试：

```bash
node scripts/extract-week.js \
  --cache "..." --start "6.13" --end "6.17" \
  --fallback-llm
```

脚本退出码 2 时输出 `EXTRACT_FAILED_LLM_FALLBACK`，包含：
- `docSummary`：文档标题结构摘要（所有 H1/H2/H3/WEEK 行 + 行号）
- `llmPrompt`：可直接喂给 LLM 的定位提示

Agent 读取 `docSummary` 和 `llmPrompt`，根据标题结构找到最接近目标周的 `##` 区间，直接用 `read_file` 按行截取该段内容，手动解析为工作项 JSON。流程：脚本先跑 → 失败则 LLM 兜底。

输出 JSON：
```json
{
  "dateRange": {"start": "5.25", "end": "5.29"},
  "anchorStart": "5.25-5.29第四周",
  "anchorEnd": null,
  "count": 17,
  "items": [
    {"text": "建联25位达人，寄样10位...", "day": "周二"},
    ...
  ]
}
```

期望输出样本见 [[template/mvp/extract-result.json]]。

### 4. 检测勾选状态

feishu2md 下载的 Markdown 中，勾选状态已通过以下格式体现：

- `- [X]` → 已勾选 → `checked: true`
- `- [ ]` → 未勾选 → `checked: false`
- `~~文本~~`（删除线）→ 已完成 → `checked: true`

Agent 对提取后的每条 `text` 按顺序检查：

1. 原始文本含 `~~...~~` → 已完成 → `checked: true`，同时 strip 删除线
2. 原始文本含 `- [x]` 或 `- [X]` → `checked: true`
3. 原始文本含 `- [ ]` → `checked: false`
4. 其他 → 保持 extract-week.js 输出的默认值

> 旧方案（OpenCLI todo-line-through 检测）见 [[references/feishu-checkbox-detect.md]]，仅在 feishu2md 下载的 Markdown 无 checkbox 标记时降级使用。

勾选态合并到步骤 3 的输出：
```json
{"text": "建联25位达人...", "checked": true, "day": "周二"}
```

### 5. 输出（向下游传递）

```json
[
  {"text": "建联25位达人，寄样10位...", "checked": true, "day": "周二"},
  {"text": "2000投流费用预算申请...", "checked": false, "day": "周一"},
  ...
]
```

## 检查点（三阶段人机确认）

> 每个检查点 Agent 必须暂停并等待人工回复"继续"后才能进入下一阶段。

### CP1：下载 + 格式化确认（步骤 1-2 之后）

```
1. 校验 feishu2md 下载产物存在且非空
2. 展示：文件大小 (KB)、行数、标题列表（所有 ## 和 ###）
3. 确认标题层级正确后回复"继续"
4. 如 feishu2md 下载失败 → 检查飞书应用权限和网络
```

### CP2：提取确认（步骤 3 之后）

```
展示提取摘要：
- 目标周：{start}-{end}
- 匹配锚点：{anchorStart}
- 提取到 N 条工作项
- 按天分布：周一 X 条、周二 Y 条...

确认周范围和条目数正确后回复"继续"，进入勾选态检测。
如周范围不对 → 检查 targetWeek 参数后重试步骤 3。
```

### CP3：勾选态确认（步骤 4 之后，输出之前）

```
展示勾选态统计：
- 已勾选 (checked=true)：X 条
- 未勾选 (checked=false)：Y 条

确认无误后回复"继续"，输出最终 JSON。
如勾选态明显不对 → 检查 Markdown 中 - [x] / - [ ] 格式是否完整。
```

## 资源索引

| 路径 | 用途 |
|------|------|
| `[[scripts/format-headings.py]]` | 标题层级格式化脚本（##/###） |
| `[[scripts/extract-week.js]]` | 双锚点截取脚本 |
| `[[scripts/eval-download.js]]` | 测评：下载结果 vs 模板比对 |
| `[[references/week-anchor-pattern.md]]` | 双锚点正则模式 + 算法详解 |
| `[[references/feishu-checkbox-detect.md]]` | OpenCLI todo-line-through 检测（旧方案，降级用） |
| `[[references/飞书文档-全文缓存-template.md]]` | 文档结构参考 |
| `[[template/mvp/extract-result.json]]` | 期望输出样本（17 条原始项） |
| `[[template/snapshot/]]` | 运行时缓存（feishu2md 下载到独立目录，此处不再使用） |

## 门禁

| 条件 | 处理 |
|------|------|
| feishu2md 下载超时（>120s） | 终止，检查网络和飞书应用权限 |
| feishu2md 下载失败（权限/认证错误） | 报错：检查飞书应用权限（wiki:wiki:readonly + drive:drive:readonly） |
| 本地 Markdown 文件不存在 | 报错：feishu2md 下载失败，缓存未生成 |
| Markdown 文件为空 | 报错：飞书文档为空或下载不完整 |
| 标题格式化后层级异常 | 展示 ## 和 ### 列表供人工确认，重新调整 |
| extract-week.js 执行失败 | 报错并展示 stderr，检查 Node.js 环境 |
| 未找到任何周标记 | 报错：文档格式异常，未找到 MM.DD-MM.DD 格式的周标记 |
| 未找到匹配起始锚点 | 报错：未找到对应周标记，列出文档中所有可用周范围 |
| 截取到 0 条工作项 | 报错：该周内容为空 |
