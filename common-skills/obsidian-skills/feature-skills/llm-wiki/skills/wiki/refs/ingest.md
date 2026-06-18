---
name: ingest
description: 외부 자료를 10_Raw로 흡수 + Gold In Soft 필터 + provenance 기록. URL/이미지/파일/배치 4가지 진입.
parent_skill: wiki
absorbed_from: ~/.claude/skills/wiki-ingest/ (alias 영구 보존)
---

# wiki ingest — 외부 자료 → 10_Raw + Gold In Soft 필터

> Source 읽기 → Wiki 쓰기 → cross-reference. 단일 source 보통 8-15 wiki 페이지 영향.
> **Syntax**: Obsidian Flavored Markdown. wikilinks `[[Note]]`, callouts `> [!type]`, embeds `![[file]]`, frontmatter YAML.

---

## 0. Wikilink Safety (CRITICAL)

`[[링크]]` 작성 전 **반드시** 대상 페이지 존재 확인:

```bash
find ${VAULT_ROOT} -iname "페이지명*.md" | head -3
# 또는
obsidian-cli search-content "페이지명"
```

- 존재 → `[[파일명]]` (확장자 제외)
- 존재 X (이번 ingest에서 생성 예정) → 페이지 먼저 생성
- 존재 X (생성 계획 없음) → **plain text** (절대 broken link 만들지 않음)
- 스킬 파일은 절대 `[[스킬명]]` 금지

---

## 1. Gold In Soft 필터 (Q7=B + Wave 5 5필드 확장)

5개 필수 필드 누락 시 **자동 추측 + 사용자 확인** (Strict 거부 X):

1. **수집 이유** (`> **수집 이유**: ...`) — "왜 모았나?"
2. **My Take (내 관점)** (`> **내 관점 (My Take)**: ...`) — "Daniel 맥락에서 의의?"
3. **한 줄 통찰** (`> **한 줄 통찰**: ...`) — 핵심 한 문장
4. **Gold Out** (`> **Gold Out**: ...`) — "그래서 뭘 얻었나?" (Gold In 비대칭 검증)
5. **Action Intent** (`> **Action Intent**: ...`) — "{action}: {target}" 형식 (예: "synthesize: harness-wiki-justification §1")

**처리 흐름**:
- 누락 감지 → 소스 내용 + Daniel 맥락 (CLAUDE.md/memory) 기반 5필드 초안 생성
- "이렇게 채울게요. OK?" 확인 (Quick 모드면 자동 적용 + "AI 추정 — 검토" 표시)
- 스펙: `~/.claude/skills/wiki/TEMPLATES/gold-in-frontmatter.md`
- 자동 검증: `wiki/refs/lint.md §13` (모호 단어/짧음/본문 요약 반복 감지)

이유: "내가 왜 수집했는지 + 뭘 얻었는지 + 어디 쓸지 답 못하면 Garbage In" — Karpathy 철학 물리적 강제.

---

## 2. Delta Tracking (재처리 방지)

```bash
[ -f 10_Raw/.manifest.json ] && echo "exists" || echo "no manifest yet"
```

`.manifest.json` 포맷:
```json
{
  "sources": {
    "10_Raw/articles/article-slug-2026-04-08.md": {
      "hash": "abc123",
      "ingested_at": "2026-04-08",
      "pages_created": ["20_Wiki/01_Sources/article-slug.md", "20_Wiki/02_Entities/Person.md"],
      "pages_updated": ["20_Wiki/06_Meta/index.md"]
    }
  }
}
```

**Before**: `md5sum [file] | cut -d' ' -f1` → manifest 일치하면 skip ("Already ingested. Use `force` to re-ingest").
**After**: `{hash, ingested_at, pages_created, pages_updated}` 기록.
**Skip**: "force ingest" / "re-ingest" 명시.

---

## 3. URL Ingest

Trigger: `https://`로 시작하는 URL.

1. **Fetch** WebFetch.
2. **Clean** (선택): `which defuddle 2>/dev/null` → `defuddle [url]` (40-60% 토큰 절감).
3. **Slug** URL path 마지막 segment, lowercase, spaces→hyphens, query strip.
4. **Save** `10_Raw/01_Articles/[slug]-[YYYY-MM-DD].md`:
   ```markdown
   ---
   source_url: [url]
   fetched: [YYYY-MM-DD]
   ---
   ```
5. **Single Source Ingest** §5 step 2부터 진행.

---

## 4. Image / Vision Ingest

Trigger: 이미지 파일 경로 (`.png/.jpg/.jpeg/.gif/.webp/.svg/.avif`).

