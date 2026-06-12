"""
Reasonix MCP Server
====================
Provides: Filesystem operations + Obsidian note retrieval
Transport: HTTP/SSE (streamable-http)
"""

import os
import re
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastmcp import FastMCP

# ============================================================
# Configuration
# ============================================================

ALLOWED_ROOTS = [
    Path.home() / "Documents",
    Path.home() / "Desktop",
    Path("F:/Documents/Repertory/Own/mcp-server/data"),
]

OBSIDIAN_VAULT = Path("F:/Documents/Default-Obsidian")

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_SEARCH_RESULTS = 100

# ============================================================
# MCP Server Instance
# ============================================================

mcp = FastMCP(
    "Reasonix MCP Server",
    version="1.0.0",
)

# ============================================================
# Helper Functions
# ============================================================

def is_path_allowed(path: Path) -> bool:
    """Check if path falls within allowed directories (security sandbox)."""
    try:
        resolved = path.resolve()
        return any(
            str(resolved).startswith(str(root.resolve()))
            for root in ALLOWED_ROOTS
        )
    except Exception:
        return False

def is_in_obsidian_vault(path: Path) -> bool:
    """Check if path is inside the Obsidian vault."""
    try:
        resolved = path.resolve()
        vault = OBSIDIAN_VAULT.resolve()
        return str(resolved).startswith(str(vault))
    except Exception:
        return False

def format_size(size_bytes: int) -> str:
    """Format bytes into human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.2f} TB"

def format_time(timestamp: float) -> str:
    """Format unix timestamp to readable datetime."""
    return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')

def extract_tags(content: str) -> list[str]:
    """Extract Obsidian tags (#tag) from markdown content."""
    tags = re.findall(r'#([\w\u4e00-\u9fff/-]+)', content)
    return [t for t in tags if not re.match(r'^\d+$', t)]

def extract_title(filepath: Path) -> str:
    """Extract first H1 heading or fall back to filename as note title."""
    try:
        content = filepath.read_text(encoding='utf-8', errors='ignore')
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('# ') and not line.startswith('##'):
                return line.lstrip('# ').strip()
    except Exception:
        pass
    return filepath.stem

def safe_read_markdown(path: Path) -> Optional[str]:
    """Safely read markdown file content with size check."""
    try:
        if path.stat().st_size > MAX_FILE_SIZE:
            return None
        return path.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return None


# ============================================================
# Filesystem Tools
# ============================================================

@mcp.tool()
def read_file(file_path: str) -> str:
    """
    Read file content as text.

    Args:
        file_path: Full path to the file

    Returns:
        File content as string
    """
    path = Path(file_path)
    if not is_path_allowed(path):
        return f"Error: Access denied to {file_path}\nAllowed roots: {', '.join(str(r) for r in ALLOWED_ROOTS)}"
    if not path.exists():
        return f"Error: File not found {file_path}"
    if path.is_dir():
        return f"Error: {file_path} is a directory. Use list_directory instead."
    if path.stat().st_size > MAX_FILE_SIZE:
        return f"Error: File too large ({format_size(path.stat().st_size)}), limit is {format_size(MAX_FILE_SIZE)}"
    try:
        content = path.read_text(encoding='utf-8')
        return content
    except UnicodeDecodeError:
        return f"Error: {file_path} is not a text file (non-UTF-8 encoding)"
    except Exception as e:
        return f"Error: Failed to read file - {str(e)}"


@mcp.tool()
def write_file(file_path: str, content: str) -> str:
    """
    Write content to a file (overwrites if exists).

    Args:
        file_path: Full path to the file
        content: Text content to write

    Returns:
        Result message
    """
    path = Path(file_path)
    if not is_path_allowed(path):
        return f"Error: Access denied to {file_path}"
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
        return f"Success: File written to {file_path} ({format_size(path.stat().st_size)})"
    except Exception as e:
        return f"Error: Failed to write file - {str(e)}"


@mcp.tool()
def append_file(file_path: str, content: str) -> str:
    """
    Append content to the end of a file.

    Args:
        file_path: Full path to the file
        content: Text content to append

    Returns:
        Result message
    """
    path = Path(file_path)
    if not is_path_allowed(path):
        return f"Error: Access denied to {file_path}"
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'a', encoding='utf-8') as f:
            f.write(content)
        return f"Success: Content appended to {file_path}"
    except Exception as e:
        return f"Error: Failed to append file - {str(e)}"


