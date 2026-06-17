---
name: synthesize
description: 볼트 다수 파일 → 20_Wiki에 컴파일된 인사이트 (Compiler 동사). 6단계 파이프라인 + Required Artifacts + On-Disk Verify.
parent_skill: wiki
inspired_by: feynman/prompts/{lit,deepresearch,draft}.md + agents/{researcher,writer}.md (정독: 30_Claude/05_Research/research-2026-04-20-feynman-prompts-deep-read.md)
output_main: 20_Wiki/07_Syntheses/{slug}.md
output_provenance: 20_Wiki/07_Syntheses/{slug}.provenance.md
output_plan: 30_Claude/04_Plans/synthesize-{slug}.md
output_draft: 30_Claude/05_Research/synthesize-{slug}-draft.md (optional)

# MANDATORY frontmatter on final synthesis (enforced by wiki-suggest-synthesize.py):
#   synthesized_tags: [tag1, tag2, ...]   # 실제로 합성 반영한 source tag 목록
#     - 태그 빈도 기반 합성이면 ≥threshold(5) 모든 태그 나열
#     - 스킬 정의/메타 합성이면 빈 리스트 []
#     - substring 매칭 방지를 위한 선언 기반 계약 (false positive 제거)
---

# wiki synthesize — 볼트 합성 엔진 (Compiler)

> **목적**: 볼트의 흩어진 파일들을 하나의 컴파일된 인사이트로 통합. Karpathy LLM Wiki의 **Compiler** 동사 — Raw → Wiki 승격의 자동화.
>
> **wiki ↔ feynman 경계**:
> - feynman literature-review = 외부 논문 합성
> - **wiki synthesize = 볼트 파일 합성** (이 파일)
> - 두 호출 의존 없음, 각자 별개 커스텀 구현.

---

## 0. Wikilink Safety (CRITICAL)

`[[링크]]` 작성 전 대상 페이지 존재 확인 (refs/save.md §0 동일 규칙). 없으면 plain text.

---

## 1. 6단계 파이프라인

```
Plan → Gather → Synthesize → Cite → Verify → Deliver
```

각 단계 산출물 명세 (`Required Artifacts`):

| 단계 | 산출 | 위치 | 필수 |
|---|---|---|---|
| 1. Plan | plan 파일 | `30_Claude/04_Plans/synthesize-{slug}.md` | ✅ |
| 2. Gather | research notes | `30_Claude/05_Research/synthesize-{slug}-research.md` | optional |
| 3. Synthesize | draft | `30_Claude/05_Research/synthesize-{slug}-draft.md` | optional |
| 4. Cite | cited draft | (4-5 합쳐 직접 처리, 별도 파일 X) | — |
| 5. Verify | (verification log은 plan 파일 안에) | — | — |
| 6. Deliver | final + provenance | `20_Wiki/07_Syntheses/{slug}.md` + `20_Wiki/07_Syntheses/{slug}.provenance.md` | ✅ |

---

## 2. Step 1 — Plan (필수)

`30_Claude/04_Plans/synthesize-{slug}.md` **즉시** 작성 (chat 응답 전):

```markdown
---
title: "Synthesize Plan — {topic}"
type: plan
date: YYYY-MM-DD
tags: [개발/플랜, 프로젝트/위키시스템, planning/synthesize]
status: pending
---

# Synthesize Plan: {topic}

## Key Questions
- Q1: ...
- Q2: ...

## Evidence Needed
- 볼트 파일: 추정 N개 (10_Raw / 30_Claude / 20_Wiki)
- 외부 fallback: Y/N (Q3, Brave/Firecrawl)

## Scale Decision
- [ ] direct (3-10 tool calls, narrow topic)
- [ ] direct + 1 explore agent (비교 2-3)
- [ ] direct + 2-3 explore agents (broad survey)
- [ ] direct + 4-6 explore agents (multi-domain)

## Task Ledger
| # | Task | Status | Owner |
|---|---|---|---|
| T1 | qmd search "..." | pending | self |
| T2 | Read [[file]] | pending | self |

## Verification Log
| Claim | Source | Status |
|---|---|---|
| (sweep 시 채움) | | |

## Decision Log
| Decision | Rationale |
|---|---|
| (필요 시) | |
```

