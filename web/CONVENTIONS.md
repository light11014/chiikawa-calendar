# web 컨벤션

`web/`에서 작업할 때 따르는 규칙. lint로 강제되는 항목은 (lint) 표시.

## 폴더 구조

```
src/
├── api/          API 호출 함수와 queryKey. 도메인별 파일 하나 (events.ts)
│   └── client.ts 공통 요청 함수 (apiGet), ApiError
├── hooks/        React Query 훅 등 커스텀 훅 (useEvents.ts)
├── types/        계약 기반 타입 (event.ts)
├── components/   화면 컴포넌트
├── App.tsx
├── main.tsx      QueryClientProvider, 전역 CSS 불러오기
└── index.css     Tailwind와 디자인 토큰
```

## 스타일링

- Tailwind CSS를 쓴다.
- 인라인 `style` 속성은 쓰지 않는다. (lint)
- 디자인 토큰(색, 글꼴)은 `src/index.css`의 `@theme`에서만 정의한다. 컴포넌트에서는 `bg-primary`, `text-muted`처럼 토큰 이름으로 된 클래스를 쓰고, 색 코드를 직접 쓰지 않는다.
- FullCalendar 색은 `src/index.css`에서 `--fc-classic-*` 변수를 토큰에 연결해 맞춘다. 캘린더 내부 DOM에 Tailwind 클래스를 억지로 넣지 않는다.

## 코딩 규칙

- TypeScript만 쓴다. `any`는 쓰지 않는다. (lint) 타입을 모르면 `unknown`으로 받고 좁힌다.
- 서버 데이터 타입은 `types/`에 두고, 계약(`contracts/extracted-event.md`)의 필드 이름을 그대로 쓴다.

### 이름

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 컴포넌트 | PascalCase, 파일명도 같게 | `EventDetail.tsx` |
| 훅 | camelCase, `use` 접두사 | `useEvents.ts` |
| 유틸·API 파일 | camelCase | `events.ts`, `formatDate.ts` |

## API 호출

- API 호출 함수는 `api/`에만 둔다. 컴포넌트에서 `fetch`를 직접 호출하지 않는다.
- 모든 요청은 `api/client.ts`의 공통 함수(`apiGet`)를 거친다. 경로 앞의 `/api`, 쿼리 문자열, 에러 처리(실패하면 `ApiError` throw)를 여기서 맡는다.
- 개발 서버에서는 `/api`가 `localhost:8080`(service)으로 프록시된다.

## React Query

- GET 요청은 `useQuery`로 감싼 훅으로 쓴다. 컴포넌트는 훅만 부른다.
- queryKey는 도메인별 상수로 정의한다. 문자열 배열을 컴포넌트에 직접 쓰지 않는다.

  ```ts
  export const eventKeys = {
    all: ['events'] as const,
    range: (range: EventRange) => [...eventKeys.all, 'range', range] as const,
  }
  ```

- 서버 데이터는 React Query로만 관리하고 별도 상태로 복사하지 않는다.
- 화면 상태(캘린더 ↔ 목록 전환 등)는 `useState`나 URL로 둔다. 전역 상태 라이브러리는 필요해질 때 다시 정한다.
