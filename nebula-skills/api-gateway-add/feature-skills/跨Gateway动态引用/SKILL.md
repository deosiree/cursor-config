---
name: 跨Gateway动态引用
description: 跨模块通则：gateway 文件禁止顶层静态 import 其它 *Gateway，改方法体内 await import() 破除加载期环依赖。任意跨域 gateway 互引均适用。
---

# 跨 Gateway 动态引用

## 何时使用

- 多个 gateway 文件需要互相调用（租户/设备/项目等任意域）
- 构建或运行出现 circular dependency
- 计划在 gateway 顶层 `import XxxGateway`

## 权威细则

`[[../../references/gateway-dynamic-import.md]]`（通则二全文）

## 执行要点

1. 删除 gateway 顶层 `import *Gateway`。
2. 在**用到**的方法体内：`const { default: XxxGateway } = await import("@/gateway/...")`。
3. 同文件内 `ThisGateway.otherMethod` 无需 dynamic import。
4. `src/api/**` 不受限。

## 人类检查点

列出拟改文件与 dynamic import 落点后，**等用户确认**再改。

## 印证样本

`[[../../template/tenant-delete-orchestration/before]]` → `after`（`f734a7b` 三文件 diff，仅作通则二示例之一）。
