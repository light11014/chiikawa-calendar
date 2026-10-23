# ExtractedEvent 계약 (v1)

파이프라인(A, Python)이 트윗에서 추출한 일정을 서비스(B, Spring)로 보낼 때 쓰는 형식.
이 문서가 기준이다. 바뀌면 A·B 둘 다 리뷰 후 머지한다.

## 범위

### v1
- 소스: X @chiikawa_market 계정 1개
- 대상: 치이카와 마켓 온라인의 테마 단위 판매 오픈
- 일정 단위는 "테마 오픈"이다. 개별 상품은 다루지 않는다.

### 확장 예정
| 버전 | 추가 내용 |
| --- | --- |
| v1.1 | 계정 추가 (치이카와 포켓, 모구모구, 파크). 계약 변경 없음 |
| v2 | 오프라인 일정 (팝업, 치이카와랜드). location, POPUP, EVENT 사용 시작 |
| v3 | 외부 사이트 콜라보. 공식 계정의 리트윗·인용 원본 활용 |

v1에서 쓰지 않는 enum 값과 필드도 미리 정의해 둔다. 확장할 때 계약을 바꾸지 않기 위함.

## 필드

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| externalId | string | O | `x:{트윗ID}#{순번}`. 같은 값이 다시 오면 덮어쓰기 |
| title | string | O | 테마 이름 일본어 원문. 예: `ANA × ちいかわ`. 장식 기호 제거 |
| titleKo | string | O | 테마 이름 한국어. 같은 LLM 호출에서 함께 추출 |
| partner | string |  | 콜라보 상대. 예: `ANA`. 콜라보가 아니면 null |
| type | enum | O | v1: SALE_OPEN. 향후: POPUP, EVENT |
| saleMethod | enum | O | NORMAL / PREORDER / LOTTERY / UNKNOWN |
| startDate | date | O | `YYYY-MM-DD`. 일본 현지 날짜, 시간대 없음 |
| startTime | string |  | `HH:mm`. 오픈 시각. datePrecision이 EXACT일 때만 |
| endDate | date |  | 판매 기간이 정해져 있을 때만. LOTTERY면 응모 마감일 |
| datePrecision | enum | O | 아래 datePrecision 참고 |
| rolling | boolean | O | `順次`(순차) 표기 여부 |
| location | string |  | 오프라인 장소 원문. v1은 항상 null |
| purchaseLinks | object[] | O | 판매 페이지. 없으면 빈 배열 |
| description | string |  | 한 줄 요약. 없어도 됨 |
| sourceType | enum | O | 일정을 가져온 곳. v1: X. 향후: WEB |
| sourceAccount | string | O | 예: `@chiikawa_market` |
| sourceUrl | string | O | 원본 트윗 URL |
| postedAt | datetime | O | 트윗 작성 시각, ISO 8601 UTC |
| imageUrls | string[] | O | 원본 트윗 이미지 URL. 없으면 빈 배열 |
| needsReview | boolean | O | 사람이 확인해야 하는 건. reviewReasons가 하나라도 있으면 true |
| reviewReasons | string[] | O | 확인이 필요한 이유. 없으면 빈 배열 |

### purchaseLinks 항목

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| label | string | O | 사이트 이름. 예: `ちいかわマーケット` |
| url | string | O | 트윗의 실제 링크 (expanded_url) |

## enum

### type

| 값 | 의미 | 사용 시작 |
| --- | --- | --- |
| SALE_OPEN | 테마 판매(주문) 오픈. 일반·예약·추첨 모두 포함 | v1 |
| POPUP | 팝업스토어 | v2 (향후) |
| EVENT | 그 외 행사·전시 | v2 (향후) |

콜라보는 type이 아니라 partner로 표현한다.

### saleMethod

| 값 | 원문 예시 | 의미 |
| --- | --- | --- |
| NORMAL | 販売開始, 発売 | 일반 판매 |
| PREORDER | 予約受付, 受注生産 | 예약·주문 생산. 지금 주문하고 나중에 발송 |
| LOTTERY | 抽選, 応募受付 | 추첨. 응모 후 당첨되면 구매 |
| UNKNOWN | - | 공지에서 판단 불가 |

