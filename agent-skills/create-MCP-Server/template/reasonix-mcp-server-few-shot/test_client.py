"""
Reasonix MCP Client - Test Client
"""
import json
import http.client
import sys
from typing import Any

MCP_HOST = "127.0.0.1"
MCP_PORT = 8000

def mcp_call(method: str, params: dict[str, Any] | None = None) -> dict:
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
    }
    if params:
        payload["params"] = params

    conn = http.client.HTTPConnection(MCP_HOST, MCP_PORT, timeout=10)
    conn.request(
        "POST", "/mcp",
        body=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        }
    )
    resp = conn.getresponse()
    body = resp.read(50000).decode("utf-8", errors="replace")
    conn.close()

    result = {}
    for line in body.split("\n"):
        line = line.strip()
        if line.startswith("data: "):
            try:
                result = json.loads(line[6:])
            except json.JSONDecodeError:
                pass
    return result

def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("--help", "-h"):
        print("Usage:")
        print("  python test_client.py                      # List all tools")
        print("  python test_client.py <tool_name> [args]   # Call a tool")
        print()
        print("Examples:")
        print('  python test_client.py get_server_info')
        print('  python test_client.py read_file file_path="F:/Documents/Repertory/Own/mcp-server/data/test.txt"')
        print('  python test_client.py obsidian_list_notes')
        return

    if len(sys.argv) == 1:
        result = mcp_call("tools/list")
        tools = result.get("result", {}).get("tools", [])
        print(f"Reasonix MCP Server - Available tools ({len(tools)}):")
        print("=" * 60)
        for t in tools:
            name = t.get("name", "?")
            desc = t.get("description", "")
            params = t.get("inputSchema", {}).get("properties", {})
            param_names = list(params.keys())
            print(f"  {name}")
            print(f"    Description: {desc}")
            if param_names:
                print(f"    Args: {', '.join(param_names)}")
            print()
    else:
        tool_name = sys.argv[1]
        params = {}
        for arg in sys.argv[2:]:
            if "=" in arg:
                k, v = arg.split("=", 1)
                params[k] = v

        result = mcp_call(f"tools/call", {"name": tool_name, "arguments": params})
        content = result.get("result", {}).get("content", [])
        for c in content:
            print(c.get("text", str(c)))

if __name__ == "__main__":
    main()
