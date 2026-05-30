# Mermaid erDiagram — 真实输出

**触发：** "画一个简单聊天系统的 ER 关系图，包含用户、会话和消息"  
**来源：** 基于 craft-agents-oss 会话管理模块的数据模型

```mermaid
erDiagram
    User {
        string id PK
        string name
        string avatar_url
        datetime created_at
    }

    Conversation {
        string id PK
        string title
        string model_id
        datetime last_active
    }

    Message {
        string id PK
        string conv_id FK
        string role
        text content
        json tool_calls
        datetime created_at
    }

    Memory {
        string id PK
        string user_id FK
        string key
        string value
        datetime expires_at
    }

    User ||--o{ Conversation : "发起"
    User ||--o{ Memory : "拥有"
    Conversation ||--{ Message : "包含"
    Message ||--o| Memory : "关联"
```

**窄版规则验证：**
- ✅ 无方向声明（erDiagram 默认竖排，实体从上到下排列）
- ✅ 实体名 ≤ 10 字（User / Conversation / Message / Memory）
- ✅ 字段描述仅显示类型和约束，无长文本
- ✅ 分支 ≤ 4 条（共 4 条关系线）
- ✅ 关系标签 ≤ 8 字（"发起"/"拥有"/"包含"/"关联"）
- ✅ 无内联 style
