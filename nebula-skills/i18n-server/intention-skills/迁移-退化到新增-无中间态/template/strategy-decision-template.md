# Strategy Decision Template

## Decision

- Recommendation:
- Mode:
  - `deprecate-then-add-new`

## Why

1.
2.
3.

## Preconditions

- 

## Risks

- 

## Suggested Execution Order

1. `分析-i18n链路`
2. `迁移-退化->新增(无中间态)`
3. `旧i18n-硬切静态化`
4. validate current branch
5. handoff to `策略-新增新i18n`
6. `路由-选择功能子skill` or a direct feature-skill sequence

## Notes For Review

- 哪些点证明必须先退化旧链路：
- 哪些点证明不适合保留中间态：