**Slug**: 주제에서 lowercase / hyphenated / no filler / ≤5 단어. 모든 파일에 일관 사용.

**Quick mode** ("just synthesize"): plan 작성 + 사용자에 한 줄 요약 + 즉시 Step 2 진행. 사용자 명시 review 요청 없으면 confirm 대기 X (lit.md 패턴).

**Deep mode** (사용자 "plan 검토" 요청): plan 작성 후 confirm 대기. "Proceed with this plan? Reply yes or tell me what to change."

---

## 3. Step 2 — Gather (4-Tier 검색)

`refs/query.md` §1 4-Tier 강제 적용:

```
Tier 1 — In-session context (이번 세션 이미 읽은 파일)
Tier 2a — 20_Wiki (자율, qmd search)
Tier 2b — 30_Claude (자율, qmd search)
Tier 2c — 10_Raw (수동만 — 사용자 "원본" 명시 시)
Tier 3 — 외부 fallback (Brave + Firecrawl, Tier 2 빈약 시만)
```

### Scale Decision 분기

**Direct (narrow topic)**:
- 4-Tier 직접 검색 + 핵심 페이지 Read
- 결과를 `30_Claude/05_Research/synthesize-{slug}-research.md`에 통합 노트
- subagent 위임 X

**+ N explore agents (broad)**:
- 메인 4-Tier는 직접
- 추가 영역별 explore agent Task 위임 (concurrency 권장)
- 각 agent 출력: `30_Claude/05_Research/synthesize-{slug}-research-{area}.md`
- explore agent 호출 예:
```
Agent({
  subagent_type: "Explore",
  prompt: "...에 대한 볼트 자료 매핑 — 10_Raw/06_Research/, 20_Wiki/03_Concepts/, 30_Claude/05_Research/ 모두 검색. 결과를 30_Claude/05_Research/synthesize-{slug}-research-{area}.md에 통합 노트로 저장.",
  run_in_background: true
})
```

### Search 전략 (researcher.md 흡수)
1. **Wide first** — `qmd search` queries 2-4개 동시 (다양 angle)
2. **Evaluate** — 어떤 source 유형 / 품질
3. **Narrow** — discovered terminology로 drill in
4. **Cross-source** — 볼트 + 외부 (Tier 2 + Tier 3 결합 시 Daniel 명시 권장)

### Source Quality (researcher.md 등급)
- Prefer: 볼트 06_Designs / 02_Learnings (Daniel 검증) / 학술 paper
- Accept: 잘 cited secondary / 공식 문서
- Deprioritize: SEO listicles / undated 블로그
- Reject: author/date 없음 / AI 추정

---

## 4. Step 3 — Synthesize (작성)

본인이 작성. **synthesis는 delegate X** (writer agent 호출하지 않음 — 우리 환경에서 직접).

**필수 3섹션 구조**:

```markdown
## Consensus
*(여러 source가 일치하는 것)*
- ...

## Disagreements
*(source 간 모순 / 다른 결론)*
- A 노트는 X 주장, B 노트는 Y 주장 — 차이 분석.

## Open Questions
*(미해결 / gap / 더 조사 필요)*
- ...
```

추가 섹션 (해당 시):
- `## Executive Summary` (2-3 paragraph 개요)
- `## Findings by Theme/Question` (질문별 정리)
- `## Tentative Findings` (추론 — 직접 source 없는 합리적 추정)

### Draft sweep (필수)
드래프트 완성 후 citation 전:
- 모든 critical claim/number/figure가 source URL/볼트 파일 경로/원본 artifact에 매핑
- Unsupported claim → 제거 또는 downgrade ("inferred"/"tentative" 라벨)
- Aesthetic laundering 금지 — table/plot이 evidence보다 깔끔해 보이지 않게

