---
name: critique
description: 볼트 의미 검증 (모순/Stale/Gap/Single-source/Claims outrun evidence). Adversarial Auditor 모드. lint=구조 / critique=의미 분리.
parent_skill: wiki
inspired_by: feynman/prompts/review.md + .feynman/agents/reviewer.md (정독: 30_Claude/05_Research/research-2026-04-20-feynman-prompts-deep-read.md §Wave 3)
output_path: 20_Wiki/08_Critiques/critique-{date}-{slug}.md
---

# wiki critique — 볼트 의미 검증 (Adversarial Auditor)

> **목적**: 볼트의 **의미 일관성** 검증. 단순 구조(깨진 링크/frontmatter)는 lint, **모순/Stale 주장/Gap/Single-source critical/Claims outrun evidence**는 critique.
>
> **모드**: Adversarial Auditor (peer review 아님 — verification pass). 회의적이지만 공정.
>
> **wiki ↔ feynman 경계**:
> - feynman peer-review = 외부 논문 학술 비평
> - **wiki critique = 볼트 자기검증** (이 파일)
> - 호출 의존 없음, 별개 커스텀 구현.

---

## 0. Wikilink Safety

리포트 내 `[[링크]]` 작성 전 대상 페이지 존재 확인 (refs/save.md §0). 없으면 plain text + `(파일명)` 표기.

---

## 1. lint vs critique 차별화 (NON-NEGOTIABLE)

| 측면 | lint | critique |
|---|---|---|
| 영역 | **구조** | **의미** |
| 검사 | 깨진 link, frontmatter, naming, 폴더 overflow, low confidence (수치) | 모순, Stale 주장, Gap, Single-source critical, Claims outrun evidence |
| 출력 | `30_Claude/06_Designs/lint-{date}.md` | `20_Wiki/08_Critiques/critique-{date}-{slug}.md` |
| 자동 호출 | 권장 (10-15회 ingest마다) | **수동만** (Q6=A 결정) |
| 빠르기 | 빠름 (수 초) | 느림 (수 분 ~ 수십 분) |

**critique가 lint 영역 침범 금지**: 깨진 link / frontmatter 갭 / naming은 lint로 위임.

---

## 2. 4단계 분류 (Q3.1=A — lint와 동일 4단계, 의미 영역)

| 단계 | 정의 (의미 영역) | 예시 |
|---|---|---|
| **FATAL** | 사실 거짓 / 자체 모순 / "verified" 거짓 주장 | "X is verified" 주장하나 verify 흔적 0건 |
| **MAJOR** | Single-source critical claim, claims outrun evidence, 명백한 Gap | 핵심 결론이 1 source만 / 주장 강도가 source보다 큼 |
| **MINOR** | Stale 주장, weak related-work, notation drift | 90일+ unrefreshed 주장, 같은 개념 다른 용어 |
| **POLISH** | 미흡한 cross-ref, 가독성 흠, novelty 불명확 | 관련 페이지 link 누락, "novel" 주장에 대비 X |

---

## 3. 3 입력 단위 (Q3.2=A — 모두 지원)

### 3a. 단일 파일
```
wiki critique 20_Wiki/harness-wiki-justification.md
```
- 해당 파일 1개 정독 + 의미 검증
- 사용 시점: synthesize 직후 권장 (Q2.4 권고 흐름)

### 3b. 주제
```
wiki critique "RAG 관련 주장 일관성"
```
- qmd search로 주제 관련 파일 수집 (보통 5-15개)
- 파일 간 모순 / 합치 / Gap 검증
- 사용 시점: 주기 점검, 특정 도메인 의구심

### 3c. 전체 일관성
```
wiki critique --all
```
- 볼트 전체 sample (대표 페이지 ~50개)
- 도메인 간 cross-domain 모순 검증
- 사용 시점: 분기마다, 또는 큰 ingest 사이클 후

---

## 4. critique 12가지 검사 항목 (reviewer.md 11개 + 우리 1개)

각 발견에 4단계 분류 + 인용 + 수정 제안 필수:

### 의미적 일관성
1. **모순 (Contradictions)** [FATAL or MAJOR]
   - 같은 주장에 다른 결론 — A 노트는 X, B 노트는 Y