@mcp.tool()
def search_files(directory: str, pattern: str = "*", recursive: bool = True) -> str:
    """
    Search for files matching a pattern.

    Args:
        directory: Directory to search in
        pattern: File name pattern (supports wildcards, e.g. *.txt, *.md)
        recursive: Whether to search subdirectories recursively (default true)

    Returns:
        List of matching files
    """
    dir_path = Path(directory)
    if not is_path_allowed(dir_path):
        return f"Error: Access denied to directory {directory}"
    if not dir_path.exists():
        return f"Error: Directory not found {directory}"
    try:
        files = list(dir_path.rglob(pattern) if recursive else dir_path.glob(pattern))
        if not files:
            return "No matching files found"
        files.sort(key=lambda f: (not f.is_dir(), f.name))
        result = f"Found {len(files)} files:\n"
        for f in files[:MAX_SEARCH_RESULTS]:
            size_str = "DIR" if f.is_dir() else format_size(f.stat().st_size)
            result += f"  [{size_str}] {f}\n"
        if len(files) > MAX_SEARCH_RESULTS:
            result += f"  ... {len(files) - MAX_SEARCH_RESULTS} more files not shown"
        return result
    except Exception as e:
        return f"Error: Search failed - {str(e)}"


@mcp.tool()
def list_directory(directory: str) -> str:
    """
    List contents of a directory.

    Args:
        directory: Path to the directory

    Returns:
        Directory listing with files and subdirectories
    """
    dir_path = Path(directory)
    if not is_path_allowed(dir_path):
        return f"Error: Access denied to directory {directory}"
    if not dir_path.exists():
        return f"Error: Directory not found {directory}"
    try:
        items = sorted(dir_path.iterdir(), key=lambda f: (not f.is_dir(), f.name.lower()))
        if not items:
            return "Directory is empty"
        result = f"Contents of {directory}:\n"
        for item in items:
            type_str = "[DIR]" if item.is_dir() else "[FILE]"
            if item.is_file():
                result += f"  {type_str} {item.name}  {format_size(item.stat().st_size)}\n"
            else:
                result += f"  {type_str} {item.name}/\n"
        return result
    except Exception as e:
        return f"Error: Failed to list directory - {str(e)}"


@mcp.tool()
def get_file_info(file_path: str) -> str:
    """
    Get detailed file information.

    Args:
        file_path: Path to the file

    Returns:
        File details (size, timestamps, etc.)
    """
    path = Path(file_path)
    if not is_path_allowed(path):
        return f"Error: Access denied to {file_path}"
    if not path.exists():
        return f"Error: File not found {file_path}"
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
        return f"Error: Failed to get file info - {str(e)}"


# ============================================================
# Obsidian Note Retrieval Tools
# ============================================================

@mcp.tool()
def obsidian_list_notes(directory: str = "") -> str:
    """
    List markdown notes in the Obsidian Vault.

    Args:
        directory: Subdirectory within the vault (empty=root)

    Returns:
        List of markdown files with title, path, and modification time
    """
    base = OBSIDIAN_VAULT.resolve()
    search_dir = base / directory if directory else base
    if not search_dir.exists():
        return f"Error: Directory not found (in vault: {directory})"
    if not is_in_obsidian_vault(search_dir):
        return f"Error: Directory is outside Obsidian Vault"
    try:
        md_files = list(search_dir.rglob("*.md"))
        md_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        if not md_files:
            return "No markdown notes found"
        result = f"[Notes] Obsidian notes listing ({len(md_files)} total):\n\n"
        for f in md_files[:50]:
            mtime = format_time(f.stat().st_mtime)
            rel_path = f.relative_to(base)
            title = extract_title(f)
            result += f"  - {title}\n    Path: {rel_path}\n    Modified: {mtime}\n\n"
        if len(md_files) > 50:
            result += f"  ... {len(md_files) - 50} more notes not shown"
        return result
    except Exception as e:
        return f"Error: Failed to list notes - {str(e)}"


