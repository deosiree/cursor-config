---
name: eli5
description: 볼트 파일 또는 주제 → 6섹션 평이 설명. Daniel 강의/BeautyDecode/Discord 수강생 직결. 어제 만든 skills/eli5/ 본문 흡수 + 볼트 입력 전용 가드레일.
parent_skill: wiki
absorbed_from: ~/.claude/skills/eli5/ (어제 임시 독립 — Wave 4에서 흡수, 디렉토리는 ~/.claude/.wiki-backups/eli5-2026-04-20/로 격리)
inspired_by: feynman/refs/eli5.md (외부 논문용) — 우리는 볼트 파일용 커스텀
output_default: 20_Wiki/09_ELI5/eli5-{YYYY-MM-DD}-{slug}.md (자동 저장, 다른 7개 verb와 일관)
output_inline: audience "inline-only" 또는 --inline 플래그 시 인라인 출력 (Discord 1회성 답변 등)
policy_changed: 2026-04-21 (inline default → auto-save default, Daniel 승인)
---

# wiki eli5 — 볼트 파일/주제 → 6섹션 평이 설명

> **목적**: 복잡한 개념을 **6섹션 표준 구조**로 풀어낸다. 강의자료, 블로그, BeautyDecode 독자 설명, 세종/경복대 수강생용.
>
> **wiki ↔ feynman 경계**:
> - feynman/refs/eli5 = **외부 논문** → 평이 설명 (arXiv 직접 입력)
> - **wiki/refs/eli5 = 볼트 파일/주제** → 평이 설명 (이 파일)
> - 두 디렉토리 다른 입력원, 별개 커스텀 구현. 호출 의존 없음.

---

## 0. Wikilink Safety

저장 모드에서 `[[링크]]` 작성 전 대상 페이지 존재 확인 (refs/save.md §0). 없으면 plain text.

---

## 1. 입력 유형 (Q4.3=A — 두 가지 모두 지원)

| 입력 | 처리 |
|---|---|
| **파일 경로** (예: `20_Wiki/karpathy-llm-wiki.md`) | 직접 Read → 6섹션으로 변환 |
| **주제** (예: "Transformer", "RAG") | qmd search → 가장 명확한 1-3개 볼트 파일 anchor → 6섹션 |
| **외부 자료** (URL, arXiv) | **feynman 스킬로 위임** ("외부 논문은 feynman eli5 사용 권장") |

**볼트 입력 전용 가드레일**:
- 입력원이 볼트 파일/주제일 때만 이 ref 사용
- 외부 논문/URL이면 feynman으로 redirect
- 두 스킬 호출 의존 없음 — 입력원으로 분기

---

## 2. 6-Section Output Template (어제 본문 흡수)

```markdown
## ELI5: <주제>

### One-Sentence Summary
(1문장, 30자 이내 핵심)

### Big Idea
(2-4문장, 큰 그림. 왜 만들어졌나, 무슨 문제를 푸나)

### How It Works
(3-6문장. 실제로 어떻게 작동하는지. 기술 용어는 즉시 정의하거나 비유로 치환)

### Why It Matters
(2-3문장. 누가 이걸 알아야 하고, 뭐가 달라지나. 구체적 영향)

### What To Be Skeptical Of
(2-3개. 과장된 주장·한계·측정 안 된 것. "아직 증명 안 됨" 명시)

### If You Remember 3 Things
1. (핵심 1)
2. (핵심 2)
3. (핵심 3)
```

---

## 3. 5 Guidelines (절대 규칙 — 어제 본문 흡수)

1. **짧은 문장, 구체적 단어** — 추상 명사 대신 동사/물건 이름
2. **전문용어 즉시 정의 or 제거** — "어텐션 메커니즘" → "입력 중 어디에 집중할지 고르는 장치"
3. **하나의 좋은 비유 > 여러 약한 비유** — 하나 고르고 끝까지 관철
4. **사실 vs 해석 분리** — "이 논문은 X를 보였다" vs "따라서 Y일 것이다"
5. **자동 저장 default** — `20_Wiki/09_ELI5/eli5-{date}-{slug}.md`에 적립 + 대화에 요약 출력. 1회성 답변(`--inline` 또는 audience `inline-only`)만 인라인 단독.

