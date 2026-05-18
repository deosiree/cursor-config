# 流程图（Flowchart）语法规则

Mermaid 中最常用的图表类型，用于展示流程、管道、数据流和系统拓扑。

## 语法模板

```mermaid
flowchart TD
    %% 节点定义
    Start(("开始")) --> Process["处理步骤"]
    Process --> Condition{"判断条件"}
    Condition -->|"通过"| Success["成功"]
    Condition -->|"失败"| Fail["失败"]
    Success --> DB[("数据库")]
    Fail --> End(["结束"])

    %% classDef 批量样式（必须使用字面颜色）
    classDef process fill:#0891b2,stroke:#0369a1,color:#fff
    classDef decision fill:#d97706,stroke:#b45309,color:#fff
    classDef terminal fill:#059669,stroke:#047857,color:#fff

    class Process process
    class Condition decision
    class Start,End terminal
```

## 节点形状对照

| 写法 | 形状 | 语义 |
|------|------|------|
| `A["文字"]` | 圆角矩形 | 默认处理步骤 |
| `A{"文字"}` | 菱形 | 判断/分支 |
| `A(("文字"))` | 圆形 | 起始/结束 |
| `A[["文字"]]` | 圆柱 | 数据库/存储 |
| `A>["文字"]` | 旗帜 | 输出/异步 |
| `A["文字"]` | 矩形 | 通用步骤 |

## 边缘连接

| 写法 | 含义 |
|------|------|
| `A --> B` | 箭头指向 |
| `A -->|"标签"| B` | 带文字标签 |
| `A -.-> B` | 虚线（可选路径） |
| `A ==> B` | 粗线（主要路径） |
| `A --x B` | 叉线（失败路径） |
| `A & B --> C` | 多路汇聚 |

## 子图

```mermaid
flowchart TD
    subgraph 外部["外部系统"]
        A["请求入口"] --> B["认证"]
    end
    subgraph 内部["内部服务"]
        C["业务处理"] --> D["数据库"]
    end
    B --> C
```

## 布局提示

- 10 节点以内：直接使用 `flowchart TD`
- 10-15 节点：加 `layout: 'elk'` 改善自动布局
- 15+ 节点：拆分为混合模式（概览图 + 详细卡片）
- `style` 指令永远不要使用 CSS 变量