### datePrecision

| 값 | 원문 예시 | startDate 대표값 |
| --- | --- | --- |
| EXACT | `11月1日` | 그 날짜 |
| EARLY_MONTH | `11月上旬` | 1일 |
| MID_MONTH | `11月中旬` | 11일 |
| LATE_MONTH | `11月下旬` | 21일 |
| MONTH | `11月発売` | 1일 |

### reviewReasons

| 값 | 의미 |
| --- | --- |
| YEAR_INFERRED | 연도를 추정함 |
| NO_START_TIME | 오픈 시간을 못 찾음 |
| UNCLEAR_THEME | 테마 이름이 명확하지 않음 |
| DATE_FROM_IMAGE | 날짜를 이미지에서만 읽음 |

## 추출 규칙 (A)

### 일정 나누기
- 테마 하나, 판매 오픈 하나당 일정 하나.
- 발송일(発送)은 일정으로 만들지 않는다.
- 트윗에 상품이 여러 개 나와도 같은 테마면 일정 하나로 묶는다.
- 순번(`#0`, `#1`)은 트윗 안 등장 순서로 고정. 재추출해도 같은 일정은 같은 순번.
- 날짜를 못 찾으면 보내지 않는다. raw_posts에만 남긴다.
- v1에서는 SALE_OPEN 외의 type은 보내지 않는다.

### 테마 이름
- 공지에 나온 시리즈·테마 이름을 그대로 쓴다. 개별 상품명을 쓰지 않는다.
- 콜라보면 `{상대} × ちいかわ` 형태로 쓰고 partner에 상대 이름을 넣는다.
- 테마 이름이 따로 없으면 공지의 핵심 문구로 짧게 쓰고 reviewReasons에 UNCLEAR_THEME.

### 한국어 제목 (titleKo)
- 테마 이름을 한국어로 옮긴다. 같은 LLM 호출에서 title과 함께 뽑는다.
- `ちいかわ`는 항상 "치이카와"로 쓴다.
- 콜라보 상대 이름은 한국에서 쓰는 표기를 따른다. 예: ANA는 그대로 ANA
- 고유명사가 아닌 단어(シリーズ, 冬, おでかけ 등)는 한국어로 옮긴다.

| title | titleKo |
| --- | --- |
| ANA × ちいかわ | ANA × 치이카와 |
| ちいかわ ハロウィンシリーズ | 치이카와 할로윈 시리즈 |
| ちいかわ 冬のおでかけ | 치이카와 겨울 나들이 |

### 날짜·시간
- 연도가 없으면 postedAt 기준으로 추정. 추정한 월이 작성 월보다 앞이면 다음 해로 보고 YEAR_INFERRED.
- startTime은 일본 시간 그대로. 한국과 시간대가 같아 변환하지 않는다.
- startTime을 못 찾으면 NO_START_TIME.

### 구매 사이트
- purchaseLinks의 url은 트윗 entities의 expanded_url에서만 가져온다. LLM이 URL을 새로 만들지 않는다.
- LLM에는 트윗 본문, expanded_url 목록을 넘기고 해당 URL을 목록에서 고르게 한다.

### 이미지 사용
- 본문만으로 먼저 추출한다.
- 날짜나 오픈 시간을 본문에서 못 찾았을 때만 이미지를 함께 넘겨 다시 추출한다.
- 날짜를 이미지에서만 읽었으면 DATE_FROM_IMAGE.

### 기타
- 값이 없으면 필드를 빼지 말고 null로 보낸다. 배열은 빈 배열.

## 검증 규칙 (B)

- endDate가 있으면 endDate >= startDate.
- datePrecision이 EXACT가 아니면 startTime은 null.
- purchaseLinks의 url은 http(s)로 시작해야 한다.
- needsReview는 reviewReasons가 비어 있지 않을 때만 true.
- 위반한 건은 REJECTED로 응답하고 저장하지 않는다.
- 향후 사용할 enum 값(POPUP, EVENT, WEB)도 저장은 허용한다. 화면 노출은 버전별로 결정.

