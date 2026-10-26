import { useQuery } from '@tanstack/react-query'
import { eventKeys, getEvents, type EventRange } from '../api/events'

export function useEvents(range: EventRange) {
  return useQuery({
    queryKey: eventKeys.range(range),
    queryFn: () => getEvents(range),
  })
}