2. **자기참조 순환 (Benchmark Contamination)** [MAJOR]
   - A → B → A 형태 reasoning. 외부 anchor 없음
3. **Notation Drift / Inconsistent Terminology** [MINOR]
   - 같은 개념이 다른 페이지에서 다른 용어로 (예: "Compiler" vs "synthesize" vs "합성")

### 증거 강도
4. **Claims outrun evidence** [MAJOR]
   - 주장 강도가 source보다 큼 ("증명됨" vs source는 "관찰됨")
5. **Single-source critical claim** [MAJOR]
   - 결정적 결론이 1개 source에만 의존, cross-validation 0
   - **자동 catch 절차 (2026-04-20 W2 후속)**:
     1. §Consensus / §Disagreements / §결론 내 각 항목의 inline 인용 source 이름 추출
     2. 항목별 unique source count 집계
     3. count == 1인 항목은 `[1 source via ...]` 라벨 존재 확인 — 라벨 없으면 **MAJOR W{n} Single-source critical (unlabeled)**
     4. §Consensus 전체에서 unique source count == 1 비율 ≥ 50%면 **MAJOR W{n} Aggregation source — Evidence 강도 고지 callout 필요**
   - synthesize.md §4/§6a가 이 라벨링을 MANDATORY로 강제하도록 업데이트됨 — critique에서 여전히 미라벨 발견 시 synthesize 실행 흐름 미준수로 기록.
6. **Insufficient stats / unsupported claim** [MAJOR]
   - 정량 주장 (X% 향상) source 0
7. **"verified/confirmed" 거짓 주장** [FATAL]
   - "검증됨" 주장하나 verification log 또는 grep으로 흔적 0건
8. **Citation quality 불일치** [MAJOR]
   - 인용 attached됐지만 source가 그 wording 실제 지원 X

### Gap / 누락
9. **Missing baselines / 비교 자료** [MINOR]
   - X 주장 단독, 대안/경쟁 옵션 비교 없음
10. **Missing ablations / 변형 미다룸** [MINOR]
    - "X가 Y 효과" 주장하나 X 없을 때 어떤지 안 다룸
11. **Weak related-work / cross-ref 누락** [POLISH]
    - 관련 페이지 [[]] 미연결
12. **Stale 주장** [MINOR]
    - `last_reinforced` 90일+ 또는 새 source가 무효화/업데이트했을 가능성

---

## 5. 외부 fact-check 정책 (Q3.3=A — 선택적)

### 디폴트: 볼트 내부만
critique는 기본적으로 **볼트 내부 일관성** 검증 — Brave/Firecrawl 사용 X.

### 외부 진입 조건 (다음 중 하나 만족 시):
1. **사용자 명시**: `wiki critique --external` 또는 "외부 fact-check 포함"
2. **Single-source critical claim 발견** + 그 source가 외부 URL인 경우 reachability 확인 (curl -I 정도)
3. **Citation quality 의심** 발견 — source가 정말 그 wording 지원하는지 외부에서 직접 확인 필요

### 외부 사용 시
- Brave search 1-2회로 cross-source
- firecrawl로 원본 페이지 fetch + 인용 wording 직접 확인
- 결과를 critique 리포트 §"외부 cross-check" 섹션에 명시

---

## 6. Inline Annotations 강제 (reviewer.md 패턴)

각 발견에 **정확한 quote** + weakness ID 연결:

```markdown
## Inline Annotations

### `20_Wiki/harness-wiki-justification.md:58`
> "The compound knowledge effect is verified across all studied systems"

**[W1] FATAL** (Citation quality 불일치 + claims outrun evidence): "verified across all"이 단정적이나, 인용된 [[research-2026-04-20-...]]은 "observed in 3 of 5 cases"라고 명시. 두 가지 mismatch — (1) 모든 시스템 X, (2) verified가 아닌 observed. **수정**: "Compound effect observed in 3 of 5 systems studied (per [[research-2026-04-20-...]] §3.2)" 로 wording 약화.

### `30_Claude/06_Designs/design-2026-04-15-...md:42`
> "We use Karpathy's 7-step pattern"

**[W2] MINOR** (Notation drift): 다른 페이지([[2026-04-13-llm-wiki-7step-guide]])는 "8-step" 표기. 같은 출처인데 step 수 불일치. **수정**: 7과 8 차이 사실 확인 (Karpathy 원문 cite) 후 통일.
```

