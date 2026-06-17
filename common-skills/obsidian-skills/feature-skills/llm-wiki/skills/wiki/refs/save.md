---
name: save
description: 대화/답변/통찰을 6영역에 적절히 라우팅하여 저장 + 위키링크 검증 + qmd update/embed 강제.
parent_skill: wiki
absorbed_from: ~/.claude/skills/wiki-save/ (alias /wiki-save 영구 보존)
---

# wiki save — 6영역 라우팅 + 위키링크 검증

> 좋은 답변/통찰은 chat history에 묻히지 않는다. 영구 wiki 페이지로 file. wiki는 복리.

---

## 0. Wikilink Safety (CRITICAL — MANDATORY for ALL writes)

`[[링크]]` 작성 전 **반드시** 대상 페이지 존재 확인:

```bash
find ${VAULT_ROOT} -iname "페이지명*.md" | head -3
# 또는
obsidian-cli search-content "페이지명"
```

- 존재 → `[[파일명]]` (확장자 제외)
- 존재 X → **plain text** + `(파일명)` 표기 (스킬 파일은 `(스킬)` 표기)
- 절대 broken link 생성 금지
- 스킬 파일(`~/.claude/skills/`)은 위키 페이지 아니므로 절대 wikilink X

---

## 1. 6영역 라우팅 (CLAUDE.md 정책 준수)

볼트 경로: `${VAULT_ROOT}/`

### 30_Claude/ (협업 기록)
| 영역 | 용도 | 파일명 형식 |
|---|---|---|
| `01_Sessions/` | 세션 핸드오프 | `session-{YYYY-MM-DD}-{slug}.md` |
| `02_Learnings/` | learn-rule 교훈 | `{YYYY-MM-DD}-{slug}.md` |
| `03_Retros/` | 주간 회고 | `retro-{YYYY-MM-DD}.md` |
| `04_Plans/` | 플랜 (prometheus/writing-plans) | `plan-{YYYY-MM-DD}-{slug}.md` |
| `05_Research/` | 리서치 결과 | `research-{YYYY-MM-DD}-{slug}.md` |
| `06_Designs/` | 설계 결정 (brainstorming) | `design-{YYYY-MM-DD}-{slug}.md` |

### 20_Wiki/ (컴파일된 지식)
| 영역 | 용도 | 파일명 형식 |
|---|---|---|
| `01_Sources/` | 원본 요약 (ingest 산출) | `{slug}.md` |
| `02_Entities/` | 사람/조직/제품/repo | `{Entity Name}.md` (Title Case) |
| `03_Concepts/` | 아이디어/패턴/프레임워크 | `{Concept Name}.md` |
| `04_Methods/` | 방법론/절차 | `{Method Name}.md` |
| `05_Comparisons/` | 비교 분석 | `{topic}-comparison.md` |
| `06_Meta/` | index/log/hot/dashboard | (관리 파일) |

### 10_Raw/ (수동 ingest만 — save 대상 아님)
저장 X. ingest 동사로만 진입.

### Note Type 결정 표
| Type | Folder | Use when |
|---|---|---|
| `synthesis` | `20_Wiki/05_Comparisons/` 또는 `_Questions/` | 다단계 분석/비교/특정 Q 답변 |
| `concept` | `20_Wiki/03_Concepts/` | 아이디어/패턴/프레임워크 정의 |
| `source` | `20_Wiki/01_Sources/` | 외부 자료 요약 |
| `decision` | `30_Claude/06_Designs/` | 설계 결정 |
| `session` | `30_Claude/01_Sessions/` | 세션 전체 요약 |
| `learning` | `30_Claude/02_Learnings/` | 교훈/룰 |

사용자가 type 명시하면 그것 사용. 모호하면 `synthesis` 기본.

---

## 2. Save Workflow

1. **Scan** 현재 대화에서 보존 가치 있는 콘텐츠 식별
2. **Ask** (이름 미정 시): "뭐라고 부를까요?" — 짧고 descriptive
3. **Type 결정** (위 표)
4. **Extract** 관련 콘텐츠 — declarative present tense로 재작성 ("the user asked..." X / 실제 내용 자체)
5. **Create** 정확한 폴더에 full frontmatter
6. **Collect links**: 대화에서 mentioned wiki 페이지를 frontmatter `related`에 (위키링크 §0 검증 후)
7. **Update** `30_Claude/00_Meta/index.md` 또는 `20_Wiki/06_Meta/index.md` 적절한 섹션 TOP에 entry 추가
8. **Append** 해당 영역 `log.md` TOP:
   ```
   ## [YYYY-MM-DD] save | Note Title
   - Type: [note type]
   - Location: 30_Claude/06_Designs/Note Title.md
   - From: conversation on [topic]
   ```