---

## 4. 볼트 입력 처리 흐름

### 4a. 파일 경로 입력
```
User: "wiki eli5 20_Wiki/karpathy-llm-wiki.md"
Claude:
  1. Read 파일 (frontmatter + 본문 정독)
  2. 핵심 주장 추출 (3-5개)
  3. 6섹션 변환 (5가이드 준수)
  4. audience 확인 (사용자 명시 없으면 default "general")
  5. 자동 저장: 20_Wiki/09_ELI5/eli5-{date}-{slug}.md
  6. 대화에 요약 출력 + 저장 경로 명시 ("→ 저장: [[eli5-YYYY-MM-DD-slug]]")
  # --inline 또는 audience "inline-only" 시 5~6 건너뛰고 전문 인라인만
```

### 4b. 주제 입력 (qmd search anchor)
```
User: "wiki eli5 GraphRAG"
Claude:
  1. qmd search "GraphRAG" -c obsidian -n 5
  2. top 1-3개 파일 식별 (score ≥ 0.7)
  3. 가장 명확한 1개 anchor (score 가장 높은 것 default)
  4. anchor 파일 Read + 다른 1-2개로 보조
  5. 6섹션 변환
  6. audience 확인 + 자동 저장 (4a 동일 흐름)
  7. 대화에 요약 출력 + anchor 명시 + 저장 경로
```

### 4c. 외부 자료 (redirect)
```
User: "wiki eli5 https://arxiv.org/abs/2402.xxxxx"
Claude:
  → "외부 논문은 feynman 스킬이 적합합니다. `/feynman eli5 <URL>` 사용 권장."
  → 사용자가 "그래도 wiki로" 명시하면 firecrawl로 fetch 후 처리 (예외)
```

---

## 5. 저장 규칙 (자동 저장 default, 2026-04-21 정책 변경)

**정책 변경 (2026-04-21, Daniel 승인)**: 이전 "인라인 default + 명시 시만 저장" → 현재 "자동 저장 default + 명시적 인라인". 다른 7개 verb (synthesize/critique/compare/...)와 일관성 확보.

**기본 동작**: 모든 eli5 호출은 `20_Wiki/09_ELI5/eli5-{date}-{slug}.md`에 자동 저장. 대화에는 요약 + 저장 경로 출력.

**인라인 예외** (명시적 opt-out):
- `--inline` 플래그: `/wiki eli5 <topic> --inline` — 저장 skip
- audience `inline-only`: frontmatter에 기록 없이 1회성 답변
- 발동 키워드: "Discord 답변만", "짧게 설명", "저장 말고", "1회성"

| 용도 | 저장 위치 | 파일명 |
|---|---|---|
| 강의자료 / 핸드아웃 | `20_Wiki/09_ELI5/` | `eli5-{YYYY-MM-DD}-{slug}.md` |
| 블로그 초안 | 프로젝트 폴더 또는 `20_Wiki/09_ELI5/` | `eli5-{YYYY-MM-DD}-{slug}-blog.md` |
| 시리즈 (수강생용) | `20_Wiki/09_ELI5/eli5-series-{topic}/` | `01-...md`, `02-...md` |
| **1회성 답변 (인라인)** | — | 저장 안 함 (대화 only) |

**프론트매터 (저장 시 MANDATORY)**:
```yaml
---
title: "ELI5: {topic}"
type: explainer
date: YYYY-MM-DD
audience: BeautyDecode | 세종 | 경복대 | Discord | seteuk | 블로그 | general | inline-only
anchor_files:
  - "[[anchor-file-1]]"
  - "[[anchor-file-2]]"
tags:
  - 강의/수강생
  - 프로젝트/{name}
status: developing
---
```

저장 후: `qmd update && qmd embed`

---

## 6. Daniel 활용 맥락 (어제 본문 흡수)

