---
name: test-driven-development
description: 在实现任何功能或错误修复时使用，在编写实现代码之前
---

# 测试驱动开发 (TDD)

## 概述

先写测试。看它失败。写最少的代码让它通过。

**核心原则：** 如果你没有看到测试失败，你不知道它是否测试了正确的内容。

**违反规则的文字就是违反规则的精神。**

## 何时使用

**总是：**
- 新功能
- 错误修复
- 重构
- 行为更改

**例外（询问你的合作伙伴）：**
- 一次性原型
- 生成的代码
- 配置文件

认为"这次跳过 TDD"？停止。这是合理化。

## 铁律

```
没有失败测试之前，不写生产代码
```

在测试之前写代码？删除它。重新开始。

**无例外：**
- 不要将其保留为"参考"
- 不要"在编写测试时适应"它
- 不要看它
- 删除意味着删除

从测试中全新实现。就这样。

## 红-绿-重构

```dot
digraph tdd_cycle {
    rankdir=LR;
    red [label="RED\n编写失败测试", shape=box, style=filled, fillcolor="#ffcccc"];
    verify_red [label="验证失败\n正确", shape=diamond];
    green [label="GREEN\n最少代码", shape=box, style=filled, fillcolor="#ccffcc"];
    verify_green [label="验证通过\n全部绿色", shape=diamond];
    refactor [label="REFACTOR\n清理", shape=box, style=filled, fillcolor="#ccccff"];
    next [label="下一个", shape=ellipse];

    red -> verify_red;
    verify_red -> green [label="yes"];
    verify_red -> red [label="wrong\nfailure"];
    green -> verify_green;
    verify_green -> refactor [label="yes"];
    verify_green -> green [label="no"];
    refactor -> verify_green [label="stay\ngreen"];
    verify_green -> next;
    next -> red;
}
```

### RED - 编写失败测试

编写一个最小测试，显示应该发生什么。

<Good>
```typescript
test('重试失败操作 3 次', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```
清晰的名称，测试真实行为，一件事
</Good>

<Bad>
```typescript
test('重试有效', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```
模糊的名称，测试模拟而不是代码
</Bad>

**要求：**
- 一个行为
- 清晰的名称
- 真实代码（除非不可避免，否则不使用模拟）

### 验证 RED - 看它失败

**强制。永远不要跳过。**

```bash
npm test path/to/test.test.ts
```

确认：
- 测试失败（不是错误）
- 失败消息符合预期
- 因为缺少功能而失败（不是拼写错误）

**测试通过？** 你正在测试现有行为。修复测试。

**测试错误？** 修复错误，重新运行直到它正确失败。

### GREEN - 最少代码

编写最简单的代码让测试通过。

<Good>
```typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
```
刚好足够通过
</Good>

<Bad>
```typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number) => void;
  }
): Promise<T> {
  // YAGNI
}
```
过度工程化
</Bad>

不要添加功能、重构其他代码，或"改进"超出测试的内容。

### 验证 GREEN - 看它通过

**强制。**

```bash
npm test path/to/test.test.ts
```

确认：
- 测试通过
- 其他测试仍然通过
- 输出干净（无错误、警告）

**测试失败？** 修复代码，不是测试。

**其他测试失败？** 现在修复。

### REFACTOR - 清理

仅在绿色之后：
- 移除重复
- 改进名称
- 提取辅助函数

保持测试绿色。不要添加行为。

### 重复

下一个功能的下一失败测试。

## 好的测试

| 质量 | 好 | 坏 |
|---------|------|-----|
| **最小** | 一件事。"和"在名称中？拆分它。 | `test('验证电子邮件和域名和空白')` |
| **清晰** | 名称描述行为 | `test('test1')` |
| **显示意图** | 演示期望的 API | 模糊代码应该做什么 |

## 为什么顺序重要

**"我会在之后写测试来验证它有效"**

在代码之后写的测试立即通过。立即通过证明不了什么：
- 可能测试了错误的内容
- 可能测试了实现，而不是行为
- 可能遗漏了你忘记的边缘情况
- 你从未看到它捕获错误

测试优先迫使你看到测试失败，证明它实际测试了某些内容。

**"我已经手动测试了所有边缘情况"**

手动测试是临时的。你认为你测试了所有内容，但：
- 没有记录你测试的内容
- 代码更改时无法重新运行
- 在压力下容易忘记情况
- "我尝试时有效" ≠ 全面

自动化测试是系统的。它们每次都以相同方式运行。

**"删除 X 小时的工作是浪费"**

沉没成本谬误。时间已经过去了。你现在的选择：
- 删除并用 TDD 重写（X 更多小时，高信心）
- 保留它并在之后添加测试（30 分钟，低信心，可能有错误）

