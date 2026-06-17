---
name: lint
description: 위키 구조 검증 (orphan/dead link/stale/frontmatter gap/empty section/folder overflow) + FATAL/MAJOR/MINOR/POLISH 4단계 분류.
parent_skill: wiki
absorbed_from: ~/.claude/skills/wiki-lint/ (alias /wiki-lint 영구 보존)
output_path: 20_Wiki/06_Meta/lint-{date}.md
---

# wiki lint — 구조 검증 + 4단계 분류 (FATAL/MAJOR/MINOR/POLISH)

> 매 10-15회 ingest마다, 또는 주 1회 실행. 자동 fix 전 사용자 확인.
> **wiki lint는 구조 검증만**. 의미 검증(모순/Stale/Gap)은 `wiki critique` (Wave 3에서 작성).

---

## 0. Wikilink Safety

리포트 내 `[[링크]]` 작성 전 대상 페이지 존재 확인 (refs/save.md §0 동일 규칙).

### Broken Ref Detection (obsidian-cli)

Broken wikilink 탐지 시 obsidian-cli를 활용한다:

```bash
# 대상 페이지명으로 내용 검색
obsidian-cli search-content "대상 페이지명"
# 또는 파일 존재 여부 직접 확인
find ${VAULT_ROOT} -iname "파일명.md"
```

발견된 broken ref는 **제거(plain text 변환)** 또는 **페이지 생성(내용 포함)** 중 선택해 리포트에 기록.

---

## 1. 4단계 분류 (feynman 5원칙 #4 흡수)

발견 사항을 **반드시** 4단계로 분류:

| 단계 | 정의 | 예시 |
|---|---|---|
| **FATAL** | 시스템 깨짐 | 깨진 frontmatter, 중복 ID, 인덱스 손상 |
| **MAJOR** | 기능 영향 | dead link, orphan 페이지, 5KB+ 단일 파일, missing required 필드 |
| **MINOR** | 일관성 흠집 | 태그 불일치, partial stale 마커, Gold In 약함 |
| **POLISH** | 가독성 | 헤딩 단계 점프, emoji 일관성, 줄바꿈 |

각 발견에 파일/라인 인용 필수.

---

## 2. Lint Checks (순서대로)

1. **Orphan pages** [MAJOR] — wiki 페이지에 inbound wikilink 없음. 존재하지만 아무도 가리키지 않음.
2. **Dead links** [MAJOR] — 존재하지 않는 페이지를 참조하는 wikilink.
3. **Missing pages** [MINOR] — 여러 페이지에 mentioned되지만 자체 페이지 없는 concept/entity.
4. **Missing cross-references** [MINOR] — 페이지에 mentioned된 entity인데 link 안 됨.
5. **Frontmatter gaps** [MAJOR if required, MINOR if optional] — type/confidence/date/tags/last_reinforced 누락.
6. **Empty sections** [POLISH] — 헤딩만 있고 content 없음.
7. **Stale index entries** [MAJOR] — `index.md`가 renamed/deleted 페이지 가리킴.
8. ~~Folder overflow~~ **(제거 2026-04-21)** — 파일 수 제한 없음. 분화는 사용자 수동. `policy.md §4` 참조.
9. **Low-confidence pages** [MINOR] — `confidence < 0.3`. 검증 또는 소스 보강 필요.
10. **Stale reinforcement** [MINOR] — `last_reinforced` 90일+. 내용 유효성 재검증.
11. **Missing 한 줄 통찰** [MINOR] — frontmatter 직후 `> **한 줄 통찰**:` blockquote 없음.
12. **Gold In 5필드 검증** [MINOR or POLISH] — `wiki/TEMPLATES/gold-in-frontmatter.md` 스펙 기준:
    - 5필드 (수집 이유 / My Take / 한 줄 통찰 / Gold Out / Action Intent) 누락 → MINOR (각 누락 건수 명시)
    - 모호한 단어 사용 ("좋은 글", "참고", "흥미로움", "나중에", "TBD") → MINOR (재작성 권장)
    - 각 필드 < 30자 → POLISH
    - My Take가 본문 요약 반복 (Levenshtein 유사도 > 0.7) → MINOR
    - Gold Out / Action Intent에 측정 가능 산출/구체 target 없음 → POLISH
    - 자동 검증 명령은 TEMPLATES/gold-in-frontmatter.md §6 참조
13. **Naming convention 위반** [POLISH] — 아래 §3 위반.
14. **Writing style 위반** [POLISH] — declarative present tense X, 인용 누락, gap/contradiction 미플래그.

---

## 3. Naming Conventions (검증 항목)

| Element | Convention | Example |
|---|---|---|
| Filenames | Title Case with spaces | `Machine Learning.md` |
| Folders | lowercase with dashes | `wiki/data-models/` |
| Tags | lowercase, hierarchical | `#domain/architecture` |
| Wikilinks | match filename exactly | `[[Machine Learning]]` |

볼트 전체 filename 고유성. wikilink 경로 없이 동작하려면 unique해야 함.

---

## 4. Lint Report Format

저장 위치: `20_Wiki/06_Meta/lint-{YYYY-MM-DD}.md`

(Wave 1에서 30_Claude/06_Designs로 옮겼으나 2026-04-20 사용자 피드백으로 원복 — lint는 위키 구조 검증이라 위키 내부 Meta에 저장하는 게 개념적으로 맞음.)