## API

### 요청

```
POST /internal/events
X-Internal-Api-Key: {키}
Content-Type: application/json

{ "events": [ ExtractedEvent, ... ] }   // 한 번에 최대 50건
```

### 응답

```json
{
  "results": [
    { "externalId": "x:1846300000000000000#0", "status": "CREATED", "eventId": 12 },
    { "externalId": "x:1846300000000000001#0", "status": "MERGED", "eventId": 12 },
    { "externalId": "x:1846300000000000002#0", "status": "REJECTED", "error": "endDate < startDate" }
  ]
}
```

| status | 의미 |
| --- | --- |
| CREATED | 새 일정으로 저장 |
| UPDATED | 같은 externalId가 있어 덮어씀 |
| MERGED | 다른 일정과 같은 일정으로 판단해 합침 |
| REJECTED | 검증 실패, 저장 안 함 |

### 에러 처리

| 응답 | A의 동작 |
| --- | --- |
| 200 | results 확인. REJECTED는 로그만 남기고 재시도 안 함 |
| 400 / 401 | 요청 자체가 잘못됨. 재시도 안 함 |
| 5xx / 연결 실패 | 다음 실행 때 재시도 (raw_posts.extracted_at을 비워둠) |

## 예시

구조 예시용. 날짜·URL·ID는 자리표시.

```json
{
  "externalId": "x:1846300000000000000#0",
  "title": "ANA × ちいかわ",
  "titleKo": "ANA × 치이카와",
  "partner": "ANA",
  "type": "SALE_OPEN",
  "saleMethod": "PREORDER",
  "startDate": "2026-11-10",
  "startTime": "11:00",
  "endDate": null,
  "datePrecision": "EXACT",
  "rolling": false,
  "location": null,
  "purchaseLinks": [
    { "label": "ちいかわマーケット", "url": "https://chiikawamarket.jp/..." }
  ],
  "description": null,
  "sourceType": "X",
  "sourceAccount": "@chiikawa_market",
  "sourceUrl": "https://x.com/chiikawa_market/status/1846300000000000000",
  "postedAt": "2026-11-03T03:00:00Z",
  "imageUrls": ["https://pbs.twimg.com/media/xxxx.jpg"],
  "needsReview": false,
  "reviewReasons": []
}
```

## 화면 표시 원칙 (B)

- 일정 카드에는 테마 이름(titleKo), 오픈 일시, 구매 링크만 크게 보여준다.
- saleMethod가 PREORDER / LOTTERY면 "예약" / "추첨" 뱃지.
- 원본 트윗 링크(sourceUrl)는 항상 표시한다.
- partner가 있으면 콜라보 표시.
- rolling = true면 "순차" 표시.
- datePrecision이 EXACT가 아니면 "11월 하순"처럼 원래 표현으로 보여준다.
- v1 화면은 SALE_OPEN만 노출한다.

## 결정 사항

- [x] titleKo 포함 → 필수 필드. 같은 LLM 호출에서 추출
- [x] titleKo 표기 → `ちいかわ`만 "치이카와"로 고정, 나머지는 번역
- [x] v1 범위 → @chiikawa_market 1개, 온라인 테마 오픈만
- [x] 일정 단위 → 상품이 아니라 테마 오픈
- [x] 콜라보 표현 → type이 아니라 partner 필드
- [x] type → SALE_OPEN 하나. 예약·추첨 구분은 saleMethod
- [x] confidence → 제외. needsReview + reviewReasons로 대체
- [x] productKey → 불필요. 테마 이름 유사도(pg_trgm)로 중복 제거
- [ ] 재판매(再販) 처리 → SALE_OPEN + restock 플래그로 할지, 실제 트윗 비중 보고 결정
- [ ] needsReview 일정 화면 표시 방식 → 숨김 / "확인 필요" 뱃지

## 변경 이력

- 2026-10-23: 최초 작성. type을 SALE_OPEN 하나로 통합, saleMethod·reviewReasons 추가, confidence 제거
