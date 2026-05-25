---
title: "鹅厂面试官：\"MCP 就是 Function Calling 套了层壳？\" 我刚想点头，他：\"你点头之前先想三秒。\""
source: "https://mp.weixin.qq.com/s/OZGXAdEn1OfNcrcjpwTxxQ"
author:
  - "[[吴师兄]]"
published:
created: 2026-05-22
description:
tags:
  - "个人"
---
吴师兄 *2026年5月22日 10:01*

大家好，我是吴师兄。

这两天 MCP 在面试里出现的频率越来越高。Agent 工程岗、大模型应用岗、甚至原本只问 RAG 的岗位，简历上一旦写了"熟悉 MCP"，面试官就一定会从这一行往下追。

上周有个学员面腾讯，第二轮技术面遇到一位资深面试官。他扫到简历上"使用过 MCP 协议接入 Claude Code"那一行，放下笔，抬头给了一个标准的鹅厂式冷笑。

第一个问题就来了： **MCP 和 Function Calling 到底差在哪？**

学员答得不算差，说 MCP 是协议、Function Calling 是 API，前者标准化、后者临时；MCP 让工具能跨客户端复用，Function Calling 每个应用自己实现。这些点都对。

面试官摆摆手： **"别背概念。给我讲一个你真的用 MCP 解决了、Function Calling 解决不了的场景。"**

学员想了一下，开始讲他们项目里用 MCP 接了一个数据库工具。讲到一半，面试官又打断他：

"你这个场景，用 Function Calling 在 API 调用里写一个 `query_db` 函数也能做啊。 **那 MCP 解决了什么 Function Calling 解决不了的事情？** "

学员卡住了。

面试官没等他想，直接接了一刀： **"那如果我就一个内部 Agent，只服务于我们自己一个产品，是不是 Function Calling 就够了？什么场景下必须上 MCP？"**

这一刀下去，学员彻底懵。他后来回忆，他当时脑子里其实有答案的草稿，"开放生态""复用"，但话到嘴边变成了一堆术语堆砌，没有一个具体场景能站得住。

面试官最后给他下了一个判断："你说自己熟悉 MCP，但你只熟悉 MCP 的接入，没熟悉 MCP 的 **设计哲学** 。MCP 不是 Function Calling 的升级版，是另一种东西。这两个东西的边界你没想清楚，就敢往简历上写'熟悉'，这是态度问题。"

这一场技术面就在这里结束了。

MCP 是 Anthropic 在 2024 年 11 月正式开源的协议，到 2025 年 3 月 OpenAI 宣布支持、微软在 VS Code 1.99 引入 Agent Mode 之后，开始成为整个 Agent 工程圈绕不开的协议。但越是被提的多，越容易被理解成"Function Calling 的新封装"，这正是面试官冷笑的来源。

今天这篇文章，把 MCP 跟 Function Calling 的本质区别， **不是 API 形式，是设计哲学，** 从头到尾掰开讲。

## 一、Function Calling 是点对点，MCP 是协议

先把两个东西的定义放在一起看。

**Function Calling 的本质** ，是模型和单个应用之间的一次性约定。开发者在某次 API 调用里，把可用的函数列表通过 `functions` 字段塞进 request，模型决定要不要调用、调用哪个、传什么参数，然后返回一段 JSON，由开发者自己的代码去执行。

```
functions = [{
     "name": "get_weather",
     "description": "查询城市天气",
     "parameters": {"type": "object", "properties": {"city": {"type": "string"}}}
 }]
 resp = client.chat.completions.create(
     model="gpt-4o",
     messages=[{"role": "user", "content": "柏林天气如何？"}],
     functions=functions,
     function_call="auto",
 )
 # 拿到 {'name': 'get_weather', 'arguments': '{"city":"柏林"}'}
 # 然后你自己写代码去执行 get_weather("柏林")
```