### Single-source Auto-Detection (MANDATORY — 2026-04-20 critique W2 후속)
섹션별 claim 목록 추출 후 sources count 자동 집계:

1. **Inventory**: 각 섹션 (Consensus / Disagreements / Open Questions / 결론) 내 주장별로 인용 source 목록 추출.
2. **Count unique sources per claim**:
   - **2+ unique sources** → 표기 불필요
   - **1 unique source** → 아래 중 하나 MANDATORY 라벨:
     - `[1 source via {source-name}]` — 직접 cross-check 안 함, 출처 명시
     - `[1 source via aggregation]` — 1차 source가 여러 URL 인용 경유 (wiki critique W2 패턴)
     - `(inferred — no direct source)` — 추론이며 source 없음
   - **0 source (inferred)** → `(inferred)` 라벨 또는 Open Questions로 downgrade
3. **자동 cross-check gate (Consensus만 해당)**:
   - §Consensus 내 모든 항목 중 unique source count == 1 비율 ≥ 50% → **Executive Summary 맨 위에 Evidence 강도 고지 callout MANDATORY** (본 synthesize는 cross-check 구조 — wording 약화 필요).
   - 고지 예시: `> **Evidence 강도 고지**: 본 합성의 Consensus N/M 항목이 단일 source ([[source]]) 경유. cross-source direct fetch 안 함. 정량 단정 ("1:1", "N/M") 사용 금지.`
4. **자동 wording downgrade 후보 탐지**:
   - 본문에 `"1:1"` / `"정확히"` / `"확실히"` / `"N/M"` (정량 비율, 매핑 표 없이 사용) 같은 단정형 wording 있으면 → `[wording 약화 후보]` 내부 메모 (저장 전 수동 검토).
   - 정량 단정 사용하려면 같은 파일 안에 **매핑 표 + enumerate 모든 항목** 필수 (숫자가 어디서 나왔는지 계산 가능해야 함).

### Visuals (writer.md 패턴)
- 차트: source-backed quantitative data만 (Mermaid 또는 ASCII)
- Mermaid: architecture/pipeline (source 지원 시만)
- 발명 데이터로 차트 생성 X
- 모든 visual에 caption + source 인용

---

## 5. Step 4 — Cite (직접 처리)

verifier subagent 대신 직접 inline citation:

### 인용 포맷
- **볼트 파일**: `(Source: [[파일명]] §섹션)` 또는 `(Source: 30_Claude/06_Designs/foo.md:42-58)`
- **외부 URL**: `(Source: https://example.com/article)` + Sources 섹션
- **위키링크 검증**: `[[파일명]]` 작성 전 §0 규칙 (find 확인)

### Sources 섹션 (마지막)
```markdown
## Sources

### 볼트
1. [[design-2026-04-20-wiki-knowledge-engine]] §3 — 7동사 매트릭스
2. [[research-2026-04-20-feynman-prompts-deep-read]] §1 — 6단계 워크플로우
3. 30_Claude/02_Learnings/2026-04-15-knowledge-system-activation.md:23-45

### 외부
4. https://karpathy.ai/llm-wiki — Karpathy 원문 (Tier 3)
5. https://arxiv.org/abs/2402.xxxxx — RAG 한계 분석 논문
```

번호 인용 형태 가능 (`[1]`, `[2]`) 또는 wikilink 직접. 일관성 유지.

---

## 6. Step 5 — Verify (직접 + critique 권고)

reviewer subagent 대신 직접 lint + critique 권고:

