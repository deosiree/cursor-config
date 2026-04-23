# Strategy Decision Template

## Decision

- Recommendation:
- Mode:
  - `deprecate-then-migrate`
  - `migrate-directly`

## Why

1. 
2. 
3. 

## Preconditions

- 

## Risks

- 

## Suggested Execution Order

### If `deprecate-then-migrate`

1. `feature-analysis`
2. `feature-strategy`
3. `feature-deprecation`
4. validate current branch
5. commit
6. `feature-migration`

### If `migrate-directly`

1. `feature-analysis`
2. `feature-strategy`
3. `feature-direct-migration`

## Notes For Review

- 哪些点证明“一步到位”是安全的：
- 哪些点证明“两步走”更合理：
