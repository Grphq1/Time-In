import { completeOAuthLogin } from '#server/features/auth/infrastructure/oauth-callback'
import { withOAuthErrorRedirect } from '#server/features/auth/infrastructure/oauth-route'
import { logError } from '#server/shared/runtime/log'

export default withOAuthErrorRedirect('github', defineOAuthGitHubEventHandler({
  config: { emailRequired: true },
  async onSuccess(event, { user }) {
    return completeOAuthLogin(event, {
      provider: 'github',
      providerAccountId: String(user.id),
      name: user.name ?? user.login ?? '',
      email: user.email ?? '',
      avatarUrl: user.avatar_url ?? null,
    })
  },
  async onError(event, error) {
    await logError('GitHub OAuth error', error)
    return sendRedirect(event, '/auth?error=github')
  },
}))