### 6a. Self-verify (직접, MANDATORY)
- 모든 strong claim에 source home 있는지 sweep (Verification Log 작성)
- Unsupported → downgrade 또는 제거
- **Single-source critical → 자동 라벨 MANDATORY** (§4 "Single-source Auto-Detection" 절차 실행). 라벨 미부착 드래프트는 §6c Verification에서 **BLOCKED** 처리.
- **Evidence 강도 고지 gate**: §Consensus 단일-source 비율 ≥ 50%일 때 고지 callout 없으면 **BLOCKED**.
- **정량 단정 gate**: "1:1"/"N/M"/"정확히" 같은 단정 wording이 본문에 있고 동일 파일 내 enumerate 매핑 표가 없으면 **BLOCKED**. 단정 약화하거나 매핑 표 추가 후 PASS.

### 6b. On-Disk Verification (deepresearch 흡수)
저장된 파일 실제 내용 확인:
```bash
# Plan 존재 + 핵심 섹션 확인
test -f ${VAULT_ROOT}/30_Claude/04_Plans/synthesize-{slug}.md
grep -c "Key Questions" /mnt/c/.../30_Claude/04_Plans/synthesize-{slug}.md

# 메인 + provenance 모두 존재
test -f /mnt/c/.../20_Wiki/{slug}.md
test -f /mnt/c/.../20_Wiki/{slug}.provenance.md

# 인용된 wikilink 모두 실제 파일 존재
grep -oP '\[\[\K[^]]+' /mnt/c/.../20_Wiki/{slug}.md | while read link; do
  find ${VAULT_ROOT} -iname "${link}.md" -print -quit
done
```

### 6c. Verification 3상태
provenance 파일에 명시:
- **PASS**: 모든 claim sourced + 모든 wikilink 존재 + 모든 Required Artifact 존재
- **PASS WITH NOTES**: 위 + 일부 minor (single-source critical 라벨됨)
- **BLOCKED**: 외부 source unreachable / wikilink 깨짐 / Required Artifact 누락

### 6d. critique 자동 트리거 (2026-04-20 자동화 개선)

synthesize 완료 후 **자동 `/wiki critique` 실행** (기본 동작).

**흐름**:
1. synthesize 최종 파일 저장 직후 즉시 critique 실행
2. critique 결과 Verification 3상태를 synthesize provenance에 기록:
   - `PASS` → 조용히 provenance에 기록만
   - `PASS WITH NOTES` → provenance + 사용자에게 요약 보고
   - `BLOCKED` → provenance + 경고 + 수정 권고

**Opt-out**: 사용자 명시 `--no-critique` 또는 환경변수 `AUTO_CRITIQUE=0` 시 생략.

**크론잡 경유 synthesize**: 기본 자동 critique. 대량 처리 시 `AUTO_CRITIQUE=0`으로 배치 뒤에 일괄 critique 권장.

**구현 예시**:
```bash
if [ "${AUTO_CRITIQUE:-1}" = "1" ] && [ "$NO_CRITIQUE" != "1" ]; then
    # synthesize 완료 후 critique 자동 호출
    /wiki critique "$VAULT/20_Wiki/07_Syntheses/$SLUG.md"
    # 결과를 provenance §Verification details에 append
fi
```

### 6e. Edit 정책 (deepresearch 흡수)
- 1-3 simple corrections → small Edit
- 4+ substantive fixes 또는 섹션 rewrite → full file Write (`{slug}-revised.md`로 저장 후 main 교체)
- Edit 실패 시 절대 "fix 적용" 주장 X — provenance에 실패 기록 + 작은 edit 또는 rewrite로 retry + on-disk 재검증

---

## 7. Step 6 — Deliver

### 7a. 메인 파일

저장 위치 분기 (2026-04-20 사용자 피드백 — 옵션 1 적용: synthesize 산출물은 전용 영역):
- **기본**: `20_Wiki/07_Syntheses/{slug}.md` (synthesize verb 전용 영역)
- **Entity 중심**: `20_Wiki/02_Entities/{Entity Name}.md` (단일 entity 정리 — 예외적)
- **Concept 중심**: `20_Wiki/03_Concepts/{Concept}.md` (개념 정리 — 예외적)

