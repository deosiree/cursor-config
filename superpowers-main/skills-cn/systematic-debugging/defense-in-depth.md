# 深度防御验证

## 概述

当你修复由无效数据引起的错误时，在一个地方添加验证感觉足够了。但该单一检查可能被不同的代码路径、重构或模拟绕过。

**核心原则：** 在数据通过的每一层进行验证。使错误在结构上不可能。

## 为什么需要多层

单一验证："我们修复了错误"
多层："我们使错误不可能"

不同层捕获不同情况：
- 入口验证捕获大多数错误
- 业务逻辑捕获边缘情况
- 环境保护防止特定上下文的危险
- 调试日志记录在其他层失败时帮助

## 四层

### 第 1 层：入口点验证
**目的：** 在 API 边界拒绝明显无效的输入

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory 不能为空');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory 不存在：${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory 不是目录：${workingDirectory}`);
  }
  // ... 继续
}
```

### 第 2 层：业务逻辑验证
**目的：** 确保数据对此操作有意义

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('工作空间初始化需要 projectDir');
  }
  // ... 继续
}
```

### 第 3 层：环境保护
**目的：** 防止在特定上下文中进行危险操作

```typescript
async function gitInit(directory: string) {
  // 在测试中，拒绝在临时目录外进行 git init
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `测试期间拒绝在临时目录外进行 git init：${directory}`
      );
    }
  }
  // ... 继续
}
```

### 第 4 层：调试工具
**目的：** 捕获用于取证的上下文

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('即将 git init', {
    directory,
    cwd: process.cwd(),
    stack,
  });
  // ... 继续
}
```

## 应用模式

当你发现错误时：

1. **跟踪数据流** - 错误值起源于哪里？在哪里使用？
2. **映射所有检查点** - 列出数据通过的每个点
3. **在每一层添加验证** - 入口、业务、环境、调试
4. **测试每一层** - 尝试绕过第 1 层，验证第 2 层捕获它

## 会话示例

错误：空 `projectDir` 导致源代码中的 `git init`

**数据流：**
1. 测试设置 → 空字符串
2. `Project.create(name, '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` 在 `process.cwd()` 中运行

**添加了四层：**
- 第 1 层：`Project.create()` 验证不为空/存在/可写
- 第 2 层：`WorkspaceManager` 验证 projectDir 不为空
- 第 3 层：`WorktreeManager` 在测试中拒绝在 tmpdir 外进行 git init
- 第 4 层：git init 之前的堆栈跟踪日志记录

**结果：** 所有 1847 个测试通过，错误不可能重现

## 关键洞察

所有四层都是必要的。在测试期间，每一层都捕获了其他层遗漏的错误：
- 不同的代码路径绕过了入口验证
- 模拟绕过了业务逻辑检查
- 不同平台上的边缘情况需要环境保护
- 调试日志记录识别了结构误用

**不要在一个验证点停止。** 在每一层添加检查。
