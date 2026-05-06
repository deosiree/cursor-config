---
name: microfb网关退化示例
description: 当 microfb 中旧版本接口已经下线，仍残留失效的网关版本兼容层、兼容壳方法、旧 API、旧测试或临时兜底文件，需要按固定顺序退化和清理时使用。
---

# microfb Gateway Degradation Example

## RED
- 先确认旧接口是否真的下线。
- 先检索 `gateway-executor`、`gateway-version-policy`、`loginV2`、旧 API 文件、旧测试。
- 先确认临时兜底文件是否仍有引用。

## GREEN
1. 删除 `gateway-version-policy.ts` 与 `gateway-executor.ts`
2. 让 `auth/role/device` gateway 直接调用现行 API
3. 业务层统一从 `loginV2` 改调 `login`
4. 删除无引用旧 `auth.api.ts`、`role.api.ts`
5. 删除 `src/temp/temp-v1-menu.ts`
6. 删除或改写旧 fallback 测试

## REFACTOR
- 清理旧注释中的“兼容”“fallback”“临时兜底”
- 修正 `.gitignore`，确保新增测试可提交
- 跑残留检索、测试、类型检查

继续参考：
- `[[../../template/before]]`
- `[[../../template/after]]`
