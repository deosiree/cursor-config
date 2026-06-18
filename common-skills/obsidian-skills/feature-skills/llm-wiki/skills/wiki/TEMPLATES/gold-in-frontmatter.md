---
name: gold-in-frontmatter
description: Gold In 5필드 스펙 + YAML 예시 + 위반/통과 사례. wiki ingest 호출 시 Soft 필터 기준.
parent_skill: wiki
applied_by: refs/ingest.md (Soft 필터 + 자동 추측+사용자 확인)
verified_by: refs/lint.md §13 (자동 검증)
---

# Gold In 5필드 — Spec + Examples

> **목적**: ingest되는 모든 raw 자료가 "왜 수집했는지", "그래서 뭘 얻었는지", "어디에 쓸 건지" 답할 수 있도록 강제. **답 못하면 Garbage In** (Karpathy 철학).

---

## 1. 5필드 정의

| # | 필드 | 위치 | 형태 | 강제도 |
|---|---|---|---|---|
| 1 | **수집 이유** | callout 상단 | `> **수집 이유**: ...` | 필수 (Soft) |
| 2 | **My Take (내 관점)** | callout 상단 | `> **내 관점 (My Take)**: ...` | 필수 (Soft) |
| 3 | **한 줄 통찰** | callout 상단 | `> **한 줄 통찰**: ...` | 필수 (Soft) |
| 4 | **Gold Out** | callout 상단 | `> **Gold Out**: ...` | 필수 (Soft) |
| 5 | **Action Intent** | callout 상단 | `> **Action Intent**: ...` | 필수 (Soft) |

**Soft 정책**: 누락 시 LLM이 자동 추측 + 사용자 확인 (Strict 거부 X). Quick 모드는 추측 자동 적용 + "AI 추정" 라벨.

---

## 2. 각 필드 의미 (왜 5개?)

### 2.1 수집 이유
- **질문**: "왜 이 자료를 모으나?"
- **답변 예**: "synthesize 'harness wiki justification' 입력 후보로", "BeautyDecode 블로그 #56 레티놀 기전 source"
- **나쁜 답**: "참고", "좋은 글" (모호 — Stale Gold In, MINOR)

### 2.2 My Take (내 관점)
- **질문**: "Daniel 맥락에서 이게 뭐가 중요한가?"
- **답변 예**: "기존 RAG 한계 보완 — 우리 Karpathy 모델 보강", "BeautyDecode 톤다운 시 활용 가능"
- **나쁜 답**: 본문 요약 반복 (My Take 아님)

### 2.3 한 줄 통찰
- **질문**: "이 자료의 한 줄 요지?"
- **답변 예**: "RAG는 컴파일 동사 부재 — 그래서 우리 wiki synthesize 필요", "레티놀은 retinoid receptor 활성화로 collagen 합성 유도"
- **형태**: 한 문장, 동사 포함 (claim)

### 2.4 Gold Out (신규)
- **질문**: "수집 후 무엇을 얻었나?"
- **답변 예**: "synthesize 인용 source 1건 확보", "블로그 도입부 첫 문단 인용 후보 3개", "강의 슬라이드 4매 분량 핵심 추출"
- **수집 이유와 비대칭 검증**: 이유 없음 → "왜 모았지?" / Out 없음 → "그래서 뭘 얻었지?" 둘 다 답해야

### 2.5 Action Intent (신규)
- **질문**: "구체적으로 어디에 쓸 것인가?"
- **답변 예**: "20_Wiki/harness-wiki-justification.md synthesize에 인용", "BeautyDecode #56 블로그 §3 인용", "세종 5주차 강의 핸드아웃"
- **포맷**: `{action}: {target}` (action = synthesize/cite/quote/teach/blog/etc.)

---

## 3. YAML Frontmatter (보조)

frontmatter는 메타데이터 — Gold In 5필드는 **본문 callout**으로:

```yaml
---
title: "..."
type: source                          # 또는 article/research/book/video
source_url: "https://..."             # ingest 시 자동 채움
fetched: 2026-04-20
author: "..."
published: 2026-04-15
confidence: 0.7                       # 0.0~1.0
last_reinforced: 2026-04-20           # ingest당 갱신
tags:
  - 분류/{type}                       # 예: 분류/리서치
  - 프로젝트/{name}                    # 예: 프로젝트/위키시스템
status: developing
---
```