```markdown
---
title: "Lint Report YYYY-MM-DD"
type: lint
date: YYYY-MM-DD
tags:
  - 개발/리포트
  - 프로젝트/위키시스템
status: developing
---

# Lint Report: YYYY-MM-DD

## Summary
- Pages scanned: N
- FATAL: N | MAJOR: N | MINOR: N | POLISH: N
- Auto-fixable: N | Needs review: N

## FATAL
*(시스템 깨짐 — 즉시 fix 필요)*

- **[FATAL] Broken frontmatter** — `20_Wiki/03_Concepts/X.md`:1-5 — YAML 파싱 실패.
- **[FATAL] Index loss** — `20_Wiki/06_Meta/index.md`:42 — Y 페이지 가리키나 파일 없음.

## MAJOR
*(기능 영향 — 우선 fix)*

- **[MAJOR] Orphan page** — `[[Page Name]]`: inbound link 0건. Suggest: link from `[[Related]]` 또는 delete.
- **[MAJOR] Dead link** — `[[Missing Page]]`: `[[Source Page]]:23`에서 참조하나 파일 없음. Suggest: stub 생성 또는 link 제거.

## MINOR
*(일관성 흠집 — 시간 날 때 fix)*

- **[MINOR] Missing concept page** — "concept name": `[[Page A]]`, `[[Page B]]`, `[[Page C]]` mentioned. Suggest: concept 페이지 생성.
- **[MINOR] Frontmatter gap** — `[[Page]]`: missing fields: status, tags
- **[MINOR] Folder overflow** — `20_Wiki/03_Concepts/` 18 files. Suggest: 하위 카테고리 분리.

## POLISH
*(가독성 — 백그라운드)*

- **[POLISH] Empty section** — `[[Page]]`:45 — `## Examples` 헤딩만 있고 content 없음.
- **[POLISH] Naming** — `[[machine-learning]]` should be `[[Machine Learning]]`.
```

---

## 5. Auto-Fix 정책

**FATAL 발견 시**: 즉시 사용자에게 알리고 confirm 후 fix.

**Safe to auto-fix** (사용자 confirm 후):
- 누락 frontmatter 필드 placeholder 추가
- missing entity stub 페이지 생성
- unlinked mention에 wikilink 추가

**Needs review before fixing** (반드시 사용자 결정):
- orphan 페이지 삭제 (의도적 isolation일 수 있음)
- 모순 해소 (인간 판단 필요)
- 중복 페이지 merge

**항상 lint 리포트 먼저 보여주고** "자동 fix할까요, 하나씩 review할까요?" 확인.

---

## 6. Dataview Dashboard (선택)

`20_Wiki/06_Meta/dashboard.md` 생성/갱신:

````markdown
---
type: meta
title: "Dashboard"
updated: YYYY-MM-DD
---
# Wiki Dashboard

## Recent Activity
```dataview
TABLE type, status, updated FROM "20_Wiki" SORT updated DESC LIMIT 15
```

## Seed Pages (Need Development)
```dataview
LIST FROM "20_Wiki" WHERE status = "seed" SORT updated ASC
```

## Entities Missing Sources
```dataview
LIST FROM "20_Wiki/02_Entities" WHERE !sources OR length(sources) = 0
```

## Open Questions
```dataview
LIST FROM "20_Wiki/05_Questions" WHERE answer_quality = "draft" SORT created DESC
```
````

---

## 7. Canvas Map (선택)

`20_Wiki/06_Meta/overview.canvas`:

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "file",
      "file": "20_Wiki/06_Meta/overview.md",
      "x": 0, "y": 0,
      "width": 300, "height": 140,
      "color": "1"
    }
  ],
  "edges": []
}
```

도메인 페이지당 노드 1개 + significant cross-ref 엣지. 컬러: 1=blue, 2=purple, 3=yellow, 4=orange, 5=green, 6=red.

---

## 8. Custom Callout 의존성

`> [!contradiction]`, `> [!gap]`, `> [!key-insight]`, `> [!stale]` 4개는 `.obsidian/snippets/vault-colors.css`에 정의된 custom callout. snippet 없으면 default 스타일로 fallback (페이지 동작은 정상). `references/css-snippets.md` 참조.

---

## 9. critique와의 경계 (중복 X)

**lint** = 구조 (이 파일):
- 깨진 link, frontmatter, naming, 폴더 overflow, low confidence
- 의미 X — 단지 형식

**critique** = 의미 (Wave 3 작성 예정):
- 모순 (서로 다른 말하는 노트)
- Stale 주장 (오래된 근거)
- Gap (외부엔 있는데 우리 볼트엔 없음)
- Consensus / Disagreement / Open Questions

lint가 critique 영역 침범 금지 — Stale/Gap/Contradiction 의미 검증은 critique로 routing.

---

## Output

- **출력 위치**: `20_Wiki/06_Meta/lint-{YYYY-MM-DD}.md`
- **분류**: FATAL/MAJOR/MINOR/POLISH 모두 명시
- **인용**: 각 발견에 file:line 인용
- **자동 fix**: 사용자 confirm 후 (FATAL 즉시, MAJOR/MINOR/POLISH 모아서)

기존 alias `/wiki-lint` 동일 동작 — 영구 보존.
