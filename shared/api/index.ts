import type { FetchOptions } from 'ofetch'
import { normalizeError } from '#shared/errors'

export type AppFetcher = <T>(url: string, options?: FetchOptions<'json'>) => Promise<T>

/**
 * Interceptor-style wrapper for Nuxt's `$fetch`/`useRequestFetch`.
 * Every failure leaves the app as an `AppError`, so callers and UI states
 * never have to know whether it was a FetchError, h3 error or native Error.
 */
export async function fetchJson<T>(
  fetcher: AppFetcher,
  url: string,
  options: FetchOptions<'json'> = {},
): Promise<T> {
  try {
    return await fetcher<T>(url, options)
  }
  catch (cause) {
    throw normalizeError(cause)
  }
}