9. **Update** `20_Wiki/06_Meta/hot.md` 신규 추가 반영
10. **qmd update && qmd embed** (manage 자동 호출)
11. **Confirm**: "Saved as [[Note Title]] in [folder]/."

---

## 3. Frontmatter Template (필수)

**공통 (모든 영역)**:
```yaml
---
title: "Note Title"
date: YYYY-MM-DD
tags:
  - <분류>/<서브분류>   # 예: 개발/세션, 프로젝트/위키시스템
  - 프로젝트/{name}
status: developing  # developing | stable | archived
---
```

**type별 추가 필드**:

`synthesis` / `question`:
```yaml
type: synthesis
question: "원본 query"
answer_quality: solid | draft
related:
  - "[[Page referenced]]"
sources:
  - "[[20_Wiki/01_Sources/relevant.md]]"
```

`decision`:
```yaml
type: decision
decision_date: YYYY-MM-DD
status: active | superseded
```

`session`:
```yaml
type: session
session_date: YYYY-MM-DD
related_plans: ["[[plan-...]]"]
```

`source`:
```yaml
type: source
author: "..."
published: YYYY-MM-DD
url: "https://..."
confidence: 0.7  # 0.0~1.0
last_reinforced: YYYY-MM-DD
```

---

## 4. 세션 노트 표준 섹션 (30_Claude/01_Sessions/)

```markdown
# Session Handoff — {YYYY-MM-DD}

## Status
- **Branch**: ...
- **Commits**: N
- **Uncommitted**: ...

## What's Done
- ...

## Key Decisions Made
- ...

## What's Pending
- ...

## Resume Command

> ```
> {다음 세션 첫 메시지로 복사할 한 줄}
> ```

## Related
- [[관련 design]]
- [[관련 plan]]
- [[직전 session]]
```

---

## 5. Writing Style

- **Declarative present tense** ("X works by doing Y" / "X does Y")
- NOT: "The user asked about X and Claude explained..."
- YES: "X는 Y로 작동. 핵심 통찰은 Z."
- 모든 관련 컨텍스트 포함 — 미래 세션이 cold read 가능해야 함
- 모든 mentioned concept/entity wikilink (위키링크 §0 검증 후)
- 인용 필요한 곳: `(Source: [[Page]])`

---

## 6. 무엇을 Save / Skip

**Save**:
- Non-obvious 통찰/synthesis
- rationale 있는 결정
- 노력 든 분석
- 재참조 가능성 있는 비교
- 리서치 발견

**Skip**:
- Mechanical Q&A (단순 lookup)
- 이미 다른 곳 documented된 setup
- lasting insight 없는 임시 디버깅
- 이미 wiki에 있음 (이 경우 기존 페이지 update — 중복 페이지 X)

---

## 7. 자동 저장 트리거 (Claude 자발 호출)

CLAUDE.md "자동 저장 트리거" 표 준수:

| 트리거 | 저장 경로 | MANDATORY 여부 |
|---|---|---|
| session-handoff 실행 | `01_Sessions/` | MANDATORY |
| learn-rule 실행 | `02_Learnings/` | MANDATORY |
| retro 실행 | `03_Retros/` | MANDATORY |
| prometheus/writing-plans 플랜 생성 | `04_Plans/` | MANDATORY |
| 외부 리서치 3건+ (brave/firecrawl/context7) | `05_Research/` | 자동 |
| brainstorming 설계 결정 도출 | `06_Designs/` | 자동 |
| 중요 디버깅 해결 (2시간+) | `02_Learnings/` | 자동 |

---

## 8. 저장 후 필수 (MANDATORY)

매번 저장 후:
1. `30_Claude/00_Meta/index.md` (또는 `20_Wiki/06_Meta/index.md`) 항목 추가
2. `30_Claude/00_Meta/log.md` (또는 `20_Wiki/06_Meta/log.md`) 상단 이력 추가
3. `qmd update && qmd embed` 실행 (refs/manage.md 자동 호출 OK)

이걸 빼먹으면 `replay-learnings`/`qmd-search`가 다음 세션에서 못 찾음.

---

## Output

- **출력 위치**: 6영역 라우팅 (위 §1 표)
- **frontmatter**: title / date / tags / status 필수 (+ type별 추가)
- **wikilink 검증**: 모든 `[[]]` 존재 확인 (없으면 plain text)
- **저장 후**: index.md + log.md 갱신 + `qmd update && qmd embed` (MANDATORY)

기존 alias `/wiki-save` 동일 동작 — 영구 보존.
