# 视频skills dry_run 测试记录

> **模式：** dry_run（人工推演，非真机执行）
> **日期：** 2026-05-30
> **SKILL 版本：** 优化后（含判断优先级 + 路由确认 + 依赖预检 + 降级策略）

---

## TC-1: video-animation-remotion

**Prompt：** 把 Agent Loop 的流程做成动画视频  
**Expected：** 判断优先级第7条→Remotion。确认 fps/分辨率/时长→npx remotion render。产出 mp4

### 推演跟踪

| 步骤 | SKILL 节 | Agent 行为 | 结果 |
|:----:|---------|-----------|:----:|
| 1 | RED 追问模板 | 需求明确（动画视频），不触发追问 | ✅ 跳过 |
| 2 | 判断优先级 1-6 | ❌ 不需要配音 → ❌ 不是竖屏 → ❌ 不复杂 → ❌ 不是 AI 生成 → ❌ 不需要 Claude Code 驱动 → ❌ 不是播客 | ✅ 向下 |
| 3 | 判断优先级 7 | ✅ **否则 → Remotion** | ✅ 选中 |
| 4 | 路由确认 | 第7条例外，省略确认 | ✅ 跳过 |
| 5 | 依赖预检 | `npx remotion --version` → 未安装 → `npx create-video@latest agent-loop-video` | ✅ 自动安装 |
| 6 | GREEN 执行 | `npx remotion render src/index.ts out/agent-loop.mp4 --props='{"duration": 60}'` | ✅ 具体命令 |
| 7 | 检查点 | 渲染前确认 `durationInFrames`/`fps`/分辨率 | ✅ 用户确认 |

**验证：** 路由路径与实际 few-shot（`template/few-shot-remotion-命令.md`）完全一致。  
**结论：** ✅ PASS — 推演与预期一致。

---

## TC-2: video-audio-subtitle

**Prompt：** 把这个演讲稿做成带字幕的视频  
**Expected：** 判断优先级第1条→路由到 subskills/生成有声字幕视频/SKILL.md

### 推演跟踪

| 步骤 | SKILL 节 | Agent 行为 | 结果 |
|:----:|---------|-----------|:----:|
| 1 | RED 追问模板 | 需求明确（演讲稿+字幕），不触发追问 | ✅ 跳过 |
| 2 | 判断优先级 1 | ✅ **需要配音+字幕？→ subskills/生成有声字幕视频/SKILL.md** | ✅ 选中 |
| 3 | 路由确认 | 展示「根据判断优先级第1条，将路由到 **生成有声字幕视频**。是否继续？」 | ✅ 用户确认 |
| 4 | 子技能 | 子技能 RED 确认素材来源 → 确定 Remotion 路线 | ✅ 走 编排-为Remotion视频配音 |
| 5 | 子技能 入参 | `视频素材`=演讲稿文字稿, `旁白稿`=自动生成, `语音风格`=默认男声 | ✅ 参数完备 |
| 6 | 依赖预检 | `edge-tts --version` 或 `pip show edge-tts` → 未安装 → pip install | ✅ 自动安装 |
| 7 | 执行链路 | 写旁白稿 → edge-tts(narration.mp3+SRT) → 反推 durationInFrames → Remotion无声渲染 → moviepy 合成 | ✅ 6 步完整 |
| 8 | 子技能 检查点 | 渲染前确认参数，合成后验证音视频 | ✅ 下沉子技能 |

**验证：** 路由路径与 `template/few-shot-remotion-有声字幕.md` 完全一致，且触发子技能的全部入参和约束。  
**结论：** ✅ PASS — 推演与预期一致。

---

## TC-3: video-ai-gen

**Prompt：** 用 AI 生成一段 15 秒的产品展示视频，描述文案：我们的产品是一款智能水杯...  
**Expected：** 判断优先级第4条→muapi + Kling/Seedance。先检查 muapi key→可用则 muapi video generate

### 推演跟踪

