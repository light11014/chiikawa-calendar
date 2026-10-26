// 계약(contracts/extracted-event.md)의 필드를 그대로 옮긴 타입.
// 조회 API 응답 DTO는 #8에서 확정되면 이 파일을 맞춘다.

export type EventType = 'SALE_OPEN' | 'POPUP' | 'EVENT'

export type SaleMethod = 'NORMAL' | 'PREORDER' | 'LOTTERY' | 'UNKNOWN'

export type DatePrecision =
  | 'EXACT'
  | 'EARLY_MONTH'
  | 'MID_MONTH'
  | 'LATE_MONTH'
  | 'MONTH'

export type ReviewReason =
  | 'YEAR_INFERRED'
  | 'NO_START_TIME'
  | 'UNCLEAR_THEME'
  | 'DATE_FROM_IMAGE'

export interface PurchaseLink {
  label: string
  url: string
}

export interface CalendarEvent {
  id: number
  title: string
  titleKo: string
  partner: string | null
  type: EventType
  saleMethod: SaleMethod
  /** YYYY-MM-DD, 일본 현지 날짜 */
  startDate: string
  /** HH:mm. datePrecision이 EXACT일 때만 */
  startTime: string | null
  endDate: string | null
  datePrecision: DatePrecision
  rolling: boolean
  purchaseLinks: PurchaseLink[]
  description: string | null
  sourceUrl: string
  imageUrls: string[]
  needsReview: boolean
  reviewReasons: ReviewReason[]
}
