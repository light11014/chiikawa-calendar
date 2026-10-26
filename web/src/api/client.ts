// 모든 API 요청은 이 파일의 함수를 거친다. 컴포넌트에서 fetch를 직접 호출하지 않는다.

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type QueryParams = Record<string, string | number | undefined>

function buildUrl(path: string, params?: QueryParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `/api${path}?${query}` : `/api${path}`
}

export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} 실패 (${response.status})`)
  }
  return (await response.json()) as T
}