@mcp.tool()
def obsidian_search_by_tag(tag: str) -> str:
    """
    Search Obsidian notes by tag.

    Args:
        tag: Tag to search for (without # prefix, e.g. 'AI', 'MCP')

    Returns:
        Notes containing the specified tag
    """
    base = OBSIDIAN_VAULT.resolve()
    if not base.exists():
        return f"Error: Obsidian Vault path not found ({base})"
    try:
        md_files = list(base.rglob("*.md"))
        results = []
        for f in md_files:
            content = safe_read_markdown(f)
            if content is None:
                continue
            tags = extract_tags(content)
            matching_tags = [t for t in tags if tag.lower() in t.lower()]
            if matching_tags:
                rel_path = f.relative_to(base)
                title = extract_title(f)
                results.append((title, rel_path, matching_tags))
        if not results:
            return f'No notes found with tag "#{tag}"'
        result = f'[Tag] Search results for "#{tag}" ({len(results)} notes):\n\n'
        for title, rel_path, tags in results[:30]:
            result += f"  - {title}\n    Path: {rel_path}\n    Tags: {' '.join(f'#{t}' for t in tags)}\n\n"
        if len(results) > 30:
            result += f"  ... {len(results) - 30} more notes not shown"
        return result
    except Exception as e:
        return f"Error: Tag search failed - {str(e)}"


@mcp.tool()
def obsidian_search_by_keyword(keyword: str, max_results: int = 20) -> str:
    """
    Full-text search in Obsidian notes.

    Args:
        keyword: Keyword to search for
        max_results: Maximum number of results to return (default 20)

    Returns:
        Matching notes with context snippets
    """
    base = OBSIDIAN_VAULT.resolve()
    if not base.exists():
        return f"Error: Obsidian Vault path not found ({base})"
    try:
        md_files = list(base.rglob("*.md"))
        results = []
        for f in md_files:
            content = safe_read_markdown(f)
            if content is None:
                continue
            if keyword.lower() in content.lower():
                rel_path = f.relative_to(base)
                title = extract_title(f)
                snippets = []
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if keyword.lower() in line.lower():
                        start = max(0, i - 1)
                        end = min(len(lines), i + 2)
                        snippet_lines = lines[start:end]
                        snippet = '\n'.join(snippet_lines).strip()
                        if len(snippet) > 200:
                            snippet = snippet[:200] + '...'
                        snippets.append(snippet)
                results.append((title, rel_path, snippets))
        if not results:
            return f'No notes found containing "{keyword}"'
        results.sort(key=lambda r: len(r[2]), reverse=True)
        results = results[:max_results]
        total_matches = sum(len(r[2]) for r in results)
        result = f'[Search] Full-text results for "{keyword}" ({len(results)} notes, {total_matches} matches):\n\n'
        for title, rel_path, snippets in results:
            result += f"  - {title}\n    Path: {rel_path}  ({len(snippets)} matches)\n"
            for s in snippets[:3]:
                result += f"    Snippet: ...{s[:150]}...\n"
            result += "\n"
        return result
    except Exception as e:
        return f"Error: Keyword search failed - {str(e)}"


