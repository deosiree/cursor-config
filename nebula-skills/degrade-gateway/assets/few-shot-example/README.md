# microfb-gateway-degradation-example

## 场景
`microfb` 中旧版本接口已经下线，但仓库还残留：
- `gateway-version-policy.ts`
- `gateway-executor.ts`
- `executeWithVersionFallback`
- `loginV2` 兼容壳
- 无引用旧 `auth.api.ts` / `role.api.ts`
- 临时兜底 `src/temp/temp-v1-menu.ts`

## 目标
把网关层收口为单一现行实现，并把旧入口、旧测试、旧临时文件一并清掉。

## 关键动作
1. 删除版本策略层与执行器。
2. 把 `auth/role/device` gateway 直接改为消费现行 API。
3. 将业务层从 `loginV2` 收口到 `login`。
4. 删除无引用旧 API 文件与临时兜底文件。
5. 删除或改写旧 fallback 测试，只保留直接调用现行 API 的断言。

## 配合主 skill 阅读
- `[[../../SKILL.md]]`
- `[[../../template/before]]`
- `[[../../template/after]]`
- `[[../../references/gateway-degradation-core.md]]`

## 验收
- `rg '\bloginV2\b' src` 无命中
- `rg "gateway-executor|gateway-version-policy|executeWithVersionFallback" src` 无命中
- gateway 定向测试通过
- `pnpm run type-check` 通过
