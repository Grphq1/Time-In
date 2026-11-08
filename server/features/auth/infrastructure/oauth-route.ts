import type { EventHandler } from 'h3'
import { sendRedirect } from 'h3'
import { logError } from '#server/shared/runtime/log'
import type { Provider } from '../domain/account'

// nuxt-auth-utils only calls onError for token/user error responses; network
// failures (blocked DNS, timeouts) throw before that, so forward them too.
// shortcut: any thrown error becomes the provider's generic error page.
export const withOAuthErrorRedirect = (provider: Provider, handler: EventHandler): EventHandler =>
  async (event) => {
    try {
      return await handler(event)
    }
    catch (error) {
      await logError(`[OAuth] ${provider} route failed`, error)
      return sendRedirect(event, `/auth?error=${provider}`)
    }
  }
