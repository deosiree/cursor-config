---
name: manage
description: QMD 인덱스 관리 — update / embed / status / reindex / cleanup. save·ingest 후 자동 호출.
parent_skill: wiki
absorbed_from: ~/.claude/skills/qmd-manage/ (alias /qmd-manage 영구 보존)
---

# wiki manage — QMD 인덱스 관리

> QMD 인덱스 위치: `~/.cache/qmd/index.sqlite`
> OpenClaw symlink: `~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite` → `~/.cache/qmd/index.sqlite`

---

## 0. Wikilink Safety (N/A)

**manage는 wikilink 작성 안 함** — 인덱스 관리 전용 동사. 산출물도 기계 인덱스(.sqlite)이지 markdown 페이지 아니므로 wikilink 검증 대상 X.

다른 동사가 호출하는 의존 ref이므로 일관성 위해 명시.

---

## 1. 자동 호출 조건

다음 시점에 **자동 발동** (사용자 명시 없이도):

| 조건 | 동작 |
|---|---|
| `wiki ingest` 단일 완료 후 | `qmd update && qmd embed` |
| `wiki ingest` 배치 완료 후 (1회만) | `qmd update && qmd embed` |
| `wiki save` 완료 후 | `qmd update && qmd embed` |
| `wiki synthesize` 완료 후 (Wave 2) | `qmd update && qmd embed` |
| `wiki critique/compare/eli5` 파일 저장 후 | `qmd update && qmd embed` |
| 사용자 "qmd update" / "인덱스 갱신" 명시 | `qmd update` |
| 사용자 "임베딩 돌려" 명시 | `qmd embed` |

**Cron 자동 실행**:
- `qmd update`: 매 5분
- `qmd embed`: 매 30분

자동 cron 있어도 즉시성 필요한 경우 (방금 저장한 페이지를 다음 query에서 찾아야) 수동 호출.

---

## 2. Status check

```bash
qmd status
```

핵심 필드:
- **Total**: 인덱스된 파일 수
- **Vectors**: 임베딩 완료 수
- **Pending**: 임베딩 대기 수 (0이 정상)
- **Collections**: `obsidian` → 볼트 경로 매핑 확인

---

## 3. Update Index (새 파일 감지)

```bash
qmd update
```

볼트 새 파일/수정 파일 스캔 → 인덱스 추가.
빠름 (파일 메타데이터만). LLM 호출 X.

---

## 4. Embed Vectors (벡터 임베딩)

```bash
# 기본 (pending만)
qmd embed

# 강제 전체 재임베딩
qmd embed -f

# 백그라운드 (대량 처리 시)
nohup qmd embed > /tmp/qmd-embed.log 2>&1 &
```

CPU-only, heavy operation. 대량 처리 시 background 권장.
시맨틱 검색(`qmd query`) 정확도 결정.

---

## 5. Reindex from Scratch (드물게)

볼트 구조 변경 / 인덱스 손상 시:

```bash
qmd collection remove obsidian
qmd collection add obsidian "${VAULT_ROOT}" --pattern "**/*.md"
qmd update
qmd embed
```

전체 재구축이라 시간 소요. 평소엔 update + embed로 충분.

---

## 6. Cleanup

```bash
qmd cleanup
```

캐시 정리 + DB vacuum. 주 1회 권장.

---

## 7. Symlink 무결성 검증

OpenClaw가 같은 인덱스 사용:

```bash
ls -la ~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite
# 정상: ~/.cache/qmd/index.sqlite 가리킴
```

깨졌으면 복구:
```bash
rm ~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite
ln -s ~/.cache/qmd/index.sqlite ~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite
```

---

## 8. Cron Status

```bash
crontab -l
# 기대 출력:
# */5 * * * * qmd update
# */30 * * * * qmd embed
```

cron 누락 시 등록.

---

## 9. Architecture

```
~/.cache/qmd/index.sqlite (원본)
    ↑ symlink
~/.openclaw/agents/main/qmd/.../index.sqlite
    ↑
    ├── CLI: qmd search/query (Claude Code)
    └── OpenClaw: memory_search (텔레그램)
```

**One index, two consumers**. 한 번 update하면 양쪽 다 혜택.

---

## 10. 트러블슈팅

| 증상 | 원인 후보 | 수정 |
|---|---|---|
| `qmd: command not found` | PATH 누락 | `which qmd` 확인 후 PATH 추가 |
| `Pending: N` 줄지 않음 | embed 안 돔 | `qmd embed` 수동 실행 |
| 새 페이지 search 결과 없음 | update 안 됨 | `qmd update && qmd embed` |
| OpenClaw memory_search 빈 결과 | symlink 깨짐 | §7 복구 |
| Vectors 0 | 모델 미설치 | `qmd embed` 첫 실행 시 모델 자동 다운로드 |

---

## Output

- **저장 X** (인덱스 관리 작업)
- **부수 효과**: `~/.cache/qmd/index.sqlite` 갱신
- **자동 호출 패턴**: ingest/save/synthesize/critique/compare/eli5 완료 후

기존 alias `/qmd-manage` 동일 동작 — 영구 보존.
