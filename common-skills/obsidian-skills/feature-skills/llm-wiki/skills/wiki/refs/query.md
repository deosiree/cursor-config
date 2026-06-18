---
name: query
description: 4-Tier 검색 체인 (20_Wiki → 30_Claude → 10_Raw → 외부) + score 분기 + Quick/Standard/Deep 모드. wiki-query + qmd-search 통합.
parent_skill: wiki
absorbed_from:
  - ~/.claude/skills/wiki-query/  (alias /wiki-query 영구 보존)
  - ~/.claude/skills/qmd-search/  (alias /qmd-search 영구 보존)
---

# wiki query — 4-Tier 검색 체인 + 토큰 절감

> 위키는 이미 합성 작업을 끝낸 product. 전략적으로 read, 정확히 answer, 좋은 답은 wiki에 file back → 지식 복리.

---

## 0. Wikilink Safety

답변을 위키에 저장할 때 `[[링크]]` 작성 전 대상 페이지 존재 확인:
```bash
find ${VAULT_ROOT} -iname "페이지명*.md" | head -3
# 또는
obsidian-cli search-content "페이지명"
```
존재 X → plain text. broken link 금지.

---

## 1. 4-Tier 검색 체인 (MANDATORY 순서)

CLAUDE.md `Knowledge Hierarchy Protocol`과 일치. **외부(Tier 4)는 Tier 1-3 후에만**.

```
Tier 1 — In-session context (free, 항상 first)
         현재 대화, CLAUDE.md, memory, 이번 세션 읽은 파일

Tier 2 — Vault (cheap, MANDATORY before Tier 3)
  Tier 2a: 20_Wiki (컴파일 지식, 자율 first)
  Tier 2b: 30_Claude (협업 기록, 자율)
  Tier 2c: 10_Raw (원본, **수동만** — 사용자 "원본"/"raw" 명시 시)

Tier 3 — External (expensive, only after Tier 2)
  context7 (SDK 문서) / brave_web_search (일반 웹) / firecrawl (특정 페이지)
```

**Tier 2 → Tier 3 gate**: Tier 2 결과가 빈약(top score < 0.5)할 때만 Tier 3 진행.

---

## 2. QMD 명령 매핑

### 키워드 검색 (BM25, 빠름) — default
```bash
qmd search "<query>" -n 5
```

### 시맨틱 검색 (벡터, 느림) — 키워드 실패 시
```bash
qmd query "<query>" -n 5
```

### 전체 문서 가져오기
```bash
qmd get "qmd://obsidian/<path>"
```

### 볼트 스코프 검색 (default target: 20_Wiki + 30_Claude)
```bash
qmd search "<query>" -c obsidian -n 5
```

### 10_Raw 도서관 접근 (수동만)
- "원본 확인해줘" / "raw 파일 찾아줘" / "출처 원문 보여줘" / `--raw` 플래그
- 자율 판단으로는 10_Raw 진입 금지 (도서관 모델)

기본 검색 결과에 10_Raw 섞이면 grep으로 필터:
```bash
# 기본 (Tier 2a, 2b만)
qmd search "<query>" -c obsidian -n 10 | grep -v "10_Raw"

# 명시 요청 시
qmd search "<query>" -c obsidian -n 10 | grep "10_Raw"
```

---

## 3. Score 분기 (Confidence-Based Action)

`qmd search` 후 top result score 확인:

| Score | Action | Token Budget |
|---|---|---|
| **≥ 0.9** (High) | 전문 Read 후 핵심 인용 | ~500 (요약 first) |
| **0.7 ~ 0.9** (Med-High) | 요약 주입 + "읽어볼까?" 제안 | ~300-500 |
| **0.5 ~ 0.7** (Med) | 제목만 주입 + "관련 있어 보여요" | ~100 |
| **< 0.5** (Low) | silent skip — "특별히 관련 지식 없음" | 0 |
| **0 results** | Tier 3 (외부) 진행 | 0 |

