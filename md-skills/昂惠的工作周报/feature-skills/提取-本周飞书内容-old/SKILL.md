---
name: 提取-本周飞书内容
description: 从飞书文档《达人BD每日工作记录》中提取指定周的工作内容。输入自然语言（本周/上周/上上周/5.18那周/5.18-5.22），双锚点截取文本并检测 todo-line-through 勾选状态，输出带 checked 标记的原始工作项 JSON 列表。触发词：提取飞书内容、提取本周内容、提取上周工作、parse feishu doc、extract weekly tasks、拉取飞书周报数据。
---

# 提取-本周飞书内容

## 依赖

- OpenCLI 浏览器连接（用于下载飞书文档 + 勾选态检测）
- `scripts/extract-week.js` — 本地脚本，双锚点截取目标周内容

## 输入

| 参数 | 说明 | 默认值 |
|------|------|--------|
| 飞书URL | `https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX` | — |
| targetWeek | 自然语言：`"本周"` / `"上周"` / `"上上周"` / `"5.18那周"` / `"5.18-5.22"` | `"本周"` |

## 流程

### 1. 下载飞书文档全文 → 本地缓存

调用通用下载 skill `OpenCLI-下载飞书文档`：

```bash
node ../../../../common-skills/探索skills/feature-skills/OpenCLI-下载飞书文档/scripts/download.js \
  --url "https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX" \
  --out "./template/snapshot/飞书文档-全文缓存.md"
```

> **url 默认值:** `https://zru9fxhvq5.feishu.cn/wiki/IbuLwEv7fituvMkrSaWc86CjncX`（特化在此 skill 中，通用 skill 无默认值）
> **out 默认值:** `./template/snapshot/飞书文档-全文缓存.md`（每次下载覆盖旧文件）

此后的步骤全部从本地缓存离线读取，不再依赖 OpenCLI 实时 DOM。

### 2. 自然语言 → 日期范围 + 双锚点截取

```bash
# 方式 A：传入自然语言（脚本内置日期映射）
node scripts/extract-week.js \
  --cache ./template/snapshot/飞书文档-全文缓存.md \
  --target-week "本周"

# 方式 B：传入精确日期范围
node scripts/extract-week.js \
  --cache ./template/snapshot/飞书文档-全文缓存.md \
  --start "5.25" --end "5.29"
```

脚本自动完成：自然语言→日期范围→扫描周标记→匹配起始/终止锚点→截取→解析工作项（过滤日期标题、空行、图片链接）。

详细算法见 [[references/week-anchor-pattern.md]]。

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

### 3. 检测勾选状态（依赖 OpenCLI DOM）

对截取文本中的每条工作项，逐段 OpenCLI eval 检测飞书 `todo-line-through` CSS class。

> 检测原理 + 虚拟滚动处理见 [[references/feishu-checkbox-detect.md]]。

勾选态合并到步骤 2 的输出：
```json
{"text": "建联25位达人...", "checked": true, "day": "周二"}
```

### 4. 输出（向下游传递）

```json
[
  {"text": "建联25位达人，寄样10位...", "checked": true, "day": "周二"},
  {"text": "2000投流费用预算申请...", "checked": false, "day": "周一"},
  ...
]
```

## 检查点（三阶段人机确认）

> 每个检查点 Agent 必须暂停并等待人工回复"继续"后才能进入下一阶段。

### CP1：下载确认（步骤 1 之后）

```
1. 校验 ./template/snapshot/飞书文档-全文缓存.md 存在且非空
2. 展示：文件大小 (KB)、行数
3. 如文件为空或缺失 → 报错，检查 OpenCLI 连接或 download.js 脚本
4. 确认后回复"继续"，进入文本提取
```

### CP2：提取确认（步骤 2 之后）

```
展示提取摘要：
- 目标周：{start}-{end}
- 匹配锚点：{anchorStart}
- 提取到 N 条工作项
- 按天分布：周一 X 条、周二 Y 条...

确认周范围和条目数正确后回复"继续"，进入勾选态检测。
如周范围不对 → 检查 targetWeek 参数后重试步骤 2。
```

### CP3：勾选态确认（步骤 3 之后，输出之前）

```
展示勾选态统计：
- 已勾选 (checked=true)：X 条
- 未勾选 (checked=false)：Y 条
- 无法检测 (checked=null)：Z 条

确认无误后回复"继续"，输出最终 JSON。
如勾选态明显不对 → 重新执行步骤 3（可能需调整滚屏策略）。
```

## 资源索引

| 路径 | 用途 |
|------|------|
| `[[scripts/extract-week.js]]` | 双锚点截取脚本 |
| `[[scripts/eval-download.js]]` | 测评：下载结果 vs 模板比对 |
| `[[references/week-anchor-pattern.md]]` | 双锚点正则模式 + 算法详解 |
| `[[references/feishu-checkbox-detect.md]]` | todo-line-through 检测 + 虚拟滚动处理 |
| `[[references/飞书文档-全文缓存-template.md]]` | 文档结构参考（含完整示例） |
| `[[template/mvp/extract-result.json]]` | 期望输出样本（17 条原始项） |
| `[[template/snapshot/飞书文档-全文缓存.md]]` | 运行时缓存（每次覆盖） |

## 门禁

| 条件 | 处理 |
|------|------|
| download.js 执行超时（>60s） | 终止，返回超时错误 |
| download.js 执行失败（OpenCLI 不可用） | 报错：无法下载飞书文档，检查浏览器登录态和 OpenCLI 连接 |
| download.js 退出码 2（部分下载） | 缓存文件仍可用，标注 `"partial_download": true`，后续步骤基于不完整数据继续 |
| 本地缓存文件不存在 | 报错：飞书文档下载失败，缓存未生成 |
| 缓存文件为空 | 报错：飞书文档内容为空或下载不完整 |
| extract-week.js 执行失败 | 报错并展示 stderr，检查 Node.js 环境和缓存文件编码（需 UTF-8） |
| 未找到任何周标记 | 报错：文档格式异常，未找到 MM.DD-MM.DD 格式的周标记。展示缓存文件前 500 字符供人工诊断 |
| 未找到匹配起始锚点 | 报错：未找到 `{targetWeek}` 对应的周标记。列出文档中所有可用周范围 |
| 截取到 0 条工作项 | 报错：该周内容为空。展示截取范围的起止文本供人工诊断 |