@mcp.tool()
def obsidian_read_note(note_path: str) -> str:
    """
    Read a complete Obsidian note.

    Args:
        note_path: Relative path within the vault (e.g. 'language/AIAgent/MCP/overview.md')

    Returns:
        Full markdown content of the note
    """
    base = OBSIDIAN_VAULT.resolve()
    full_path = base / note_path
    if not is_in_obsidian_vault(full_path):
        return f"Error: Path is outside Obsidian Vault"
    if not full_path.exists():
        return f"Error: Note not found (vault path: {note_path})"
    if full_path.suffix != '.md':
        return f"Error: Not a markdown file"
    try:
        content = full_path.read_text(encoding='utf-8')
        title = extract_title(full_path)
        stats = full_path.stat()
        header = f"[Note] {title}\n"
        header += f"   Path: {note_path}\n"
        header += f"   Size: {format_size(stats.st_size)}\n"
        header += f"   Modified: {format_time(stats.st_mtime)}\n"
        header += f"{'='*60}\n\n"
        return header + content
    except Exception as e:
        return f"Error: Failed to read note - {str(e)}"


@mcp.tool()
def obsidian_get_structure(directory: str = "") -> str:
    """
    Get the directory tree structure of the Obsidian Vault.

    Args:
        directory: Subdirectory within the vault (empty=entire vault)

    Returns:
        Tree-like directory structure
    """
    base = OBSIDIAN_VAULT.resolve()
    search_dir = base / directory if directory else base
    if not search_dir.exists():
        return f"Error: Directory not found"
    try:
        lines = []
        if directory:
            lines.append(f"[DIR] {directory}/")
        def walk_dir(dir_path: Path, indent: str):
            items = sorted(dir_path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
            for i, item in enumerate(items):
                is_last = (i == len(items) - 1)
                conn = "+-- " if is_last else "|-- "
                name = item.name
                if name.startswith('.'):
                    continue
                if item.is_dir():
                    lines.append(f"{indent}{conn}[DIR] {name}/")
                    ext = "    " if is_last else "|   "
                    walk_dir(item, indent + ext)
                elif item.suffix == '.md':
                    lines.append(f"{indent}{conn}[MD] {name}")
        walk_dir(search_dir, "")
        return "\n".join(lines) if lines else "Directory is empty"
    except Exception as e:
        return f"Error: Failed to get directory structure - {str(e)}"


# ============================================================
# System Tools
# ============================================================

@mcp.tool()
def get_server_info() -> str:
    """
    Get MCP Server information and status.

    Returns:
        Server information
    """
    info = {
        "server": "Reasonix MCP Server",
        "version": "1.0.0",
        "transport": "HTTP (streamable-http)",
        "python_version": sys.version,
        "vault_path": str(OBSIDIAN_VAULT),
        "allowed_roots": [str(r) for r in ALLOWED_ROOTS],
        "max_file_size": format_size(MAX_FILE_SIZE),
        "available_tools": [
            "read_file", "write_file", "append_file",
            "search_files", "list_directory", "get_file_info",
            "obsidian_list_notes", "obsidian_search_by_tag",
            "obsidian_search_by_keyword", "obsidian_read_note",
            "obsidian_get_structure",
            "get_server_info",
        ]
    }
    return json.dumps(info, ensure_ascii=False, indent=2)


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    # Set console to UTF-8 on Windows
    if sys.platform == "win32":
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

    print("=" * 60)
    print("  Reasonix MCP Server")
    print("  ===================")
    print(f"  Obsidian Vault: {OBSIDIAN_VAULT}")
    print(f"  Allowed roots: {', '.join(str(r) for r in ALLOWED_ROOTS)}")
    print(f"  Max file size: {format_size(MAX_FILE_SIZE)}")
    print("=" * 60)
    print()
    print("  Transport: HTTP (streamable-http, stateless)")
    print("  Listen:    0.0.0.0:8000")
    print("  Endpoint:  http://0.0.0.0:8000/mcp")
    print()
    print("  Tools (12):")
    print("    [FS] read_file, write_file, append_file,")
    print("         search_files, list_directory, get_file_info")
    print("    [OBS] obsidian_list_notes, obsidian_search_by_tag,")
    print("          obsidian_search_by_keyword, obsidian_read_note,")
    print("          obsidian_get_structure")
    print("    [SYS] get_server_info")
    print()
    print("  Run: python server.py")
    print("=" * 60)

    mcp.run(transport="http", host="0.0.0.0", port=8000, stateless=True)
