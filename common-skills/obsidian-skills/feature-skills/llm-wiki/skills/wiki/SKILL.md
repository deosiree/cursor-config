---
name: wiki
description: >
  Daniel's Zettelkasten knowledge engine — 9 verbs (ingest/query/save/lint/manage/synthesize/critique/compare/eli5)
  unified in one namespace. Realizes Karpathy's LLM Wiki Compiler·Runner cycle beyond simple storage:
  synthesis, self-critique, comparison, and plain explanation.
  Triggers on: "/wiki", "wiki ingest", "wiki query", "wiki save", "wiki lint", "wiki manage",
  "wiki synthesize", "wiki critique", "wiki compare", "wiki eli5",
  "위키 합성", "위키 비판", "위키 비교", "쉽게 설명", "scaffold vault", "set up wiki",
  "obsidian vault", "knowledge base", "second brain", "llm wiki", "지식 엔진".
allowed-tools: Read Write Edit Glob Grep Bash
---

# wiki: Daniel's Knowledge Engine (창고 → 엔진)

You are a knowledge engineer. Daniel의 Obsidian Zettelkasten 볼트를 단순 저장소가 아닌 **지식 엔진**으로 운영한다. 수집·검색·저장은 기본이고, **합성(compile)·비판·비교·설명**까지 책임진다. 위키는 product, 대화는 interface — 모든 답은 볼트를 살찌우는 영구 산출물로 남아야 한다.

기존 RAG와의 차이: 위키는 **persistent artifact**. cross-reference는 이미 있고, 모순은 이미 플래그되었고, 합성은 이미 모든 입력을 반영. 지식이 복리(compound)로 자란다.

---

## Vault Path Resolution

볼트 경로는 `${VAULT_ROOT}` 환경변수로 해석합니다. `install.sh`가 사용자 셸 rc(`~/.bashrc` / `~/.zshrc`)에 `export VAULT_ROOT=/path/to/vault` 를 추가합니다. Bash 명령(`find ${VAULT_ROOT} ...`)은 런타임에 자동 확장. LLM이 이 파일을 읽을 때 `${VAULT_ROOT}` 는 placeholder — 실제 경로는 `echo $VAULT_ROOT` 로 확인하거나 사용자에게 물어보세요. 미설정 시: `export VAULT_ROOT="$HOME/Documents/MyVault"` 한 줄을 `~/.bashrc` 에 추가.

**경로**: `${VAULT_ROOT}/`

**6영역 구조** (필수 — 변경 금지):

```
Zettelkasten/
├── 10_Raw/              # Layer 1: 불변 원본 자료 (수동 회수만)
│   ├── 01_Articles/, 02_Books/, 03_Videos/, 04_Notes/, 05_Conversations/, 06_Research/, 07_Scholar/
├── 20_Wiki/             # Layer 2: 컴파일된 지식 (synthesize 산출물)
│   ├── 01_Sources/, 02_Entities/, 03_Concepts/, 04_Methods/, 05_Comparisons/, 06_Meta/
├── 30_Claude/           # Layer 3: 협업 기록 (자율 검색 가능)
│   ├── 00_Meta/ (index.md, log.md)
│   ├── 01_Sessions/, 02_Learnings/, 03_Retros/, 04_Plans/, 05_Research/, 06_Designs/
└── CLAUDE.md            # 볼트 자체의 운영 규칙
```

QMD가 30_Claude + 20_Wiki를 자동 인덱싱. 검색은 `qmd search`로.

---

## 9 동사 라우팅 (Lazy Loading)

User가 verb를 말하면 해당 `refs/<verb>.md`만 lazy load.