| 상황 | 예시 입력 | 출력 형태 |
|---|---|---|
| **BeautyDecode 독자 설명** | "레티놀 기전 쉽게 설명" | 6섹션 인라인 → 블로그 초안용 |
| **세종사이버대 AI자격증 강의** | 주차별 핵심 개념 | 강의자료 (저장) |
| **경복대 AI 강의** | "LLM이 뭐야?", "RAG가 뭐야?" | 인라인 → 슬라이드 변환 |
| **Discord 수강생 채널** | 최신 AI 뉴스 쉬운 설명 | 인라인 (짧음) |
| **seteuk 세특** | 학생 관심 주제 기초 설명 | 강의자료 (저장) |
| **블로그 초안** | 기술 블로그 시리즈 1편 | 저장 + 후속 편집 |

---

## 7. 호출 예시

```
/wiki eli5 20_Wiki/karpathy-llm-wiki.md          # 파일 경로 → 자동 저장
/wiki eli5 "Transformer attention mechanism"     # 주제 → 자동 저장
"레티놀 기전 쉽게 설명해줘"                          # 자연어 → 자동 저장
"GraphRAG 초보자용으로"                            # 자연어 → 자동 저장
"세종 강의용으로 RAG 풀어"                          # audience 명시 → 저장
/wiki eli5 "Transformer" --inline                # 인라인 단독 (저장 skip)
"Discord 답변만 짧게"                              # 자연어 opt-out → 인라인
```

기존 `/eli5` alias도 동작 (어제 임시 독립 → 라우터에서 `/wiki eli5`로 위임 — Wave 6 정식).

---

## 8. Anti-Patterns (피하기)

- "복잡한 개념을 더 복잡하게 풀기" — 6섹션 채우려 무리하게 늘리기
- 비유 5개 나열 — 1개 골라 끝까지
- 용어 정의 없이 사용 — 즉시 정의
- "쉬운 척 어려운 글" — 진짜 짧고 구체적인 단어로
- 사실/해석 섞기 — 분리 명시 (가이드 #4)

---

## 9. On-Disk Verification (저장 모드만)

```bash
VAULT=${VAULT_ROOT}
DATE=$(date +%Y-%m-%d); SLUG=...

test -f "$VAULT/20_Wiki/09_ELI5/eli5-$DATE-$SLUG.md" || echo "BLOCKED: missing"

# 6섹션 모두 존재 확인
for s in "One-Sentence Summary" "Big Idea" "How It Works" "Why It Matters" "What To Be Skeptical Of" "If You Remember 3 Things"; do
  grep -q "$s" "$VAULT/20_Wiki/09_ELI5/eli5-$DATE-$SLUG.md" || echo "MISSING SECTION: $s"
done

# wikilink 검증
grep -oP '\[\[\K[^]]+' "$VAULT/20_Wiki/09_ELI5/eli5-$DATE-$SLUG.md" | while read link; do
  test -n "$(find "$VAULT" -iname "${link}.md" -print -quit)" || echo "BROKEN: [[$link]]"
done
```

---

## 10. 관련 ref/skill

- `feynman` (외부 스킬) — 외부 논문 → 평이 설명 (입력원 다름)
- `wiki/refs/synthesize` — 합성 후 권고 흐름의 일부 (synthesize → critique 권고 → eli5 권고)
- `wiki/refs/query` — 주제 입력 시 anchor 식별

---

## Output

- **출력 default**: `20_Wiki/09_ELI5/eli5-{YYYY-MM-DD}-{slug}.md` **자동 저장** + 대화에 요약·저장 경로 출력 (정책 변경 2026-04-21)
- **인라인 단독** (opt-out): `--inline` 플래그 / audience `inline-only` / 자연어 opt-out ("Discord 짧게", "저장 말고", "1회성") — 저장 skip하고 대화 전문 출력
- **저장 후**: `06_Meta/index.md` ELI5 섹션 + `06_Meta/log.md` entry 추가 + `qmd update && qmd embed` + On-Disk verify (6섹션·위키링크)

호출: `/wiki eli5 <file|topic> [--inline]` 또는 `/eli5` (alias 영구 보존) 또는 자연어 ("쉽게 설명해줘", "초보자용", "ELI5").