판단 기준: 합성 결과의 "본질"이 단일 Entity/Concept인지 여러 소스 메타 합성인지. 대부분은 `07_Syntheses/`. 비교 매트릭스는 compare verb → `04_Comparisons/`로 분리.

`20_Wiki/07_Syntheses/{slug}.md` 저장:
```markdown
---
title: "{Topic Title}"
type: synthesis
date: YYYY-MM-DD
tags:
  - 합성/synthesize
  - 프로젝트/{name}
status: developing
confidence: 0.7  # 0.0~1.0
last_reinforced: YYYY-MM-DD
sources:
  - "[[source-1]]"
  - "[[source-2]]"
related:
  - "[[관련 페이지]]"
---

> **수집 이유**: {왜 이 합성을 만들었나}
> **내 관점 (My Take)**: {Daniel 맥락에서의 의의}
> **한 줄 통찰**: {핵심 한 줄}

# {Title}

## Executive Summary
...

## Consensus
...

## Disagreements
...

## Open Questions
...

## Sources
...
```

### 7b. Provenance Sidecar
`20_Wiki/07_Syntheses/{slug}.provenance.md` 저장:
```markdown
---
type: provenance
related_synthesis: "[[{slug}]]"
date: YYYY-MM-DD
---

# Provenance: {topic}

- **Date**: YYYY-MM-DD
- **Plan**: 30_Claude/04_Plans/synthesize-{slug}.md
- **Research notes**: 30_Claude/05_Research/synthesize-{slug}-research*.md
- **Scale**: direct | direct+N agents
- **Sources consulted**: N (볼트 X, 외부 Y)
- **Sources accepted**: N
- **Sources rejected**: N (사유 명시)
- **Verification**: PASS | PASS WITH NOTES | BLOCKED
- **Verification details**: (PASS WITH NOTES/BLOCKED 시 구체)
- **Critique recommended**: Y/N (사용자 응답)

## Source Provenance Table

| # | Source | Type | URL/Path | Confidence |
|---|---|---|---|---|
| 1 | [[design-2026-04-20-...]] | 볼트/design | 30_Claude/06_Designs/... | high |
| 2 | https://... | 외부/web | https://... | medium |

## Decision Log

| Decision | Rationale |
|---|---|
| Scale = direct + 2 agents | Broad survey, 4-Tier 부족 |
| External Brave 사용 | Tier 2 top score 0.4 (부족) |
```

### 7c. 저장 후 (MANDATORY)
1. `20_Wiki/06_Meta/index.md` 신규 entry 추가
2. `20_Wiki/06_Meta/log.md` TOP에 이력 추가
3. `20_Wiki/06_Meta/hot.md` 갱신 (Recent Changes 섹션)
4. `qmd update && qmd embed` 실행 (refs/manage.md 자동 호출)
5. **On-Disk Verification 재실행** (위 §6b)
6. 사용자에게 critique 권고 (위 §6d)

---

## 8. Required Artifacts 강제 (NON-NEGOTIABLE)

run 종료 전 모든 필수 파일 존재 확인. 빠지면 BLOCKED.

```bash
VAULT=${VAULT_ROOT}
SLUG=...
test -f "$VAULT/30_Claude/04_Plans/synthesize-$SLUG.md" || echo "BLOCKED: plan missing"
test -f "$VAULT/20_Wiki/07_Syntheses/$SLUG.md" || echo "BLOCKED: final missing"
test -f "$VAULT/20_Wiki/07_Syntheses/$SLUG.provenance.md" || echo "BLOCKED: provenance missing"
```

Plan 작성 후 capability 실패 → 반드시 partial output + BLOCKED provenance 작성 (chat-only output X).

---

## 9. 6 Integrity Commandments (NON-NEGOTIABLE)

(researcher.md + writer.md 흡수)

