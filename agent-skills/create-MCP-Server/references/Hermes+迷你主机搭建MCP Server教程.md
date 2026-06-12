# Hermes + 迷你主机搭建 MCP Server 完整教程

## 环境要求

- **操作系统**: Windows 11 Pro
- **硬件**: 迷你主机（推荐4核8G以上）
- **Python**: 3.10+
- **网络**: 需要能访问外网（安装依赖）

## 一、环境准备

### 1.1 安装 Python

1. 访问 https://www.python.org/downloads/
2. 下载 Python 3.10+ 版本
3. 安装时勾选 "Add Python to PATH"
4. 验证安装：
```powershell
python --version
pip --version
```

### 1.2 安装 Node.js（可选，用于测试）

1. 访问 https://nodejs.org/
2. 下载 LTS 版本安装
3. 验证：
```powershell
node --version
npm --version
```

### 1.3 配置虚拟环境

```powershell
# 创建项目目录
mkdir C:\MCP-Server
cd C:\MCP-Server

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
.\venv\Scripts\Activate.ps1
```

## 二、安装 FastMCP

### 2.1 安装依赖

```powershell
pip install fastmcp
```

### 2.2 验证安装

```powershell
python -c "import fastmcp; print(fastmcp.__version__)"
```

## 三、创建文件系统 MCP Server

### 3.1 创建服务端代码

创建文件 `C:\MCP-Server\filesystem_server.py`：