"浪费"是保留你无法信任的代码。没有真实测试的工作代码是技术债务。

**"TDD 是教条的，务实意味着适应"**

TDD 是务实的：
- 在提交之前发现错误（比之后调试更快）
- 防止回归（测试立即捕获中断）
- 记录行为（测试显示如何使用代码）
- 启用重构（自由更改，测试捕获中断）

"务实"的捷径 = 在生产中调试 = 更慢。

**"之后的测试达到相同目标 - 这是精神不是仪式"**

不。之后的测试回答"这做什么？" 优先测试回答"这应该做什么？"

之后的测试受你的实现影响。你测试你构建的内容，而不是需要的内容。你验证记住的边缘情况，而不是发现的。

优先测试迫使在实现之前发现边缘情况。之后的测试验证你记住了所有内容（你没有）。

30 分钟的之后测试 ≠ TDD。你获得了覆盖，失去了证明测试有效的证据。

## 常见合理化

| 借口 | 现实 |
|--------|---------|
| "太简单无法测试" | 简单代码会中断。测试需要 30 秒。 |
| "我会在之后测试" | 立即通过的测试证明不了什么。 |
| "之后的测试达到相同目标" | 之后测试 = "这做什么？" 优先测试 = "这应该做什么？" |
| "已经手动测试" | 临时 ≠ 系统。无记录，无法重新运行。 |
| "删除 X 小时是浪费" | 沉没成本谬误。保留未验证的代码是技术债务。 |
| "保留作为参考，优先写测试" | 你会适应它。那是之后测试。删除意味着删除。 |
| "需要先探索" | 好的。扔掉探索，用 TDD 开始。 |
| "测试困难 = 设计不清楚" | 倾听测试。难以测试 = 难以使用。 |
| "TDD 会减慢我" | TDD 比调试更快。务实 = 测试优先。 |
| "手动测试更快" | 手动不证明边缘情况。你会重新测试每个更改。 |
| "现有代码没有测试" | 你正在改进它。为现有代码添加测试。 |

## 危险信号 - 停止并重新开始

- 测试之前的代码
- 实现之后的测试
- 测试立即通过
- 无法解释为什么测试失败
- "稍后"添加的测试
- 合理化"就这一次"
- "我已经手动测试了它"
- "之后的测试达到相同目的"
- "这是精神不是仪式"
- "保留作为参考"或"适应现有代码"
- "已经花费 X 小时，删除是浪费"
- "TDD 是教条的，我是务实的"
- "这不同因为..."

**所有这些意味着：删除代码。用 TDD 重新开始。**

## 示例：错误修复

**错误：** 接受空电子邮件

**RED**
```typescript
test('拒绝空电子邮件', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('需要电子邮件');
});
```

**验证 RED**
```bash
$ npm test
FAIL: 期望 '需要电子邮件'，得到 undefined
```

**GREEN**
```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: '需要电子邮件' };
  }
  // ...
}
```

**验证 GREEN**
```bash
$ npm test
PASS
```

**REFACTOR**
如果需要，为多个字段提取验证。

## 验证清单

在标记工作完成之前：

- [ ] 每个新函数/方法都有测试
- [ ] 在实现之前看到每个测试失败
- [ ] 每个测试因预期原因失败（缺少功能，不是拼写错误）
- [ ] 编写最少代码让每个测试通过
- [ ] 所有测试通过
- [ ] 输出干净（无错误、警告）
- [ ] 测试使用真实代码（仅在不可避免时使用模拟）
- [ ] 覆盖边缘情况和错误

无法检查所有框？你跳过了 TDD。重新开始。

## 卡住时

| 问题 | 解决方案 |
|---------|---------|
| 不知道如何测试 | 编写期望的 API。先写断言。询问你的合作伙伴。 |
| 测试太复杂 | 设计太复杂。简化接口。 |
| 必须模拟所有内容 | 代码耦合太紧。使用依赖注入。 |
| 测试设置巨大 | 提取辅助函数。仍然复杂？简化设计。 |

## 调试集成

发现错误？编写重现它的失败测试。遵循 TDD 循环。测试证明修复并防止回归。

永远不要在没有测试的情况下修复错误。

## 测试反模式

在添加模拟或测试工具时，阅读 @testing-anti-patterns.md 以避免常见陷阱：
- 测试模拟行为而不是真实行为
- 向生产类添加仅测试方法
- 在不理解依赖项的情况下模拟

## 最终规则

```
生产代码 → 测试存在且首先失败
否则 → 不是 TDD
```

没有你合作伙伴的许可，无例外。
