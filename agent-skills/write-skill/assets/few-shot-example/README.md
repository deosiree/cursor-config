# 会话总结skill

## 定位
把一次较长的开发或排障对话整理成结构化中文总结，便于后续继续推进。

## 适用场景
- 当对话已经很长，需要做阶段性沉淀。
- 当准备切换会话，但不希望上下文丢失。

## 不适用场景
- 不用于正式对外公告。
- 不用于替代完整技术文档。

## 输入契约
- `对话内容`：当前会话中的关键上下文。
- `目标读者`：后续继续处理该任务的人或 agent。

## 输出结构
- 一份结构化中文总结
- 包括目标、现状、已完成、未完成、风险、下一步

## 使用示例

```text
使用 $会话总结skill 总结当前关于登录页异常排查的对话，供下个会话继续使用
```

## 配套资源跳转
- 结构验收参考：[[../skill-output-checklist.md]]
- frontmatter 占位参考：[[../frontmatter-template.yaml]]
- Markdown 结构规则：[[../../references/markdown-format-rules.md]]
- 长说明应下沉到：[[../../references/writing-skills-core.md]]
