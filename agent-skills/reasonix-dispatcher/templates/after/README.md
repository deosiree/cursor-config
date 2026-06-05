# 改后：Reasonix 委派（Dispatcher 路由）

## 状态

编码/问答任务通过 dispatcher 路由到 Reasonix。Hermes 只做轻量编排：
- Hermes：~500 token 编排 + 意图判断
- Reasonix：~3K token 推理（>90% cache hit）
- 总消耗：~3.5K token（对比改前 ~15K）

## 典型流程

```
用户：帮我写个 Python 脚本读取 CSV

→ Hermes 加载 system prompt（~2K token）
→ Hermes 加载 skill 列表（~25K token）
→ dispatcher.classify → "code"
→ dispatcher.dispatch("帮我写个 Python 脚本读取 CSV")
  → terminal("reasonix run "帮我写个 Python 脚本读取 CSV"")
  → Reasonix 执行（cache hit > 55%）
  → 返回 stdout
→ Hermes 整理输出回复用户
→ 总消耗：~500 token 编排 + Reasonix ~3K（cache hit 55-95%）
```

## 优势

- 重推理在 Reasonix 的 Immutable Prefix 循环内完成，缓存逐渐升温
- Reasonix 首次 55% cache hit，后续 >95%
- Hermes 编排 token 极低（~500 token/次）
- Skill 桥接使 Hermes skill 也能在 Reasonix 内加载
- Reasonix 不可用时透明 fallback，零中断

## 真实验证

```
本轮对话中 reasonix-dispatcher 脚本生成过程：

1. dispatcher 检测到 "写脚本" → intent=code
2. terminal("reasonix run "Write a Python script...dispatcher"")
3. Reasonix 返回：cache:55.3% cost:$0.001045
4. write_file 落盘
5. 总耗时：< 10 秒
6. 对比如果 Hermes 全程跑：预估 ~15K token，$0.003+
```