**Score 0.9 이상에서만** 사용자 사전 승인 없이 자동 Read full content.

---

## 4. Query Modes (3 depth)

| Mode | Trigger | Reads | Token cost | Best for |
|---|---|---|---|---|
| **Quick** | `query quick: ...` 또는 단순 사실 Q | hot.md + index.md only | ~1,500 | "What is X?", 날짜, 빠른 사실 |
| **Standard** | default (no flag) | hot.md + index + 3-5 페이지 | ~3,000 | 대부분의 질문 |
| **Deep** | `query deep: ...` 또는 "thorough"/"comprehensive" | full wiki + 선택적 웹 | ~8,000+ | "A vs B 전체 비교", synthesis, gap analysis |

### Quick Mode
1. `20_Wiki/06_Meta/hot.md` 읽기 → 답변 가능하면 즉시 응답
2. 부족하면 `index.md` 스캔 → description으로 답변 가능 시 응답
3. 부족하면 "Not in quick cache. Run as standard?"
4. **개별 wiki 페이지 X**

### Standard Workflow
1. `hot.md` 먼저 (직접 답변 또는 컨텍스트)
2. `index.md`로 관련 페이지 식별 (제목 + description 스캔)
3. 관련 페이지 Read. wikilink depth-2까지만
4. Synthesize + 인용: `(Source: [[Page Name]])`
5. **Offer to file**: "이 분석 보존할까요? `20_Wiki/05_Questions/answer-name.md`?"
6. **Gap 발견 시**: "X에 대한 자료가 부족해요. 소스 찾을까요?"

### Deep Mode
1. `hot.md` + `index.md` 읽기
2. 모든 관련 섹션 식별 (concepts/entities/sources/comparisons)
3. 모든 관련 페이지 Read (skip 금지)
4. 위키 coverage 부족 시 웹 보완 제안
5. Comprehensive 답변 + full citations
6. **Always file back** — deep 답변은 잃기 너무 아까움

---

## 5. 자율 발동 트리거 (Proactive Usage)

Claude가 **self-initiate** query 해야 할 상황:

### Strong (즉시 검색)
- 외부 도구/기술/사람 고유명사 (Hermes, Graphify, Ollama, 카파시 등)
- "이전에"/"예전에"/"기억나는데"/"우리 ~했잖아"
- 새 프로젝트/기능 시작 (관련 자료 확인)
- "우리 ~ 관련 뭐 있어?"
- 새 wiki 페이지 생성 전 (중복 방지)
- `brave_web_search` / `context7` / `firecrawl` 사용 전 (Tier 3 gate)

### Medium (검색 고려)
- 추상 개념 언급 (LLM Wiki, Gold In Gold Out, compound knowledge)
- 설계 결정 진행 중 (과거 결정 확인)
- 리서치 작업 (이미 했는지)
- Task 도구 위임 시 (에이전트에 볼트 컨텍스트 제공)

### Skip (검색 X)
- 단순 수학/문법/사실
- 사용자 "검색 없이"/"바로"/"vault 무시" 명시
- 같은 세션에서 같은 쿼리 이미 검색
- QMD 미설치/오류 (silent fallback)

---

## 6. Result Format (표준 주입 포맷)

```
📚 볼트 관련 지식 N개 발견:
- [[page-name]] (score: 0.XX) — one-line summary
- [[page-name]] (score: 0.XX) — one-line summary

{필요 시 "읽어봐" 제안 또는 바로 활용}
```

Score 0.9 이상 + 사용자 명시 시에만 자동 full content Read.

---

## 7. Token Budget (가드레일)

- **세션당 합계 최대 2500 tokens** (Tier 2a 1500 + Tier 2b 1000)
- Anti-loop: 같은 쿼리 세션 내 재검색 금지
- Silence on failure: QMD 오류/미설치 → silent fallback (사용자 귀찮게 X)
- **Explicit > autonomous**: 사용자 명시 검색 요청은 항상 실행

