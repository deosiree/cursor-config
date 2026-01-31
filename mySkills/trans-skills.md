# 技能：文档翻译 (Document Translation)

## 目标

将指定的 Markdown 文档或目录翻译为中文：

- **单个文件**：生成对应的 `文件名-cn.md` 版本
- **目录路径**：生成到 `原路径-cn` 目录，目录内文件名保持不变（因为目录名已加 `-cn` 后缀）

## 流程指令

1. **理解需求**：
   - 识别用户指定的路径（可以是文件路径或目录路径，相对路径或绝对路径）
   - **单个文件**：
     - 如果用户只提供文件名（如 "SKILL.md"），默认查找 `SKILL.md`
     - 如果提供完整文件路径，直接使用该路径
   - **目录路径**：
     - 如果用户提供目录路径（以 `/` 结尾或明确是目录），翻译整个目录
     - 目标目录为：`原路径-cn`（例如：`.cursor/superpowers-main/` → `.cursor/superpowers-main-cn/`）
     - 目录内所有 `.md` 文件翻译后保持原文件名（因为目录名已加 `-cn` 后缀）

2. **路径检查**：
   - **单个文件**：
     - 验证源文件是否存在
     - 确定目标文件路径（源文件名 + `-cn.md`）
     - 如果目标文件已存在，先删除它
   - **目录路径**：
     - 验证源目录是否存在
     - 确定目标目录路径（原路径 + `-cn`）
     - 如果目标目录已存在，删除整个目录后重新创建
     - 遍历源目录，查找所有 `.md` 文件（包括子目录）

3. **读取源文件**：
   - **单个文件**：完整读取源 Markdown 文件内容
   - **目录路径**：递归遍历目录，读取所有 `.md` 文件内容
   - 注意保留文件结构（front matter、代码块、表格等）

4. **翻译处理**：
   - 将英文内容翻译为中文
   - **保留格式**：
     - 保持所有 Markdown 语法（标题、列表、代码块、链接等）
     - 保留 front matter（YAML 前置元数据）
     - 保留代码块和命令示例
     - 保留表格结构
   - **翻译内容**：
     - 翻译正文、标题、描述
     - 代码注释和字符串内容根据上下文决定是否翻译
     - 技术术语保持准确性

5. **生成目标文件**：
   - **单个文件**：
     - 创建新的 `文件名-cn.md` 文件
     - 写入翻译后的完整内容
   - **目录路径**：
     - 创建目标目录（`原路径-cn`）
     - 保持原有的目录结构（包括子目录）
     - 为每个 `.md` 文件创建翻译版本，保存到对应位置，**文件名保持不变**
     - 例如：`.cursor/superpowers-main/skills/xxx/SKILL.md` → `.cursor/superpowers-main-cn/skills/xxx/SKILL.md`
   - 确保所有文件格式正确

## 使用示例

### 示例 1：翻译当前目录的 SKILL.md

```text
用户："翻译 SKILL.md"
→ 查找：SKILL.md
→ 生成：SKILL-cn.md
```

### 示例 2：翻译指定路径的文件

```text
用户："翻译 .cursor/superpowers-main/skills/receiving-code-review/SKILL.md"
→ 读取：.cursor/superpowers-main/skills/receiving-code-review/SKILL.md
→ 生成：.cursor/superpowers-main/skills/receiving-code-review/SKILL-cn.md
```

### 示例 3：翻译整个目录

```text
用户："翻译 .cursor/superpowers-main/"
→ 读取目录：.cursor/superpowers-main/
→ 生成目录：.cursor/superpowers-main-cn/
→ 目录内文件保持原名，例如：
   .cursor/superpowers-main/skills/xxx/SKILL.md
   → .cursor/superpowers-main-cn/skills/xxx/SKILL.md
```

## 输出要求

- **翻译质量**：准确、流畅，符合中文表达习惯
- **格式保持**：完全保留原文件的 Markdown 结构和格式
- **技术术语**：准确翻译，保持技术准确性
- **文件操作**：
  - 单个文件：如果目标文件存在，先删除再创建新文件
  - 目录路径：如果目标目录存在，删除整个目录后重新创建
- **完成确认**：翻译完成后，简要说明翻译的路径和生成的目标路径

## 注意事项

- 如果源文件或目录不存在，明确告知用户并询问正确的路径
- 如果文件受保护无法删除，直接覆盖写入
- 翻译时注意上下文，确保技术文档的准确性
- 保持代码示例和命令不变（除非是注释需要翻译）
- **目录翻译规则**：
  - 目录名加 `-cn` 后缀，文件名保持不变
  - 保持完整的目录结构（包括所有子目录）
  - 只翻译 `.md` 文件，其他文件类型不处理
  - 递归处理所有子目录中的 `.md` 文件
