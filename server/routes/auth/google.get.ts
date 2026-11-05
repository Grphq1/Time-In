import type { User } from '#server/features/auth/domain/user'
import { runEffect } from '#server/shared/runtime/http'
import { handleOAuthLogin } from '~~/server/features/auth/application/handle-oauth-login'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user }) {
    const session = await getUserSession(event)
    const currentUserId = session.user?.id ?? null

    let domainUser: User

    try {
      domainUser = await runEffect(
        handleOAuthLogin({
          profile: {
            provider: 'google',
            providerAccountId: String(user.sub),
            name: user.name ?? '',
            email: user.email ?? '',
            avatarUrl: user.picture ?? null,
          },
          currentUserId,
        }),
        event.context.effectRuntime,
      )
    }
    catch (error) {
      const code = (error as { data?: { code?: string } }).data?.code ?? 'auth-failed'
      return sendRedirect(event, `/auth?error=${code}`)
    }

    await setUserSession(event, {
      user: {
        id: domainUser.id,
        name: domainUser.name,
        email: domainUser.email,
        avatarUrl: domainUser.avatarUrl,
      },
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth?error=google')
  },
})
