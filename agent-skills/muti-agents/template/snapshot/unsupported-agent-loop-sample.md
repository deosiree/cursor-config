# 未支持 Agent 适配 Loop 样本

## 任务

示范如何在没有充分委派接口证据时停止适配，而不是猜测并登记支持。

## 输入

- 候选宿主：agentx（假设名称，不代表已测试产品）
- 观察：本地帮助仅展示一般命令，没有可确认的任务委派子命令
- 目标：判断是否可添加适配器

## 输出

~~~text
agentId: unknown
evidence: observed: help output lacks a delegation command
transport: unverified
files: none
smoke: not run
decision: stop pending a confirmed invocation interface
~~~

## 边界

本样本为假设场景，不声称测试过该产品。未确认任务接口前不创建脚本、不编辑 agents-registry.json，也不使用真实凭据探测。

## 示例

如用户提供新的官方帮助或当前可见工具清单，可开启新的探测轮次；无进展两轮后输出 🛑 STOP 并保留证据。
