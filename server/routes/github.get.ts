import { runEffect } from '#server/shared/runtime/http'
import { handleOAuthLogin } from '#server/features/auth/application/handle-oauth-login'

export default defineOAuthGitHubEventHandler({
  config: { emailRequired: true },
  async onSuccess(event, { user }) {
    const session = await getUserSession(event)
    const currentUserId = session.id

    let domainUser

    try {
      domainUser = await runEffect(
        handleOAuthLogin({
          profile: {
            provider: 'github',
            providerAccountId: String(user.id),
            name: user.name ?? user.login ?? '',
            email: user.email ?? '',
            avatarUrl: user.avatar_url ?? null,
          },
          currentUserId,
        }),
        event.context.effectRuntime,
      )
    }
    catch (error) {
      const code = (error as { data?: { code?: string } }).data?.code ?? 'auth-failed'
      return sendRedirect(event, `/login?error=${code}`)
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
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github')
  },
})
