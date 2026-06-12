# Reasonix MCP Server

文件系统操作 + Obsidian 笔记检索，基于 HTTP/SSE（MCP 协议）。

---

## 快速开始

### 1. 启动服务

```powershell
cd /d F:\Documents\Repertory\Own\mcp-server
python server.py
```

或直接双击 `start-mcp-server.bat`。

启动后你会看到：

```
============================================================
  Reasonix MCP Server
  ===================
  Obsidian Vault: F:\Documents\Default-Obsidian
  Allowed roots: C:\Users\Administrator\Documents, ...
  Max file size: 10.00 MB
============================================================

  Transport: HTTP (streamable-http, stateless)
  Listen:    0.0.0.0:8000
  Endpoint:  http://0.0.0.0:8000/mcp
```

### 2. 测试（保持服务运行，另开一个终端）

```powershell
cd /d F:\Documents\Repertory\Own\mcp-server
python test_client.py
```

这会列出全部 12 个可用工具。

测试某个具体工具：

```powershell
python test_client.py read_file file_path="F:/Documents/Repertory/Own/mcp-server/data/test.txt"
python test_client.py get_server_info
python test_client.py obsidian_list_notes
```

---

## 服务启动了，然后呢？

这个服务器是一个 **MCP 端点**，等待 AI Agent 来连接。它**没有网页界面**。你需要通过 MCP 客户端来使用它：

### 方式 A：Reasonix / OpenCode（通过 .mcp.json）

Reasonix 和 OpenCode 都兼容 `.mcp.json` 格式，启动时会自动扫描工作目录下的该文件，加载其中注册的 MCP Server。

把 `.mcp.json` 放到你的工作目录（例如 `F:\Documents\Default-Obsidian\`）：

```json
{
  "mcpServers": {
    "reasonix-mcp": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp"
    }
  }
}
```

之后在 Reasonix 或 OpenCode 会话中，直接对 AI 说：

> "调用 MCP 上的 `get_server_info` 工具"

AI 就会通过 `.mcp.json` 中注册的端点去调用这个 MCP Server。

你也可以在 Reasonix 中直接输入斜杠命令查看 MCP 连接状态（如果支持 `/mcp` 命令的话）。

> **注意**：使用前必须保持 server.py 在后台运行。关掉终端 = 断开连接。

### 方式 B：Hermes Agent

在 Hermes 配置中添加一个 HTTP MCP Server 源，指向 `http://127.0.0.1:8000/mcp`。

### 方式 C：curl / Python 直连（无需 AI 客户端）

向 `http://127.0.0.1:8000/mcp` 发送 JSON-RPC POST 请求即可验证。

列出工具：

```bash
curl -X POST http://127.0.0.1:8000/mcp ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json, text/event-stream" ^
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"
```

调用工具：

```bash
curl -X POST http://127.0.0.1:8000/mcp ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json, text/event-stream" ^
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"get_server_info\",\"arguments\":{}}}"
```

Python 直连：

```python
import json, http.client
conn = http.client.HTTPConnection("127.0.0.1", 8000, timeout=5)
payload = json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/list"}).encode()
conn.request("POST", "/mcp", body=payload,
    headers={"Content-Type":"application/json","Accept":"application/json, text/event-stream"})
resp = conn.getresponse()
print(resp.read().decode("utf-8"))
conn.close()
```

---

## 工具一览

### 文件系统（6 个工具）

| 工具 | 功能 |
|------|------|
| `read_file` | 读取文本文件内容（限白名单目录） |
| `write_file` | 创建/覆盖写入文件 |
| `append_file` | 追加内容到文件末尾 |
| `search_files` | 按文件名模式搜索（`*.txt`、`*.md` 等） |
| `list_directory` | 列出目录内容 |
| `get_file_info` | 获取文件大小、时间、类型等信息 |

### Obsidian 笔记（5 个工具）

| 工具 | 功能 |
|------|------|
| `obsidian_list_notes` | 列出 vault 中的笔记（可按子目录筛选） |
| `obsidian_search_by_tag` | 按 `#标签` 搜索笔记 |
| `obsidian_search_by_keyword` | 全文搜索所有笔记 |
| `obsidian_read_note` | 读取笔记完整内容 |
| `obsidian_get_structure` | 显示 vault 目录树结构 |

### 系统（1 个工具）

| 工具 | 功能 |
|------|------|
| `get_server_info` | 服务器版本、路径、工具列表等 |

---

## 远程访问

局域网内其他机器可通过 `http://<你的IP>:8000/mcp` 连接。

**防火墙**：确保 Windows Defender 防火墙放行了 8000 端口。

**查看本机 IP**：

```powershell
ipconfig
```

找到当前网卡的 IPv4 地址。

---

## 项目文件

```
F:\Documents\Repertory\Own\mcp-server\
├── server.py            # MCP 服务端（运行这个）
├── test_client.py       # 命令行测试客户端
├── .mcp.json            # Claude Code 配置文件
├── start-mcp-server.bat # 一键启动脚本
├── README.md            # 本文件
└── data/
    └── test.txt         # 测试文件
```

---

## 常见问题

**"Address already in use" / 端口 8000 被占用**
→ 服务已经在运行了，或者其他程序占用了 8000 端口。关掉旧终端，或者在 server.py 中改端口号。

**"Python is not recognized"**
→ Python 未加入 PATH。安装 Python 3.10+（python.org），或用完整路径：`F:\anaconda3\python.exe server.py`

**bat 文件打开后乱码**
→ 当前版本已全英文，不应再乱码。如果仍有问题，右键 → 编辑查看文件内容是否正常。

**远程机器连不上**
→ Windows 防火墙可能拦截了 8000 端口。添加入站规则放行 TCP 8000 端口，或先在本机用 `http://localhost:8000/mcp` 验证服务是否正常运行。
