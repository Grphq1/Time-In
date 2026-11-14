import { reportError } from '~/utils/error-reporter'

/**
 * Declarative counterpart to `useApi`: `useFetch` preconfigured for our API.
 * Client-only and lazy, and every failure is reported and clears a stale
 * session on 401, so read composables don't repeat that policy.
 */
export const useApiFetch = createUseFetch(() => {
  // Captured here so it runs in setup context, not inside the response callback.
  const handleUnauthorized = useUnauthorizedHandler()

  return {
    onResponseError({ response }) {
      reportError(response)
      void handleUnauthorized(response)
    },
  }
})