```python
"""
文件系统 MCP Server
提供文件读取、写入、搜索功能
"""
import os
import json
from pathlib import Path
from fastmcp import FastMCP

# 创建 MCP 服务实例
mcp = FastMCP("Filesystem Server")

# 配置允许访问的根目录（安全限制）
ALLOWED_ROOTS = [
    Path.home() / "Documents",
    Path.home() / "Desktop",
    Path("C:/MCP-Server/data"),  # 专用数据目录
]

def is_path_allowed(path: Path) -> bool:
    """检查路径是否在允许范围内"""
    try:
        resolved = path.resolve()
        return any(
            str(resolved).startswith(str(root.resolve())) 
            for root in ALLOWED_ROOTS
        )
    except:
        return False

@mcp.tool()
def read_file(file_path: str) -> str:
    """
    读取文件内容
    
    Args:
        file_path: 文件的完整路径
        
    Returns:
        文件内容的字符串
    """
    path = Path(file_path)
    
    if not is_path_allowed(path):
        return f"错误: 无权访问路径 {file_path}"
    
    if not path.exists():
        return f"错误: 文件不存在 {file_path}"
    
    try:
        # 尝试读取文本文件
        content = path.read_text(encoding='utf-8')
        return content
    except UnicodeDecodeError:
        return f"错误: {file_path} 不是文本文件"
    except Exception as e:
        return f"错误: 读取文件失败 - {str(e)}"

@mcp.tool()
def write_file(file_path: str, content: str) -> str:
    """
    写入文件内容
    
    Args:
        file_path: 文件的完整路径
        content: 要写入的内容
        
    Returns:
        操作结果
    """
    path = Path(file_path)
    
    if not is_path_allowed(path):
        return f"错误: 无权写入路径 {file_path}"
    
    try:
        # 确保目录存在
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # 写入文件
        path.write_text(content, encoding='utf-8')
        return f"成功: 文件已写入 {file_path}"
    except Exception as e:
        return f"错误: 写入文件失败 - {str(e)}"

@mcp.tool()
def search_files(
    directory: str, 
    pattern: str = "*", 
    recursive: bool = True
) -> str:
    """
    搜索文件
    
    Args:
        directory: 搜索的目录路径
        pattern: 文件名模式（支持通配符，如 *.txt）
        recursive: 是否递归搜索子目录
        
    Returns:
        找到的文件列表
    """
    dir_path = Path(directory)
    
    if not is_path_allowed(dir_path):
        return f"错误: 无权访问目录 {directory}"
    
    if not dir_path.exists():
        return f"错误: 目录不存在 {directory}"
    
    try:
        if recursive:
            files = list(dir_path.rglob(pattern))
        else:
            files = list(dir_path.glob(pattern))
        
        if not files:
            return "未找到匹配的文件"
        
        # 格式化输出
        result = f"找到 {len(files)} 个文件:\n"
        for f in files[:50]:  # 限制最多显示50个
            size = f.stat().st_size if f.is_file() else "目录"
            result += f"  {f} ({size})\n"
        
        if len(files) > 50:
            result += f"  ... 还有 {len(files) - 50} 个文件"
        
        return result
    except Exception as e:
        return f"错误: 搜索失败 - {str(e)}"

@mcp.tool()
def list_directory(directory: str) -> str:
    """
    列出目录内容
    
    Args:
        directory: 目录路径
        
    Returns:
        目录中的文件和子目录列表
    """
    dir_path = Path(directory)
    
    if not is_path_allowed(dir_path):
        return f"错误: 无权访问目录 {directory}"
    
    if not dir_path.exists():
        return f"错误: 目录不存在 {directory}"
    
    try:
        items = list(dir_path.iterdir())
        
        if not items:
            return "目录为空"
        
        result = f"目录 {directory} 的内容:\n"
        for item in sorted(items):
            type_str = "[DIR]" if item.is_dir() else "[FILE]"
            size = item.stat().st_size if item.is_file() else ""
            result += f"  {type_str} {item.name} {size}\n"
        
        return result
    except Exception as e:
        return f"错误: 列出目录失败 - {str(e)}"

@mcp.tool()
def get_file_info(file_path: str) -> str:
    """
    获取文件详细信息
    
    Args:
        file_path: 文件路径
        
    Returns:
        文件的详细信息（大小、修改时间等）
    """
    path = Path(file_path)
    
    if not is_path_allowed(path):
        return f"错误: 无权访问路径 {file_path}"
    
    if not path.exists():
        return f"错误: 文件不存在 {file_path}"
    
    try:
        stat = path.stat()
        info = {
            "name": path.name,
            "path": str(path.absolute()),
            "type": "directory" if path.is_dir() else "file",
            "size_bytes": stat.st_size,
            "size_human": format_size(stat.st_size),
            "created": format_time(stat.st_ctime),
            "modified": format_time(stat.st_mtime),
            "accessed": format_time(stat.st_atime),
        }
        
        if path.is_file():
            info["extension"] = path.suffix
        
        return json.dumps(info, ensure_ascii=False, indent=2)
    except Exception as e:
        return f"错误: 获取信息失败 - {str(e)}"

def format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.2f} TB"

def format_time(timestamp: float) -> str:
    """格式化时间戳"""
    from datetime import datetime
    return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')

if __name__ == "__main__":
    print("启动文件系统 MCP Server...")
    print("允许访问的目录:")
    for root in ALLOWED_ROOTS:
        print(f"  - {root}")
    mcp.run()
```

### 3.3 创建测试数据目录

```powershell
mkdir C:\MCP-Server\data
echo "Hello MCP Server" > C:\MCP-Server\data\test.txt
```

## 四、测试 MCP Server

### 4.1 启动服务

```powershell
cd C:\MCP-Server
python filesystem_server.py
```

正常输出：
```
启动文件系统 MCP Server...
允许访问的目录:
  - C:\Users\YourName\Documents
  - C:\Users\YourName\Desktop
  - C:\MCP-Server\data
```

### 4.2 使用 FastMCP CLI 测试

另开一个 PowerShell 窗口：

```powershell
cd C:\MCP-Server
.\venv\Scripts\Activate.ps1

# 测试读取文件
fastmcp call read_file --arg file_path="C:\MCP-Server\data\test.txt"

# 测试搜索文件
fastmcp call search_files --arg directory="C:\MCP-Server\data" --arg pattern="*.txt"

# 测试列出目录
fastmcp call list_directory --arg directory="C:\MCP-Server\data"
```

### 4.3 使用 Python 客户端测试

创建 `C:\MCP-Server\test_client.py`：

