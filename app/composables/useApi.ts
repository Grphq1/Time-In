import type { FetchOptions } from 'ofetch'
import type { AppFetcher } from '#shared/api'
import { fetchJson } from '#shared/api'

/**
 * SSR-safe API client. On the server it forwards the incoming request context
 * (cookies/headers); on the client it behaves like `$fetch`.
 */
export function useApi() {
  const fetcher = useRequestFetch()
  const handleUnauthorized = useUnauthorizedHandler()

  return async <T>(url: string, options: FetchOptions<'json'> = {}) => {
    try {
      return await fetchJson<T>(fetcher as unknown as AppFetcher, url, options)
    }
    catch (cause) {
      await handleUnauthorized(cause)
      throw cause
    }
  }
}