1. **Never fabricate source** — 모든 인용에 verifiable URL 또는 볼트 파일 경로
2. **URL or it didn't happen** — 인용 못하면 evidence 항목 X
3. **Read before summarize** — title/abstract만으로 추론 X (실제 Read 후 summarize)
4. **Preserve caveats and disagreements** — 불확실성 smooth away X
5. **Be explicit about gaps** — Open Questions에 명시
6. **No aesthetic laundering** — table/chart을 evidence보다 깔끔해 보이지 않게

---

## 10. Anti-Fabrication 체크리스트

저장 전 sweep (**MANDATORY — 하나라도 FAIL이면 BLOCKED, 저장 금지**):
- [ ] 모든 file:line 인용이 실제 그 line에 그 내용 있음 (`grep` 검증)
- [ ] 모든 wikilink 대상 파일 존재 (`find` 검증)
- [ ] 모든 외부 URL reachable (`curl -I` 또는 fetch 확인 — Tier 3 사용 시)
- [ ] 발명 figure/chart/benchmark 0건
- [ ] **Single-source critical claim 자동 감지 완료** — unique source count == 1인 모든 Consensus 항목에 `[1 source via ...]` 또는 `[1 source via aggregation]` 라벨 부착 (§4 Single-source Auto-Detection 절차)
- [ ] **Consensus 단일-source 비율 ≥ 50%인 경우 Executive Summary에 Evidence 강도 고지 callout 존재**
- [ ] **정량 단정 wording 점검** — "1:1"/"N/M"/"정확히"/"확실히" 사용 시 동일 파일 내 enumerate 매핑 표 존재 (수치 계산 가능). 없으면 wording 약화 또는 표 추가.
- [ ] tentative findings는 "tentative" 라벨
- [ ] (inferred) 주장은 명시적 `(inferred)` 라벨 + Open Questions로 downgrade 검토

---

## 11. Examples

### 예 1 — Direct (narrow)
```
User: "Karpathy LLM Wiki 정의 합성"
Claude:
  Step 1: Plan → 30_Claude/04_Plans/synthesize-karpathy-llm-wiki.md (Scale: direct)
  Step 2: qmd search "Karpathy LLM Wiki" → top 0.92
          Read [[2026-04-13-llm-wiki-7step-guide]] (file:line 인용)
  Step 3: Synthesize 3섹션 (Consensus / Disagreements / Open Questions)
  Step 4: 인용 file:line + Sources 섹션
  Step 5: On-Disk verify (grep으로 인용 확인)
  Step 6: 20_Wiki/karpathy-llm-wiki.md + .provenance.md 저장
          → 사용자: "critique 권장합니다. 돌릴까요?"
```

### 예 2 — Broad (3 explore agents)
```
User: "하네스+위키 정당성 합성 (10_Raw/07_Scholar 활용)"
Claude:
  Step 1: Plan → Scale: direct + 3 explore agents
  Step 2: 4-Tier 직접 + 3개 영역별 explore agent 병렬 위임
          (영역: 학술 / 프로젝트 사례 / Daniel 적용 사례)
  Step 3: 통합 draft (Consensus 풍부 / Disagreements 명시 / Open Q 5건)
  Step 4: 모든 claim에 인용 (볼트 + arXiv URL)
  Step 5: On-Disk verify + Verification: PASS WITH NOTES (1건 single-source)
  Step 6: 20_Wiki/harness-wiki-justification.md + .provenance.md 저장
```

---

## Output

- **출력 위치**: `20_Wiki/07_Syntheses/{slug}.md` (메인) + `20_Wiki/07_Syntheses/{slug}.provenance.md` (sidecar)
- **부수 산출**: `30_Claude/04_Plans/synthesize-{slug}.md` (plan, 필수) + `30_Claude/05_Research/synthesize-{slug}-research*.md` (선택) + `*-draft.md` (선택)
- **저장 후**: index.md / log.md / hot.md 갱신 + `qmd update && qmd embed` + On-Disk verify + critique 권고

기존 alias 없음 (synthesize는 신규 동사). 호출: `/wiki synthesize <topic>` 또는 자연어 ("X 합성해줘").