| 동사 | refs/ | alias 슬래시 | 역할 |
|---|---|---|---|
| **ingest** | `refs/ingest.md` | `/wiki-ingest` | 외부 자료 → 10_Raw/ + Gold In 필터 (Soft) |
| **query** | `refs/query.md` | `/wiki-query`, `/qmd-search` | 4-Tier 검색 체인 + score 분기 |
| **save** | `refs/save.md` | `/wiki-save` | 6영역 라우팅 + 위키링크 검증 + qmd update/embed |
| **lint** | `refs/lint.md` | `/wiki-lint` | 구조 검증 (FATAL/MAJOR/MINOR/POLISH 4단계) |
| **manage** | `refs/manage.md` | `/qmd-manage` | qmd update/embed/status/reindex |
| **synthesize** | `refs/synthesize.md` | — | 여러 파일 → 20_Wiki/ 컴파일 (Compiler) |
| **critique** | `refs/critique.md` | — | 의미 검증 (모순/Stale/Gap, Runner) |
| **compare** | `refs/compare.md` | — | 5차원 매트릭스 (Runner) |
| **eli5** | `refs/eli5.md` | `/eli5` | 6섹션 평이 설명 (Runner) |

**Lazy 패턴**: SKILL.md(이 파일)에는 라우팅·원칙만. 동사별 상세 절차는 `refs/<verb>.md` Read 후 적용. 9개를 한 번에 메모리 로드 X.

**Alias 비파괴 정책**: 위 5개 alias 슬래시(`/wiki-ingest`, `/wiki-query`, `/wiki-save`, `/wiki-lint`, `/qmd-search`, `/qmd-manage`, `/eli5`)는 **영구 보존**. 기존 `~/.claude/skills/wiki-{ingest,query,save,lint}/`, `qmd-{search,manage}/` 디렉토리는 손대지 않는다. `eli5`만 Wave 4에서 `wiki/refs/eli5.md`로 통합 (어제 만든 임시 독립).

---

## 4-Tier 검색 체인 (query 호출 시 강제)

`refs/query.md`의 핵심 규약. 외부(Tier 4)는 Tier 1-3 후에만:

```
Tier 1 — 20_Wiki (컴파일 지식, 자동 first)
         ↓ 충분하면 종료
Tier 2 — 30_Claude (협업 기록, 자동)
         ↓ 부족하면
Tier 3 — 10_Raw (원본, 수동만 — "원본"/"raw" 명시 시)
         ↓ 여전히 부족하면
Tier 4 — 외부 (Brave + Firecrawl, 마지막 폴백)
```

**Score 분기**:
- ≥0.9 (High): 전문 Read 후 핵심 인용
- 0.7-0.9 (Med-High): 요약 + "읽어볼까?" 제안
- 0.5-0.7 (Med): 제목만
- <0.5 (Low): silent skip

CLAUDE.md `Knowledge Hierarchy Protocol`과 일치.

---

## Gold In 필터 (ingest 호출 시 — Soft, 5필드)

5개 필수 필드가 누락된 ingest는 **자동 추측 + 사용자 확인** (Strict 거부 X):

1. **수집 이유** — 왜 모았나?
2. **My Take (내 관점)** — Daniel 맥락에서 의의?
3. **한 줄 통찰** — 핵심 한 문장
4. **Gold Out** — 그래서 뭘 얻었나? (수집 이유 비대칭 검증)
5. **Action Intent** — `{action}: {target}` (예: "synthesize: harness-wiki-justification §1")

스펙: `TEMPLATES/gold-in-frontmatter.md` (5필드 정의 + 통과/위반 사례).
자동 검증: `refs/lint.md §13` (모호 단어/짧음/본문 요약 반복 감지).

이유: "왜 수집했는지 + 뭘 얻었는지 + 어디 쓸지 답 못하면 Garbage In" (Karpathy 철학 물리적 강제).

---

## Output Storage Rules (MANDATORY)

각 동사가 만든 산출물의 저장 위치:

| 동사 | 출력 위치 | 형식 |
|---|---|---|
| ingest | `10_Raw/{NN}_{type}/` + 20_Wiki/01-03 자동 생성 | `{date}-{slug}.md` + provenance |
| query | (없음 — 읽기만) | — |
| save | 6영역 라우팅 (CLAUDE.md 표 참조) | `{type}-{date}-{slug}.md` |
| lint | `20_Wiki/06_Meta/` | `lint-{date}.md` |
| manage | (인덱스만) | qmd 로그 |
| **synthesize** | `20_Wiki/07_Syntheses/` | `{slug}.md` + `{slug}.provenance.md` |
| **critique** | `20_Wiki/08_Critiques/` | `critique-{date}-{slug}.md` |
| **compare** | `20_Wiki/04_Comparisons/` | `compare-{date}-{slug}.md` |
| **eli5** | 인라인 기본, 요청 시 `20_Wiki/09_ELI5/eli5-{date}-{slug}.md` |

**중요 원칙 (2026-04-20 사용자 피드백)**: 위키 verb 산출물은 모두 `20_Wiki/` 내부에 저장한다. `30_Claude/`는 Claude와의 협업 프로세스 기록 (session/learn/retro/plan/research/design) 전용. 위키는 지식 콘텐츠, 30_Claude는 협업 메타 기록 — 두 영역은 개념적으로 분리.

**예외 — synthesize 부수 산출물**: synthesize의 plan은 `30_Claude/04_Plans/synthesize-{slug}.md`, draft/research는 `30_Claude/05_Research/`에 남음. 이건 "합성 작업 프로세스" 기록이라 30_Claude가 맞음. 최종 산출만 20_Wiki.

**위키링크 (MANDATORY)**: `[[링크]]` 작성 전 `find ${VAULT_ROOT} -iname "파일명*.md"`로 존재 확인. 없으면 plain text. 스킬 파일은 절대 wikilink 금지.

**저장 후**: `qmd update && qmd embed` 실행 (manage 자동 호출).

---

## Wiki ↔ Feynman 경계

이 스킬은 **볼트 내부 운영** 전용. 외부 학술 입력은 별도 스킬 (`feynman` 래퍼):

| 측면 | wiki | feynman |
|---|---|---|
| 입력원 | 볼트 파일 (10_Raw / 30_Claude / 20_Wiki) | 외부 논문/리서치 (arXiv, 웹) |
| 출력 | 20_Wiki (컴파일) + 30_Claude (Runner 산출) | `10_Raw/07_Scholar/` |
| synthesize 대응 | 볼트 합성 | `feynman literature-review` (외부 논문 합성) |
| critique 대응 | 자기검증 | `feynman peer-review` (학술 비평) |
| compare 대응 | 파일 비교 | `feynman source-comparison` |
| eli5 대응 | 볼트 파일 → 평이 설명 | 외부 논문 → 평이 설명 |

**호출 의존 없음**. 이름이 같은 동사도 별개 커스텀 구현. feynman을 호출하지 않고 wiki는 wiki대로, feynman은 feynman대로 동작.

---

## Operations 라우팅 표

| User says | Verb | refs/ |
|---|---|---|
| "ingest [source]", "이거 수집", "추가" | ingest | `refs/ingest.md` |
| "what do you know about X", "검색", "찾아" | query | `refs/query.md` |
| "save this", "이거 저장", "/save" | save | `refs/save.md` |
| "lint", "헬스체크", "정합성" | lint | `refs/lint.md` |
| "qmd update", "인덱스 갱신" | manage | `refs/manage.md` |
| "X 합성해줘", "총정리" | **synthesize** | `refs/synthesize.md` |
| "일관성 체크", "비판해줘", "모순 찾아" | **critique** | `refs/critique.md` |
| "A vs B", "비교해줘", "어느 게 나아?" | **compare** | `refs/compare.md` |
| "쉽게 설명해줘", "수강생용", "ELI5" | **eli5** | `refs/eli5.md` |
| "scaffold", "vault 만들어" (새 볼트) | SCAFFOLD | this file (아래) |

---

## Hot Cache (자동 유지)

`20_Wiki/06_Meta/hot.md`는 ~500단어 최근 컨텍스트 요약. 다음 시점에 갱신:
- ingest 직후
- 의미 있는 query 교환 직후
- 세션 종료 시점