---

## 4. 통과 사례 (PASS)

### 예시 A — 학술 논문 ingest
```markdown
---
title: "Karpathy LLM Wiki — 7 Step Guide"
type: source
source_url: "https://karpathy.ai/llm-wiki"
fetched: 2026-04-20
author: "Andrej Karpathy"
published: 2026-04-13
confidence: 0.9
last_reinforced: 2026-04-20
tags:
  - 분류/리서치
  - 프로젝트/위키시스템
  - Karpathy/LLM위키
status: developing
---

> **수집 이유**: 우리 wiki 지식 엔진 설계의 상위 설계도. 9동사 매트릭스 정당성 근거로 활용.
> **내 관점 (My Take)**: Karpathy의 Compiler·Runner 동사 분리가 정확히 우리에게 부재했던 부분 — synthesize/critique/compare/eli5 4동사 추가의 동기.
> **한 줄 통찰**: "LLM Wiki는 RAG의 persistent compile artifact — 사이클이 닫혀야 복리."
> **Gold Out**: 7단계 가이드 + Compiler·Runner 사이클 모델 → wiki/SKILL.md §"9 동사 라우팅" 설계 직접 인용.
> **Action Intent**: synthesize "harness wiki justification" §1 인용 + design-2026-04-20-wiki-knowledge-engine.md 부록 A.

# Karpathy LLM Wiki — 7 Step Guide

[본문...]
```

✅ 5필드 모두 구체적, action 명시, Gold Out 측정 가능.

### 예시 B — 블로그 article ingest
```markdown
> **수집 이유**: BeautyDecode #56 블로그 도입부 — "레티놀 기전" 일반인 설명 후보.
> **내 관점 (My Take)**: 해당 블로그는 retinoid receptor 분자 메커니즘 설명이 명확 — 일반인용 비유 활용 가능.
> **한 줄 통찰**: "레티놀은 retinoid receptor 활성화로 collagen 합성 유도하는 vitamin A 유도체."
> **Gold Out**: 분자 메커니즘 다이어그램 1개 + 일반인용 비유 2개 ("페인트 새로 칠하기" "스위치 ON") 후보 확보.
> **Action Intent**: BeautyDecode #56 블로그 §"기전" 단락 인용 + NotebookLM 슬라이드 #3 비유 적용.
```

✅ Daniel 맥락 명시, 구체 산출물 enumerate, action target 페이지 단위.

---

## 5. 위반 사례 (FAIL — Soft 모드는 자동 추측 트리거)

### 위반 A — 모호한 수집 이유
```markdown
> **수집 이유**: 좋은 글
> **내 관점 (My Take)**: 흥미로움
> **한 줄 통찰**: 참고할 만함
> **Gold Out**: -
> **Action Intent**: 나중에
```

❌ 모든 필드가 형용사 1단어 또는 미정. **Soft 모드 동작**:
1. LLM이 본문 정독 후 5필드 초안 자동 작성
2. "이렇게 채울게요. OK?" 사용자 확인
3. Quick 모드는 자동 적용 + "AI 추정" 라벨
4. lint §13에서 MINOR 플래그 (모호한 이유 → 재작성 권장)

### 위반 B — 본문 요약 = My Take
```markdown
> **수집 이유**: RAG에 대한 글 모음.
> **내 관점 (My Take)**: 이 글은 RAG의 한계와 GraphRAG 등장 배경을 설명한다. 그리고 LightRAG의 등장과 …  ← 본문 요약 반복
> **한 줄 통찰**: RAG가 진화하고 있다.
> **Gold Out**: -
> **Action Intent**: -
```