```python
import asyncio
from fastmcp import Client

async def test():
    # 连接到本地 MCP Server
    async with Client("filesystem_server.py") as client:
        # 测试读取文件
        result = await client.call_tool(
            "read_file", 
            {"file_path": "C:\\MCP-Server\\data\\test.txt"}
        )
        print("读取文件:", result)
        
        # 测试写入文件
        result = await client.call_tool(
            "write_file",
            {
                "file_path": "C:\\MCP-Server\\data\\output.txt",
                "content": "这是通过 MCP 写入的内容"
            }
        )
        print("写入文件:", result)
        
        # 测试搜索
        result = await client.call_tool(
            "search_files",
            {
                "directory": "C:\\MCP-Server\\data",
                "pattern": "*.txt"
            }
        )
        print("搜索结果:" , result)

asyncio.run(test())
```

运行测试：
```powershell
python test_client.py
```

## 五、配置 Hermes Agent 连接

### 5.1 创建 MCP 配置文件

创建 `C:\MCP-Server\mcp_config.json`：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "python",
      "args": ["C:\\MCP-Server\\filesystem_server.py"],
      "env": {}
    }
  }
}
```

### 5.2 在 Hermes 中配置

编辑 Hermes 配置文件（通常在 `~/.hermes/config.yaml`）：

```yaml
mcp:
  servers:
    filesystem:
      command: python
      args:
        - C:\MCP-Server\filesystem_server.py
```

### 5.3 重启 Hermes Agent

配置完成后重启 Hermes，即可使用文件系统工具。

## 六、高级功能扩展

### 6.1 添加文件监控

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class FileChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        print(f"文件修改: {event.src_path}")
    
    def on_created(self, event):
        print(f"文件创建: {event.src_path}")

@mcp.tool()
def watch_directory(directory: str) -> str:
    """监控目录变化"""
    import threading
    
    handler = FileChangeHandler()
    observer = Observer()
    observer.schedule(handler, directory, recursive=True)
    observer.start()
    
    # 在后台线程运行
    def run_observer():
        try:
            while True:
                time.sleep(1)
        except:
            observer.stop()
    
    thread = threading.Thread(target=run_observer, daemon=True)
    thread.start()
    
    return f"开始监控目录: {directory}"
```

### 6.2 添加文件加密

```python
from cryptography.fernet import Fernet

@mcp.tool()
def encrypt_file(file_path: str, key: str) -> str:
    """加密文件"""
    # 实现加密逻辑
    pass

@mcp.tool()
def decrypt_file(file_path: str, key: str) -> str:
    """解密文件"""
    # 实现解密逻辑
    pass
```

## 七、安全建议

1. **限制访问路径**: 只允许访问特定目录
2. **文件大小限制**: 防止读取超大文件
3. **操作日志**: 记录所有文件操作
4. **权限控制**: 区分读写权限

```python
# 安全配置示例
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.txt', '.md', '.json', '.csv', '.log'}
```

## 八、常见问题

### Q1: PowerShell 执行策略错误
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: 端口被占用
修改 `mcp.run()` 指定端口：
```python
mcp.run(port=8765)
```

### Q3: 中文路径乱码
确保文件使用 UTF-8 编码保存。

## 九、完整项目结构

```
C:\MCP-Server\
├── venv/                    # Python 虚拟环境
├── filesystem_server.py     # MCP 服务端主文件
├── test_client.py          # 测试客户端
├── mcp_config.json         # MCP 配置
├── requirements.txt        # 依赖列表
└── data/                   # 测试数据目录
    ├── test.txt
    └── output.txt
```

## 十、总结

通过本教程，你已经成功搭建了一个功能完整的文件系统 MCP Server，可以：

1. ✅ 安全地读取文件
2. ✅ 写入文件
3. ✅ 搜索文件
4. ✅ 获取文件信息
5. ✅ 与 Hermes Agent 集成

下一步可以扩展更多功能，如：
- 数据库操作
- API 调用
- 系统监控
- 自动化脚本

---

> 本教程由代码裁缝整理，如有问题随时交流！
