import type { CalendarEvent } from '../types/event'
import { apiGet } from './client'

export interface EventRange {
  /** YYYY-MM-DD, 포함 */
  from: string
  /** YYYY-MM-DD, 포함 */
  to: string
}

export const eventKeys = {
  all: ['events'] as const,
  range: (range: EventRange) => [...eventKeys.all, 'range', range] as const,
}

export function getEvents(range: EventRange): Promise<CalendarEvent[]> {
  return apiGet<CalendarEvent[]>('/events', { from: range.from, to: range.to })
}
