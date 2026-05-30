# Mermaid sequenceDiagram — 真实输出

**触发：** "画用户输入到 Agent 回复的时序图"  
**来源：** 基于 craft-agents-oss `query.ts` 的 Agent Loop 12 步链路

````markdown
```mermaid
sequenceDiagram
    actor U as 用户
    participant R as REPL.tsx
    participant H as handlePromptSubmit
    participant P as processUserInput
    participant Q as query()
    participant L as LLM
    participant T as Tool

    U->>R: 输入消息
    R->>H: onSubmit()
    H->>P: executeUserInput()
    P-->>H: messages + shouldQuery
    H->>Q: query(messages, toolUseContext)

    loop Agent Loop
        Q->>L: callModel(messages)
        L-->>Q: tool_use: search
        Q->>T: executeTool(search)
        T-->>Q: 搜索结果
        Q->>Q: 组装下一轮 messages
    end

    L-->>Q: end_turn: 完整回复
    Q-->>U: 显示回复 + 保存会话
```
````

**来源：** 此图直接对应 craft-agents-oss 的源码链路：`REPL.tsx` → `handlePromptSubmit.ts` → `processUserInput.ts` → `query.ts`。