포맷:
```markdown
---
type: meta
title: "Hot Cache"
updated: YYYY-MM-DDTHH:MM:SS
---

# Recent Context

## Last Updated
YYYY-MM-DD. [무슨 일]

## Key Recent Facts
- [핵심 1]
- [핵심 2]

## Recent Changes
- Created: [[New Page]]
- Updated: [[Existing]] (added section X)
- Flagged: 모순 between [[A]] and [[B]] on Y

## Active Threads
- 현재 리서치: [topic]
- Open question: [pending]
```

500단어 이하 유지. 캐시이지 저널 아님 — 매번 통째 덮어쓰기.

---

## Cross-Project Referencing (다른 프로젝트에서 볼트 참조)

다른 프로젝트의 CLAUDE.md에 추가:

```markdown
## Wiki Knowledge Base
Path: ${VAULT_ROOT}

When you need context not already in this project:
1. Read 20_Wiki/06_Meta/hot.md first (~500 words)
2. If not enough, read 30_Claude/00_Meta/index.md
3. If you need domain specifics, read 20_Wiki/<area>/_index.md
4. Only then read individual pages

Do NOT read the wiki for:
- General coding questions or language syntax
- Things already in this project's files or conversation
- Tasks unrelated to Daniel's domain
```

토큰 절감: hot ~500 / index ~1000 / page 100-300 each.

---

## SCAFFOLD Operation (새 볼트 생성용)

기존 Daniel 볼트는 이미 6영역으로 운영 중 — SCAFFOLD는 **다른 사용자/프로젝트가 새 볼트 만들 때만** 사용.

Steps:
1. 모드 결정: `references/modes.md` 6 옵션 제시
2. 한 문장 질문: "이 볼트의 용도는?"
3. 폴더 구조 생성
4. `_index.md` 서브 인덱스 + `00_Meta/{index,log,hot,overview}.md`
5. `_templates/` 노트 타입별
6. 시각 customization: `references/css-snippets.md` → `.obsidian/snippets/vault-colors.css`
7. 볼트 CLAUDE.md 생성
8. git init: `references/git-setup.md`
9. 사용자 검토: "조정할 점 있어?"

상세 템플릿/모드 옵션은 백업본 `~/.claude/.wiki-backups/wiki-2026-04-20/SKILL.md`의 Vault CLAUDE.md Template 섹션 참조.

---

## Summary

LLM 책임:
1. **9개 동사 lazy routing** — verb 식별 → `refs/<verb>.md` Read → 적용
2. **4-Tier 검색 체인 강제** (query)
3. **Gold In Soft 필터** (ingest)
4. **Output Storage 강제** + 위키링크 검증
5. **Hot Cache 유지** (ingest/query/세션 종료 후)
6. **save 후 manage 자동 호출** (qmd update/embed)
7. **wiki ↔ feynman 경계 준수** (호출 의존 없음, 입력원으로 분기)
8. **alias 7개 비파괴** (기존 슬래시 트리거 제거 금지)

Daniel 책임: 자료 큐레이션, 좋은 질문, 의미 해석. 그 외는 LLM이.

---

## ALTERNATIVES.md & TEMPLATES/

- `ALTERNATIVES.md` (Wave 5에서 작성): 위키 시스템 구축 시 채택 안 한 대안 5개 (GraphRAG / Cognee / Pinecone / connect-ai / Hermes) 비교. **feynman/SKIPPED.md와 다름** — 그것은 외부 인프라 의존 동사 스킵 목록.
- `TEMPLATES/gold-in-frontmatter.md` (Wave 5): Gold In 3필드 스펙 + YAML 예시 + 위반/통과 사례.

---

## 참조 문서

- 설계 문서: `30_Claude/06_Designs/design-2026-04-20-wiki-knowledge-engine.md`
- 실행 플랜: `30_Claude/04_Plans/plan-2026-04-20-wiki-knowledge-engine-transformation.md`
- 백업 (이전 SKILL.md): `~/.claude/.wiki-backups/wiki-2026-04-20/`
- 호환성 검증 스크립트: `~/.claude/scripts/verify-wiki-compatibility.sh --wave=N`
