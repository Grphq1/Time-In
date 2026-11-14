import { normalizeError } from '#shared/errors'

/**
 * Clears a stale session and sends the user to sign in again.
 * Returns false for anything that is not a 401, so callers can keep their flow.
 */
export function useUnauthorizedHandler() {
  const { clear } = useUserSession()

  return async (cause: unknown) => {
    const error = normalizeError(cause)

    if (error.statusCode !== 401) return false

    await clear()
    await navigateTo('/auth?error=session-missing')

    return true
  }
}