1. **Read** 이미지 파일 (Claude native vision).
2. **Describe**: OCR + 핵심 개념/엔티티/다이어그램/데이터 추출.
3. **Save** `10_Raw/04_Notes/images/[slug]-[YYYY-MM-DD].md`:
   ```markdown
   ---
   source_type: image
   original_file: [path]
   fetched: YYYY-MM-DD
   ---
   # Image: [slug]

   [Full description]
   ```
4. **Copy** 이미지를 `_attachments/images/[slug].[ext]`로 (vault 외부면).
5. **Single Source Ingest** 진행.

용도: 화이트보드 사진, 스크린샷, 다이어그램, 인포그래픽, 문서 스캔.

---

## 5. Single Source Ingest (메인 워크플로우)

Trigger: 사용자가 `10_Raw/`에 파일 드롭 또는 콘텐츠 붙여넣기.

1. **Read Policy** — `20_Wiki/06_Meta/policy.md` (분류 기준 확인).
2. **Read** source 완전 정독 (skim 금지).
3. **AI Draft + Structural Normalization** — raw 정규화 + Gold 필드 채움. 표준 스키마: `20_Wiki/06_Meta/raw-schema.md` 참조.

   **3a. Gold Fields 초안** (Soft 필터 §1):
   - `수집 이유` 비어 있으면 → 소스 + CLAUDE.md 맥락 기반 초안
   - `내 관점 (My Take)` 비어 있으면 → 사용자 프로젝트/관심사 연결 초안
   - `핵심 요약` 비어 있으면 → 소스 3-5문장 추출
   - `author`, `published`, `confidence`, `last_reinforced` 자동 채움

   **3b. Structural Normalization** (raw 직접 편집):
   - 상단 Callout 2개 보장: 프론트매터 직후 `> **수집 이유**:` + `> **내 관점 (My Take)**:`
   - 빈 하단 섹션 제거 (상단으로 이동했으므로)
   - 본문 정리: 중복 헤딩, `<iframe>/<script>/<style>` 태그, 광고/네비게이션 텍스트 제거. 이미지 링크 유지 (깨진 것만 제거).
   - 소스 타입별 고유 섹션:
     - research → `## 방법론 (Methodology)`, `## 한계 및 의문`
     - book → `## 핵심 인용`, `## 주요 개념`
     - education → `## 학습 포인트`, `## 실습/적용`
     - youtube → `## 타임스탬프별 핵심`
     - article → 없음

   **3c. 모드**:
   - **대화형**: 정규화 결과 diff 확인 후 반영
   - **Quick** ("just ingest"): 자동 적용 + "AI 정규화 + Gold 초안 적용" 표시

   **중요**: raw 불변 원칙 예외 — 본문 의미는 유지, 구조만 정리.

4. **Source 요약** `20_Wiki/01_Sources/`. 프론트매터 `confidence: 0.7`, `last_reinforced: 오늘`. 본문 최상단 `> **한 줄 통찰**: ...`.

5. **Entity 페이지** 생성/갱신 — 사람/조직/제품/repo 각각 1페이지. policy.md의 entity vs concept 경계 판단.

6. **Concept 페이지** 생성/갱신 — significant 아이디어/프레임워크.

7. **Domain 페이지(들)** + `_index.md` 서브 인덱스 갱신.

8. **`overview.md`** 큰 그림 변동 시 갱신.

9. **`index.md`** 신규 페이지 추가 (Sources / Entities / Concepts / Questions 섹션별).

10. **`hot.md`** 이번 ingest 컨텍스트 반영 (~500단어, 통째 덮어쓰기).

11. **`log.md`** TOP에 append:
    ```markdown
    ## [YYYY-MM-DD] ingest | Source Title
    - Source: `10_Raw/articles/filename.md`
    - Summary: [[Source Title]]
    - Pages created: [[Page 1]], [[Page 2]]
    - Pages updated: [[Page 3]], [[Page 4]]
    - Key insight: One sentence on what is new.
    ```

12. **모순 체크** — 새 정보가 기존 페이지와 충돌 시 양쪽에 `> [!contradiction]` callout.

13. **Confidence 할당** — 모든 신규/갱신 페이지에 `confidence: 0.0~1.0`. policy.md 기준표 참조.

14. **QMD 인덱싱** (manage 자동 호출):
    ```bash
    qmd update && qmd embed
    ```

15. **Graphify 재빌드** (`--update` 모드):
    ```bash
    cd ${VAULT_ROOT}/20_Wiki && graphify . --update
    ```
    - **자동 실행**: 단일 ingest 완료 후 1회. 배치는 §6 참조.
    - **스킵**: 사용자 "graphify 건너뛰라" / 신규 페이지 0개
    - **실패**: ingest는 성공으로 간주, 경고만 로그 + 사용자에 "/graphify 수동 재실행 권장"

