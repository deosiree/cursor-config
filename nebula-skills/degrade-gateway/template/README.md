# template 目录说明

`template/` 是给人类看的更新型示例层，不是给 agent 的执行素材层。

本 skill 直接使用本次 `microfb` 真实会话中的未提交改动来组织对照：
- `[[before]]`：退化前的典型形态
- `[[after]]`：退化后的目标形态

## before 应展示什么
- `gateway-version-policy.ts`
- `gateway-executor.ts`
- `executeWithVersionFallback`
- `loginV2 -> login` 兼容壳
- 旧 `auth.api.ts` / `role.api.ts`
- `temp-v1-menu.ts`
- 旧 fallback 测试痕迹

## after 应展示什么
- gateway 直接调用现行 API
- 业务层统一收口到 `login`
- 旧 API 删除
- 临时兜底删除
- 测试收敛到真实行为验证

## 不适合放什么
- frontmatter 通用占位
- few-shot 精简素材
- 长篇设计理由

这些应分别放到：
- `[[../assets/frontmatter-template.yaml]]`
- `[[../assets/few-shot-example]]`
- `[[../references/gateway-degradation-core.md]]`