注意三件事：第一，工具定义跟应用代码绑死，写在 API 调用的参数里；第二，函数实现由你的应用自己负责；第三，这套约定只在这一次会话里有效，换一个应用，所有东西都要重新写。

**MCP 的本质** 完全不一样。MCP 全称是 Model Context Protocol，它定义的是模型客户端和服务端之间的标准化通信协议，基于 JSON-RPC 2.0。工具的描述、参数 schema、能力声明，全部放在独立部署的 **MCP Server** 里。客户端只需要支持 MCP 协议，就能跟任意 MCP Server 通信。

![Function Calling vs MCP · 调用关系本质对比](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

Function Calling vs MCP · 调用关系本质对比

差别在哪？差别在 **工具的归属** 。

Function Calling 里，工具是"应用的一部分"。你写一个客服 Agent，里面有查订单的工具，那个工具的描述就写在你客服 Agent 的代码里。你写一个数据分析 Agent，里面有查数据库的工具，描述也写在分析 Agent 的代码里。 **每个应用都要自己定义、自己实现一遍** 。

MCP 里，工具是"独立的服务"。你写一个 Filesystem MCP Server、写一个 GitHub MCP Server、写一个 Postgres MCP Server，这些 Server 跟具体应用解耦，独立部署。任何支持 MCP 协议的客户端——Claude Desktop、Claude Code、Cursor、Cline，都可以连上这个 Server，把它声明的工具直接用起来。

**Function Calling 解决的是"这次调用让模型知道有什么工具"；MCP 解决的是"工具如何独立存在、如何被多个客户端复用"。** 这是设计哲学层面的差异，不是 API 形式的差异。

## 二、USB-C 类比：协议存在的意义

Anthropic 在 MCP 官方文档里反复用一个比喻： **MCP 之于 AI 应用，就像 USB-C 之于消费电子。**

这个比喻一开始听起来像是营销话术，但你真的把它想透，就会理解为什么 MCP 必须以"协议"的形态出现，而不能简单做成"更好的 Function Calling"。

想象一下，如果没有 USB-C 标准会发生什么。每个手机厂商自己定义充电接口、每个充电宝厂商自己实现一套协议、每个数据线厂商自己造一种插头。结果就是消费者要为每个设备配一根专用线，厂商要为每种新设备开发新的连接器。

工具调用早期就是这个状态。OpenAI 有自己的 Function Calling，Anthropic 有自己的 tool\_use，国内的厂商各有各的实现。一个工具想被多个模型调用，得对每家 API 适配一遍。如果一个应用想接入多个工具，每个工具的对接方式还不一样。这个矩阵被官方文档称为 **N×M 问题，** N 个模型客户端 × M 个工具，每对组合都要写一次集成代码。

MCP 做的事情，是把 N×M 变成 **M+N** 。

模型客户端只需要实现一次 MCP 协议（变成 N），工具服务方也只需要实现一次 MCP 协议（变成 M），N+M 远小于 N×M。任何客户端连任意服务端，只要两边都遵守 MCP，就能直接用。

这就是为什么 Anthropic 必须把它做成"协议"，不能做成"更好的 Function Calling"。Function Calling 是 OpenAI 的、tool\_use 是 Anthropic 的，只要工具调用还是 API 私有规范，就一定有 N×M 的兼容性问题。 **只有协议这种形态，才能跨厂商、跨客户端、跨工具地复用工具实现。**

这一层想清楚，你才能回答面试官那个杀招——"那 MCP 解决了什么 Function Calling 解决不了的事情？"

答案不是"MCP 接的工具更多"，也不是"MCP 更标准化"。答案是： **MCP 让一份工具实现可以被任意 MCP 客户端复用，这是 Function Calling 形态上做不到的。** 你用 Function Calling 写一个工具，它只能在你这个应用里用；你用 MCP 写一个 Server，它能被全世界所有 MCP 客户端用。

## 三、MCP 的三层架构和三种传输

接着把架构拆细。

MCP 体系标准的是经典的客户端-服务器结构，但比一般的 C/S 多了一层"宿主"概念。

| 角色 | 位置 | 职责 | 典型实例 |
| --- | --- | --- | --- |
| Host（主机） | 嵌入 LLM 的应用环境 | 提供模型交互平台，整合外部工具 | Claude Desktop、Claude Code、Cursor、Cline、VS Code Agent Mode |
| Client（客户端） | 驻留在 Host 内部 | 构建标准化 MCP 请求，与 Server 通信 | Host 内置的协议适配层 |
| Server（服务器） | 独立部署 | 封装数据源或工具，处理 Client 请求 | Filesystem、GitHub、Postgres、Slack、Notion 等社区 Server |

![MCP 三层架构与多客户端复用](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

MCP 三层架构与多客户端复用

这三层关系有一个关键设计： **一个 Host 内的 Client 可以同时连多个 Server** 。你的 Claude Code 可以同时挂着 Filesystem MCP Server（读本地文件）+ GitHub MCP Server（查 PR）+ 一个内部 MCP Server（连公司数据库），模型在推理时根据需要挑选不同 Server 的工具调用。

传输层面，MCP 支持三种通信方式，对应不同部署场景：

**stdio（标准输入/输出）：** 本地子进程通信。Host 把 MCP Server 当成一个子进程拉起来，通过 STDIN/STDOUT 管道交换 JSON-RPC 消息。这是最常见的本地 Server 形态，比如官方的 `filesystem` 、 `github` 、 `postgres` 这些 Server，绝大多数都是 stdio 模式。

**SSE（Server-Sent Events）：** 远程通信，HTTP + 服务端推送。Server 独立部署在某个 URL 上，Client 通过 SSE 长连接接收推送、通过 POST 发请求。适合公司内网的共享 MCP Server，比如把内部 Wiki 包成一个 SSE MCP Server，公司里所有装了 Claude Code 的同事都能连上同一个 Server。

**HTTP（Streamable HTTP）：** 协议 2025 年新增的简化远程传输方式，比 SSE 更适合通用 HTTP 中间件场景，适合在公网部署的 MCP Server。

JSON-RPC 2.0 是底座，意味着 Client 和 Server 之间是双向的、可以保持状态的、有标准请求/响应/通知三类消息的。这个底座决定了 MCP 不是"模型调一下 API 完事"，而是一个 **有会话、有能力协商、有错误处理** 的完整协议层。

这套从 stdio 传输到能力协商再到自定义 Server 的完整工程实现，是我们训练营 DeepResearch Agent 项目里专门拉出来的一章。学员不只是调用社区现成的 MCP Server，而是真的自己造一个 MCP Server——从协议握手到 JSON-RPC 消息格式再到子进程通信，每一步都踩过坑，调试过 Server 静默退出、参数 schema 校验失败、能力协商版本不匹配这种生产环境真会遇到的问题。做过一遍，面试时被追问"MCP 的传输模式有几种、各自适用什么场景"，能立刻举出自己项目里的取舍。

## 四、什么时候 Function Calling 够了，什么时候必须上 MCP

回到面试官那个杀招问题，什么场景必须上 MCP？

我的判断标准很简单： **看工具的归属和复用度。**

| 维度 | Function Calling 足够 | 必须上 MCP |
| --- | --- | --- |
| 工具消费方 | 只有自己一个应用 | 多个 AI 客户端共用 |
| 工具实现位置 | 跟应用绑定 | 独立部署、可复用 |
| 维护方 | 应用团队自己 | 平台/工具方独立维护 |
| 生态意图 | 闭环、内部使用 | 开放、生态共享 |
| 典型场景 | 一个客服 Agent 自带订单查询 | 公司内部数据库 Server 给三个 IDE 共用 |

![Function Calling vs MCP · 选型决策](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

Function Calling vs MCP · 选型决策

具体讲两个反例和两个正例，这样面试时举例最有说服力。

**反例一：内部 Agent 硬上 MCP。** 你只有一个 Agent 在用一组工具，所有调用都跑在你自己的进程里。这种场景下硬把工具拆成 MCP Server，多出 stdio/SSE 通信开销、多一份独立部署的运维负担、还要处理 Server 启动失败的兜底。整体反而比 Function Calling 直接在 API 里声明慢。

**反例二：临时性的工具。** 比如一次性帮某个用户调用某个临时接口，工具只用这一次。包成 MCP Server 是杀鸡用牛刀。

**正例一：公司内部知识库要给多个 AI 工具共用。** 比如你们公司有一个内部文档系统，开发同事用 Claude Code 时想查文档、产品同事用 Cursor 时也想查、数据同事用 Cline 时还想查。如果走 Function Calling，三个 IDE 要各自写一遍工具定义。包成一个 MCP Server 之后， **三个 IDE 都接同一个 Server，文档检索逻辑只需要写一份** 。后续要换 embedding 模型、要加权限校验、要支持新格式，改一处三处都生效。

**正例二：跨团队的工具复用。** 平台团队做了一个 GitHub MCP Server、Postgres MCP Server、Notion MCP Server，整个公司所有 AI 应用都能复用。如果走 Function Calling，每个 AI 应用都要自己实现一遍这些工具的接入，平台团队没法统一推升级。

把这个判断说清楚，面试官就知道你不是把 MCP 当成"更高级的 Function Calling"在用，而是真的理解了 **协议层和应用层的分工** 。

## 五、为什么面试官越来越在意这一点

回到开头那个学员的故事。他答得不算差，每个点单独拿出来都对。但面试官还是冷笑。

原因是面试官在 2026 年问 MCP，已经不是在考"你知不知道有这个东西"，而是在考"你对 Agent 工程化的全局判断 **有没有体系** "。

MCP 的出现对应的是一个时代节点—— **AI 工具从"应用内私有调用"走向"协议化生态"** 的转折点。这个转折点很像 2000 年前后的 Web 服务——从每家公司自己定义 RPC 协议，走向 SOAP、走向 REST。理解这个转折的人，会把 MCP 放在"协议层"思考；不理解的人，会把它当成"另一个 API"。面试官三句话就能听出来你是哪一类。

更现实的一点是，Claude Code、Cursor、Cline、Continue.dev、Zed 这些 AI 编程工具，已经全部把 MCP 接入了。 **这意味着团队工具链层面的标准化已经发生了。** 公司给你招 Agent 工程师，不是只让你写一个内部 Agent，是要让你判断：哪些工具应该做成 MCP Server 让全公司复用、哪些工具留在应用内部用 Function Calling 就够、新建一个工具时该走哪条路。这是工程判断力，不是 API 熟练度。

## 六、面试官再问，怎么答

如果时间倒流，回到鹅厂面试现场，正确的答法分三步走，加起来不超过两分钟。

**先讲两者的本质差异（30 秒）。** Function Calling 是模型和单个应用之间的点对点工具约定，工具定义跟应用绑定。MCP 是模型客户端和服务端之间的标准化协议，工具独立部署成 Server，可以被任意支持 MCP 的客户端复用。差别不在 API 形式，在工具的归属——Function Calling 里工具属于应用，MCP 里工具属于自己。

**再讲 MCP 解决的核心问题（45 秒）。** MCP 把 N×M 的工具集成问题变成 M+N。任何客户端实现一次 MCP，就能用任意 MCP Server；任何工具方实现一次 MCP Server，就能被任意客户端调用。这件事 Function Calling 做不到——因为 Function Calling 本身是每家厂商的私有 API，没法跨厂商复用。可以举 Claude Desktop / Claude Code / Cursor / Cline 共用一个 Filesystem MCP Server 的例子。

**最后讲选型判断（30 秒）。** 单一应用、单一团队、不对外，Function Calling 就够。多客户端共用、跨团队复用、要让工具有独立生命周期，上 MCP。反例是内部 Agent 硬上 MCP，多了通信和运维开销，反而拖慢开发。

这三段答完，面试官就知道你不是在背概念，是真的在用 MCP 做过决策。

## 七、把 MCP 当成协议来用，不是当成 API

最后留一个判断标准。

**如果你给同事讲 MCP，第一句话是"MCP 就是 Anthropic 版本的 Function Calling"，那你大概率没把它的设计哲学想透。** 你只接入了 MCP Server，没理解 MCP 为什么必须是协议。

**如果你的第一句话是"MCP 是工具调用的协议层，目标是让一份工具实现能被多个客户端复用"，那你才是真的明白这件事。**

MCP 在 2026 年只会越来越重要。Manus 这种通用 Agent 已经把 MCP 当成连接一切第三方应用的基础设施；公司内部的工具沉淀也会越来越多走 MCP Server 化路径，—份实现，全员复用。Agent 工程师的核心能力不是会调 MCP Server，是知道 **什么时候要把一个工具做成 MCP Server、什么时候不做** 。这个判断做对了，团队工具链的效率就拉开了。

今天这道题，只是大模型面试中 MCP 协议工程化的一个切面。

真正的面试官不会只问这一问。他们会顺着你的回答追下去，追到你答不上来为止，判断的就是你到底做没做过这个系统。

背答案的人和真正做过的人，说话方式完全不一样。前者说"MCP 就是新版的 Function Calling，做了标准化"；后者说"我们项目里把内部数据库工具包成 MCP Server 之后，Claude Code、Cursor、Cline 三个 IDE 都能复用同一份工具实现，原本三个客户端要各自适配一遍，现在改一次三处都生效，集成工作量减少了一半以上，关键是升级 embedding 模型时不用挨个改三个应用，只改 Server 就行"。

面试官三句话就能听出来你是哪种人。

如果你想成为后者，欢迎了解我们的大模型训练营。

[吴师兄大模型训练营【2026最新版】](https://mp.weixin.qq.com/s?__biz=MzkzMDIwMzg1Mw==&mid=2247490434&idx=1&sn=d7ce6af75b5f08db5342b57b987bc987&scene=21#wechat_redirect)

往期推荐

[字节面试官皱眉："Claude Skills 我也在用，但你 SKILL.md 写了 2000 行，是把它当 prompt 还是当文档？"](https://mp.weixin.qq.com/s?__biz=MzkzMDIwMzg1Mw==&mid=2247490449&idx=1&sn=f1e345f0d5510c69ba8c7af7aca989de&scene=21#wechat_redirect)

[阿里面试官冷笑："现在上下文窗口都 200 万 token 了，你的 RAG 还有存在的必要吗？" 我算了一笔账，他沉默了](https://mp.weixin.qq.com/s?__biz=MzkzMDIwMzg1Mw==&mid=2247490388&idx=1&sn=45180b1b2bff0b2359e76764cd48e4a1&scene=21#wechat_redirect)

[在字节食堂打饭，我问同事："RAG系统准确率怎么评？"，打饭阿姨说："你不会就写个90%+糊弄面试官吧。"，我。。。](https://mp.weixin.qq.com/s?__biz=MzkzMDIwMzg1Mw==&mid=2247490385&idx=1&sn=f99276494a27098f3c4f65931089a9e5&scene=21#wechat_redirect)

[字节面试官打断我："你的 Agent 跑一次就交卷？那 22% 错的用户活该是吗？"](https://mp.weixin.qq.com/s?__biz=MzkzMDIwMzg1Mw==&mid=2247490376&idx=1&sn=5fd397cbd39e393672167683d0a4d4a3&scene=21#wechat_redirect)

大厂真题 · 目录

继续滑动看下一个

吴师兄学大模型

向上滑动看下一个