**규칙**:
- 모든 weakness가 **specific passage** quote
- weakness ID (W1, W2...) 부여 → §6 Structured Review에서 참조
- "verified/confirmed" 발견은 자동 FATAL (검증 흔적 grep으로 확인)

---

## 7. Output 포맷 (Structured Review + Inline Annotations)

저장 위치: `30_Claude/06_Designs/critique-{YYYY-MM-DD}-{slug}.md`

```markdown
---
title: "Critique: {주제 or 파일} (YYYY-MM-DD)"
type: critique
date: YYYY-MM-DD
target_type: file | topic | all
target: "{파일 경로 or 주제 or 'all'}"
tags:
  - 개발/리뷰
  - 프로젝트/위키시스템
status: developing
---

# Critique: {topic or file}

## Summary Assessment
1-2 paragraph 개요. 검증 모드 (Adversarial Auditor), 검사한 파일 수, 발견 분포.

## Strengths
*(개선 가치 있는 강점 — 의미 검증 통과한 부분)*
- [S1] ...
- [S2] ...

## Weaknesses

### FATAL
- [W1] **자기 모순**: ... (file:line)
- [W2] **"verified" 거짓 주장**: ... (file:line)

### MAJOR
- [W3] **Single-source critical**: ... (file:line)
- [W4] **Claims outrun evidence**: ... (file:line)

### MINOR
- [W5] **Stale 주장**: ... (file:line, last_reinforced YYYY-MM-DD)
- [W6] **Notation drift**: "X" vs "Y" — ... (files)

### POLISH
- [W7] **Cross-ref 누락**: ... (file:line)

## Questions for Daniel
*(Open Questions — 사용자 결정 필요)*
- [Q1] ... (관련 W3)
- [Q2] ...

## Verdict
*(전체 평가 + confidence + 권고)*

Verification: PASS | PASS WITH NOTES | BLOCKED
- 검사한 파일: N
- FATAL: N | MAJOR: N | MINOR: N | POLISH: N
- 권고: 즉시 fix N건 / 검토 필요 N건 / 수용 가능 N건

## Revision Plan
*(우선순위별 구체 수정 단계)*

1. [W1 fix]: ... (담당: Daniel 또는 자동 fix 가능)
2. [W2 fix]: ...

## Sources
*(외부 cross-check 사용 시)*

### 볼트 내부
- 검사 대상: [file paths]

### 외부 (사용 시만)
- [URL] — Tier 3 fact-check

---

## Inline Annotations

### `path/to/file.md:42`
> "exact quote"

**[Wn] LEVEL** (분류 사유): 분석 + 수정 제안.
```

---

## 8. Required Artifacts (deepresearch 패턴)

run 종료 전 다음 파일 존재 확인:

| 산출 | 위치 | 필수 |
|---|---|---|
| Plan (검증 계획) | `30_Claude/04_Plans/critique-{date}-{slug}-plan.md` | optional (small critique 생략) |
| Evidence notes | `30_Claude/05_Research/critique-{date}-{slug}-evidence.md` | optional |
| Final critique | `20_Wiki/08_Critiques/critique-{date}-{slug}.md` | ✅ |

`--all` 모드는 plan + evidence notes 작성 권장 (큰 작업).

---

## 9. On-Disk Verification (필수)

저장 후:

```bash
VAULT=${VAULT_ROOT}
SLUG=...
DATE=$(date +%Y-%m-%d)

# Final critique 존재
test -f "$VAULT/20_Wiki/08_Critiques/critique-$DATE-$SLUG.md" || echo "BLOCKED: critique missing"

# 인용된 모든 quote가 실제 그 line에 있음 (sample 검증)
grep -oP '`\K[^`]+:\d+' "$VAULT/20_Wiki/08_Critiques/critique-$DATE-$SLUG.md" | head -5 | while read ref; do
  file="${ref%:*}"; line="${ref#*:}"
  test -f "$VAULT/$file" && echo "OK: $ref" || echo "MISSING: $ref"
done

# wikilink 모두 실제 파일 존재
grep -oP '\[\[\K[^]]+' "$VAULT/20_Wiki/08_Critiques/critique-$DATE-$SLUG.md" | sort -u | while read link; do
  found=$(find "$VAULT" -iname "${link}.md" -print -quit)
  test -n "$found" && echo "OK: [[$link]]" || echo "BROKEN: [[$link]]"
done
```

3상태 명시 (provenance 또는 critique footer):
- **PASS**: 모든 quote/wikilink 검증 통과
- **PASS WITH NOTES**: 통과하지만 1-2건 minor 의문 (footer 명시)
- **BLOCKED**: critique 자체가 파일 못 읽음 / verify 실패 — 부분 결과 + 실패 사유

---

## 10. Operating Rules (NON-NEGOTIABLE)

1. **Keep looking** — 첫 FATAL 발견 후 멈추지 말 것. 모든 영역 sweep.
2. **Quote, don't paraphrase** — 모든 weakness가 exact quote (paraphrase X)
3. **Citation quality challenge** — "[Source]" 표기됐다고 충분 X. source가 wording 실제 지원하는지 sweep.
4. **No vague praise** — Strengths도 specific evidence 인용 (general "잘 쓰여있다" X)
5. **Preserve uncertainty** — "passes depending on context"는 그대로 표기, 단정 X
6. **Distinguish blocked vs weak** — 검증 못 한 것 (BLOCKED) vs 검증해서 약점 발견 (Weakness) 구분
7. **NO chat-only end** — critique 파일이 disk에 없으면 "완료" 주장 X. 실패 시 BLOCKED critique 작성.

---

## 11. Examples

### 예 1 — 단일 파일 (synthesize 직후 권고 흐름)
```
User: "방금 만든 20_Wiki/harness-wiki-justification.md critique"
Claude:
  [Adversarial Auditor 모드 진입]
  [파일 정독 + 12 항목 sweep]
  [발견: 1 FATAL (verified 거짓 주장) / 2 MAJOR (single-source) / 3 MINOR / 1 POLISH]
  [Inline Annotations 작성 (각 발견에 exact quote)]
  [Save: 20_Wiki/08_Critiques/critique-2026-04-20-harness-wiki-justification.md]
  [On-Disk verify: 모든 quote line 존재 확인]
  → Verification: PASS WITH NOTES (1건 외부 fact-check 권장)
```

### 예 2 — 주제 (주기 점검)
```
User: "RAG 관련 주장 일관성 critique"
Claude:
  [qmd search "RAG" → 12개 파일 발견]
  [Plan 작성: 30_Claude/04_Plans/critique-2026-04-20-rag-consistency-plan.md]
  [12개 파일 정독 + cross-file 모순 검증]
  [발견: 2 모순 (FATAL) / 4 Single-source (MAJOR) / 3 Notation drift (MINOR)]
  [Save: 20_Wiki/08_Critiques/critique-2026-04-20-rag-consistency.md]
```

### 예 3 — 전체 일관성 (분기 점검, --all)
```
User: "wiki critique --all"
Claude:
  [샘플링: 도메인별 대표 5개 × 10 도메인 = 50 페이지]
  [Plan + Evidence notes 작성 (큰 작업)]
  [Cross-domain 모순 + Stale + Gap 검증]
  [발견: 5 FATAL / 18 MAJOR / 32 MINOR / 24 POLISH]
  [Revision Plan 우선순위 정렬]
  [Save: 20_Wiki/08_Critiques/critique-2026-04-20-vault-quarterly.md]
  → Daniel 검토 후 fix 진행
```

---

## Output

- **출력 위치**: `30_Claude/06_Designs/critique-{YYYY-MM-DD}-{slug}.md` (final, MANDATORY)
- **부수**: `30_Claude/04_Plans/critique-{date}-{slug}-plan.md` + `30_Claude/05_Research/critique-{date}-{slug}-evidence.md` (큰 critique 시)
- **저장 후**: index.md / log.md 갱신 + `qmd update && qmd embed` + On-Disk verify

호출: `/wiki critique <file|topic|--all>` 또는 자연어 ("일관성 체크해줘", "비판해줘", "모순 찾아").
