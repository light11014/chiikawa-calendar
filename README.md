# chiikawa-calendar

치이카와 마켓 온라인 판매 오픈 일정을 X 공지에서 모아 캘린더로 보여주는 서비스.

## 구조

```
X API ──▶ pipeline (Python) ──POST /internal/events──▶ service (Spring) ──▶ PostgreSQL
              │                                              ▲
              └─ SQLite (since_id, raw_posts)          web (React) ◀── 사용자
```

| 폴더 | 담당 | 내용 |
| --- | --- | --- |
| `pipeline/` | A | X 수집, 1차 필터, LLM 추출. supercronic으로 하루 2회 실행 |
| `service/` | B | 내부 수집 API, 중복 제거, 조회 API. React 빌드 결과 서빙 |
| `web/` | B | 캘린더 화면 (React + FullCalendar) |
| `contracts/` | A·B | pipeline ↔ service 계약. 변경 시 둘 다 리뷰 |
| `deploy/` | B | Caddy 설정 (HTTPS, `/internal` 차단) |

계약: [contracts/extracted-event.md](contracts/extracted-event.md)

## 로컬 실행

```bash
cp .env.example .env    # 값 채우기
docker compose up -d    # 지금은 postgres만
```

## 규칙

- `main` 직접 push 금지. PR + 상대방 승인 1명.
- 이슈 제목: `[영역] 할 일`. 영역은 pipeline / service / web / contract / infra
- 브랜치: `{유형}/{이슈번호}-{짧은설명}`. 예: `feat/12-x-since-id`
- PR 본문에 `Closes #이슈번호`
- 추출 버그 이슈에는 원본 트윗 링크를 꼭 넣는다.
- `.env`, X 응답 덤프(`pipeline/data/`)는 커밋하지 않는다.
- 계약 문서가 바뀌면 같은 PR에서 변경 이력도 적는다.

## 배포

AWS EC2 한 대 + docker-compose + Caddy. 외부에는 80/443만 연다.