| 步骤 | SKILL 节 | Agent 行为 | 结果 |
|:----:|---------|-----------|:----:|
| 1 | RED 追问模板 | 需求明确（AI生成），不触发追问 | ✅ 跳过 |
| 2 | 判断优先级 1-3 | ❌ 不需要配音 → ❌ 不是竖屏 → ❌ 不复杂(1 场景) | ✅ 向下 |
| 3 | 判断优先级 4 | ✅ **AI 生成视频（用户给文字描述）？→ muapi + Kling/Seedance** | ✅ 选中 |
| 4 | 路由确认 | 展示确认消息「根据判断优先级第4条，将路由到 **muapi + Kling/Seedance**。是否继续？」 | ✅ 用户确认 |
| 5 | 依赖预检 | `muapi --version` → 未安装 → `npm install -g muapi-cli && muapi auth configure` → 引导用户配置 key | ✅ 自动安装+引导 |
| 6 | 检查点 | 展示 prompt 预览 + 模型选择，请用户确认 | ✅ 渲染前确认 |
| 7 | 降级兜底 | 若 muapi key 仍不可用 → 展示命令预览 + 引导 Remotion | ✅ 降级路径存在 |

**结论：** ✅ PASS — 推演与预期一致。

---

## TC-4: video-ambiguous-request

**Prompt：** 帮我做个视频  
**Expected：** 暂停追问：时长/内容/风格/配音。不可直接默认选 Remotion

### 推演跟踪

| 步骤 | SKILL 节 | Agent 行为 | 结果 |
|:----:|---------|-----------|:----:|
| 1 | RED 失败基线 | 触发「视频需求模糊」→ **必须暂停追问，不可自行假设** | ✅ 拦截 |
| 2 | RED 追问模板 | 输出追问模板全文：时长/内容/风格/配音 | ✅ 模板存在 |
| 3 | 用户响应 | 假设用户回答：30秒、文字稿、教程动画、需要配音 | — |
| 4 | 判断优先级 | ✅ 需要用配音+字幕 → 第1条 → subskills/生成有声字幕视频/SKILL.md | ✅ 正确 |
| 5 | 后续 | 继续走路由确认 → 依赖预检 → 执行 | ✅ 完整链路 |

**结论：** ✅ PASS — 追问模板拦截模糊需求，不走默认 Remotion。

---

## TC-5: video-openmontage-fallback

**Prompt：** 用 OpenMontage 做一个复杂的多场景解说视频（模拟 OpenMontage 未安装）  
**Expected：** 检测 OpenMontage 不可用→降级 Remotion，提示"OpenMontage 不可用，已切换 Remotion 免费路径"

### 推演跟踪

| 步骤 | SKILL 节 | Agent 行为 | 结果 |
|:----:|---------|-----------|:----:|
| 1 | 判断优先级 3 | ✅ **复杂视频项目（>12步）？→ OpenMontage** | ✅ 选中 |
| 2 | 路由确认 | 展示确认消息 | ✅ 用户确认 |
| 3 | 依赖预检 | `ls path/to/OpenMontage/` → 不存在 | ✅ 检测到 |
| 4 | 降级策略 | OpenMontage 行 → **降级为 Remotion** + 提示信息 | ✅ 降级策略存在 |
| 5 | 执行 | Remotion 手动实现核心动画 | ✅ 替代路径 |
| 6 | 用户感知 | 看到提示「OpenMontage 不可用，已切换 Remotion 免费路径」，不静默失败 | ✅ 透明 |

**结论：** ✅ PASS — 降级路径完整，用户可见。

---

## 汇总

| ID | Category | 结果 | 覆盖路径 |
|:---|:--------:|:----:|---------|
| video-animation-remotion | happy_path | ✅ PASS | 判断优先级7→Remotion→渲染 |
| video-audio-subtitle | happy_path | ✅ PASS | 判断优先级1→子技能→配音合成 |
| video-ai-gen | happy_path | ✅ PASS | 判断优先级4→muapi→AI生成 |
| video-ambiguous-request | edge_case | ✅ PASS | 追问模板→澄清→决策树 |
| video-openmontage-fallback | resilience | ✅ PASS | 判断优先级3→预检失败→降级 |

**覆盖率：** 5/5 条 eval 推演通过，覆盖 7 条判断优先级中的 5 条（1/3/4/7 + 追问拦截）。
**未覆盖：** 优先级 2（template-tiktok）、优先级 5（claude-code-video-toolkit）、优先级 6（podcast-maker）— 需要对应 few-shot 记录或实测。