| Start with | Cost | When to stop |
|---|---|---|
| hot.md | ~500 | 답변 있으면 |
| index.md | ~1000 | 3-5개 관련 페이지 식별되면 |
| 3-5 wiki 페이지 | ~300 each | 보통 충분 |
| 10+ 페이지 | expensive | 전체 wiki synthesis 한정 |

---

## 8. Index 포맷 (master)

`20_Wiki/06_Meta/index.md`:
```markdown
## Domains
- [[Domain Name]]: description (N sources)

## Entities
- [[Entity Name]]: role (first: [[Source]])

## Concepts
- [[Concept Name]]: definition (status: developing)

## Sources
- [[Source Title]]: author, date, type

## Questions
- [[Question Title]]: answer summary
```

섹션 헤더 먼저 스캔 → 어떤 섹션 읽을지 결정.

---

## 9. Domain Sub-Index 포맷

각 도메인 폴더의 `_index.md`:
```markdown
---
type: meta
title: "Entities Index"
updated: YYYY-MM-DD
---
# Entities

## People
- [[Person Name]]: role, org

## Organizations
- [[Org Name]]: what they do

## Products
- [[Product Name]]: category
```

도메인 한정 질문 시 sub-index 사용 → master index 전체 읽기 회피.

---

## 10. Filing Answers Back

좋은 답변은 wiki로 복리화. chat에 묻히면 안 됨.

frontmatter:
```yaml
---
type: question
title: "Short descriptive title"
question: "원본 query"
answer_quality: solid
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [question, <domain>]
related:
  - "[[Page referenced in answer]]"
sources:
  - "[[20_Wiki/01_Sources/relevant-source.md]]"
status: developing
---
```

Body: 답변 본문 + 인용 + 모든 mentioned concept/entity wikilink.

저장 후: `index.md` Questions 섹션 + `log.md` append.

---

## 11. Gap Handling

답변 불가 시:
1. 명확히: "위키에 충분한 자료 없음"
2. 구체 gap 식별: "[subtopic]에 대한 자료 0건"
3. 제안: "소스 찾아드릴까요? 검색 또는 ingest 도와드릴 수 있어요"
4. **절대 fabricate 금지** — 도메인 특화 질문에 training data로 답변 X

---

## 12. replay-learnings와의 관계

`replay-learnings`는 query의 **structured instance** — L1 (local grep) + L2 (qmd-search) 세션 시작 컨텍스트 로딩 전용.
- 일반 볼트 검색 → query 직접
- 세션 시작 지식 브리핑 → replay-learnings

---

## Examples

### 예 1 — 기술 명칭 트리거
```
User: "Hermes 개발 시작해보자"
Claude: [자율 판단: "Hermes" 고유명사 → Tier 2 check]
        [qmd search "Hermes agent" -n 5]
        "볼트에 Hermes 관련 3개 발견:
         - [[hermes-agent-install-guide]] (0.9) — 18 LLM 지원
         - [[research-gbrain-ouroboros]] (0.7) — GBrain은 Hermes용
         - [[session-2026-04-14-harness-skill-fix]] (0.6) — 이전 접목
         어느 것부터 볼까요?"
```

### 예 2 — Tier 3 gate
```
User: "Next.js 15 App Router 변경사항 찾아줘"
Claude: [Tier 2 먼저]
        [qmd search "Next.js App Router" -n 5]
        [결과 없음 — top 0.3]
        [Tier 3 진행]
        [context7로 Next.js 공식 문서 조회]
```

### 예 3 — Skip
```
User: "이 함수 어떻게 동작해?"
Claude: [Tier 2 skip — 현재 세션 context로 충분]
        [바로 코드 분석]
```

---

## Output

- **저장 X** (검색은 읽기 전용)
- **side effect**: 답변을 `20_Wiki/05_Questions/`에 file back 가능 (Standard/Deep 모드 권장)
- **인용 강제**: `(Source: [[Page]])` 형식

기존 alias `/wiki-query` 및 `/qmd-search` 모두 동일 동작 — 영구 보존.