16. **무결성 검증 (MANDATORY)**:
    ```bash
    python3 ~/.claude/hooks/wiki-integrity-check.py
    ```
    - 0-token 로컬 검증 (Python, no LLM)
    - 검사: manifest pages_created / 깨진 wikilink / 중복 소스 / orphan / stale
    - **이슈 발견 시 fix 후 재실행** — 0 issues 후에만 "완료" 보고

---

## 6. Batch Ingest

Trigger: 다수 파일 드롭 또는 "ingest all of these".

1. 처리 파일 목록 확인 → 사용자 confirm.
2. 각 source는 §5 **Step 1-9만** 실행 (Read → Source/Entities/Concepts/Domain). Step 10-16 skip.
3. **Per-source manifest tracking (CRITICAL)** — 각 source 페이지 생성 직후 즉시 in-memory list에 `{hash, ingested_at, pages_created, pages_updated}` 기록. 배치 끝까지 미루면 분실.
4. 모든 source 완료 후 cross-reference pass — 신규 source 간 연결 탐색.
5. **Batch finalization (1회만)**:
   - `index.md` / `hot.md` / `log.md` 갱신 (Step 9-11)
   - Confidence 할당 (Step 13)
   - `qmd update && qmd embed` (Step 14)
   - **Graphify**: `cd .../20_Wiki && graphify . --update` (배치당 1회만 — 토큰 절감 + 일관성)
   - `wiki-integrity-check.py` (Step 16 MANDATORY)
6. **Manifest write (MANDATORY)** — `.manifest.json`에 누적 entries 작성. **각 source `pages_created` 비어있지 않은지 검증**. 빈 게 있으면 STOP — ingest 안 된 것.
7. Report: "Processed N sources. Created X / updated Y pages. Manifest verified: all N have pages_created. Graphify rebuilt. Key connections: ..."

**과거 실패 모드**: batch ingest가 wiki 페이지는 만들었지만 manifest의 `pages_created: []`로 남는 ghost state. 항상 Step 6 검증.

30+ source 배치는 매 10개마다 사용자 check-in.

---

## 7. Web Clipper Templates

볼트 `90_Settings/clipper-templates/`에 소스 유형별 템플릿:

| 소스 유형 | 템플릿 | 핵심 필드 |
|---|---|---|
| 기사/블로그 | `clipper-article.md` | url, author, key_claims |
| 유튜브 | `clipper-youtube.md` | url, channel, timestamps |
| 논문/리서치 | `clipper-research.md` | authors, methodology, limitations |
| 도서 | `clipper-book.md` | author, key quotes, concepts |
| 교육 자료 | `clipper-education.md` | instructor, learning points |

**공통 필드**: `수집 이유` (Gold In), `내 관점` (My Take), `confidence` (수치), `last_reinforced`.

---

## 8. Context Window Discipline

- `hot.md` 먼저 읽기 → 관련 컨텍스트 있으면 full page 재독 X
- `index.md` 읽고 기존 페이지 확인 (중복 방지)
- ingest당 기존 페이지 3-5개만 Read. 10개+ 필요하면 너무 광범위함
- PATCH (Edit) 사용 — 한 필드 수정에 full file Read 금지
- 페이지 100-300줄 유지. 300줄 넘으면 split

---

## 9. Contradiction Handling

새 정보가 기존 페이지와 충돌 시:

기존 페이지에:
```markdown
> [!contradiction] Conflict with [[New Source]]
> [[Existing Page]] claims X. [[New Source]] says Y.
> Needs resolution. Check dates, context, primary sources.
```

신규 source 요약에:
```markdown
> [!contradiction] Contradicts [[Existing Page]]
> This source says Y, but existing wiki says X. See [[Existing Page]] for details.
```

**절대 silent overwrite 금지** — flag and let user decide.

---

## 10. What NOT to Do

- `10_Raw/` 수정 금지 (정규화 §3b는 raw 불변 원칙의 명시 예외)
- 중복 페이지 생성 금지 (index/search 먼저)
- log entry skip 금지 — 모든 ingest 기록
- hot cache 갱신 skip 금지 — 다음 세션 속도 결정

---

## Output

- **출력 위치**: `10_Raw/{NN}_{type}/{date}-{slug}.md` + provenance
- **manifest 갱신**: `10_Raw/.manifest.json`
- **side effect**: 20_Wiki/{Sources, Entities, Concepts, Domains, Meta} 페이지 생성/갱신
- **wikilink 검증**: `[[]]` 모든 링크 존재 확인 (없으면 plain text)
- **저장 후**: `qmd update && qmd embed` + `graphify . --update` + `wiki-integrity-check.py` (MANDATORY)

기존 alias `/wiki-ingest`도 동일 동작 — 영구 보존.
