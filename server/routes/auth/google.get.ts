import { completeOAuthLogin } from '#server/features/auth/infrastructure/oauth-callback'
import { withOAuthErrorRedirect } from '#server/features/auth/infrastructure/oauth-route'
import { logError } from '#server/shared/runtime/log'

export default withOAuthErrorRedirect('google', defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user }) {
    return completeOAuthLogin(event, {
      provider: 'google',
      providerAccountId: String(user.sub),
      name: user.name ?? '',
      email: user.email ?? '',
      avatarUrl: user.picture ?? null,
    })
  },
  async onError(event, error) {
    await logError('Google OAuth error', error)
    return sendRedirect(event, '/auth?error=google')
  },
}))