❌ My Take는 **Daniel 맥락에서의 의의**, 본문 요약 X. 한 줄 통찰도 모호. Gold Out / Action Intent 미작성. **Soft 모드**:
- My Take 재작성 ("Daniel의 wiki에 GraphRAG 패턴 흡수 검토 — 우리는 이미 9동사 있으나 그래프 구조는 부재")
- 한 줄 통찰: "GraphRAG는 RAG에 그래프 구조 결합 — entity·relation 명시화로 reasoning 정확도 향상"
- Gold Out: "GraphRAG vs LightRAG 비교 자료 1건 확보 — wiki compare 후보"
- Action Intent: "wiki compare 'RAG vs GraphRAG vs LightRAG' 비교 분석 시 인용"

### 위반 C — 5필드 모두 누락
```markdown
---
title: "..."
fetched: 2026-04-20
---

# 본문...
```

❌ 5필드 0건. **Soft 모드**: 본문 정독 + 5필드 전체 초안 → 사용자 확인 필수 (Quick 모드 자동 적용은 위험).

---

## 6. 자동 검증 (lint §13에 통합)

`refs/lint.md` 의 §13 새 항목으로 추가:

```markdown
13. **Gold In 5필드 검증** [MINOR or POLISH]
    - 5필드 모두 존재하는지 (`grep` callout pattern)
    - 모호한 단어 감지 ("좋은 글", "참고", "흥미로움", "나중에", "TBD") → MINOR
    - 너무 짧음 (각 필드 < 10자) → POLISH
    - My Take가 본문 요약과 Levenshtein 유사도 > 0.7 → MINOR (재작성 권장)
    - Gold Out / Action Intent에 측정 가능 산출 명시 안 됨 → POLISH
```

자동 검증 명령:
```bash
# 5필드 존재 확인
for field in "수집 이유" "내 관점 (My Take)" "한 줄 통찰" "Gold Out" "Action Intent"; do
  count=$(grep -c "> \*\*$field\*\*:" "$file")
  if [ "$count" -eq 0 ]; then echo "MISSING: $field"; fi
done

# Anti-pattern 감지
for vague in "좋은 글" "참고" "흥미로움" "나중에" "TBD" "Lorem"; do
  if grep -q "\*\*$field\*\*:.*$vague" "$file"; then
    echo "VAGUE: $field uses '$vague'"
  fi
done

# 너무 짧음
awk '/^> \*\*(수집 이유|내 관점|한 줄 통찰|Gold Out|Action Intent)/ { 
  if (length($0) < 30) print "TOO SHORT: " $0 
}' "$file"
```

---

## 7. Migration (기존 3필드 → 5필드)

기존 ingest 페이지 (3필드만 있음)를 5필드로 마이그레이션:

```bash
# 5필드 0/1/2건만 있는 페이지 식별
find ${VAULT_ROOT}/10_Raw -name "*.md" | while read file; do
  count=0
  for field in "수집 이유" "내 관점" "한 줄 통찰" "Gold Out" "Action Intent"; do
    grep -q "$field" "$file" && count=$((count+1))
  done
  if [ "$count" -lt 5 ]; then echo "$file: $count/5"; fi
done > 30_Claude/06_Designs/gold-in-migration-{date}.md
```

마이그레이션 정책:
- 우선순위: 자주 참조하는 페이지 먼저 (qmd-search 빈도 높은 것)
- Gold Out / Action Intent는 회상 가능하면 채우고, 모르면 빈 채로 (역소급 강제 X)
- 새 ingest는 5필드 의무

---

## 8. 관련 ref/skill

- `wiki/refs/ingest.md` §1 Gold In Soft 필터 — 이 템플릿 적용 위치
- `wiki/refs/lint.md` §13 — 자동 검증 위치 (Wave 5에서 추가)
- `wiki/SKILL.md` "Gold In 필터" 섹션 — 5필드 명시 (Wave 5에서 갱신)

---

## 9. 철학 (Karpathy)

> "내가 왜 이걸 수집했는지 답 못하면 Garbage In"

5필드는 그 철학의 물리적 강제:
- **수집 이유**: 입력 의도
- **My Take**: Daniel 컨텍스트
- **한 줄 통찰**: 핵심 압축
- **Gold Out**: 산출 측정 (Garbage Out 아니어야)
- **Action Intent**: 활용 약속 (수집 후 묻혀버림 방지)

5개 다 못 답하면 — 정말 garbage. ingest 보류 권장.
