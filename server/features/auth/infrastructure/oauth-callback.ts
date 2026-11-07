import type { H3Event } from 'h3'
import { sendRedirect } from 'h3'
import { logError } from '#server/shared/runtime/log'
import { runEffect } from '#server/shared/runtime/http'
import { handleOAuthLogin } from '../application/handle-oauth-login'
import { mapAuthError } from '../application/http-errors'
import { toSessionUser } from '../application/session-user'
import type { Provider } from '../domain/account'
import type { User } from '../domain/user'

interface OAuthProfile {
  provider: Provider
  providerAccountId: string
  name: string
  email: string
  avatarUrl: string | null
}

interface OAuthCallbackDeps {
  getCurrentUserId: () => Promise<string | null>
  saveSession: (user: User) => Promise<void>
}

export async function completeOAuthLogin(
  event: H3Event,
  profile: OAuthProfile,
  deps: Partial<OAuthCallbackDeps> = {},
) {
  const getCurrentUserId = deps.getCurrentUserId ?? (async () => {
    const session = await getUserSession(event)
    return session.user?.id ?? null
  })

  const saveSession = deps.saveSession ?? (async (user: User) => {
    await setUserSession(event, { user: toSessionUser(user) })
  })

  try {
    const user = await runEffect(
      handleOAuthLogin({
        profile,
        currentUserId: await getCurrentUserId(),
      }),
      event.context.effectRuntime,
      mapAuthError,
    )

    try {
      await saveSession(user)
    }
    catch (cause) {
      await logError('[OAuth] Failed to save session', cause)
      return sendRedirect(event, '/auth?error=session-failed')
    }

    return sendRedirect(event, '/')
  }
  catch (error) {
    const code = (error as { data?: { code?: string } }).data?.code

    if (!code) {
      await logError('[OAuth] Unexpected callback failure', error)
    }

    return sendRedirect(event, `/auth?error=${code ?? 'auth-failed'}`)
  }
}
