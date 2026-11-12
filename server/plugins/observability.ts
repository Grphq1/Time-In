import * as Sentry from '@sentry/nuxt'
import { getHeader, getResponseStatus, setResponseHeader } from 'h3'

// Static/dev-internal requests are not useful access-log entries.
const isAssetRequest = (path: string) =>
  path.startsWith('/_nuxt')
  || path.startsWith('/__nuxt')
  || path.startsWith('/_ipx')
  || path === '/favicon.svg'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const requestId = getHeader(event, 'x-request-id') || crypto.randomUUID()

    event.context.requestId = requestId
    event.context.requestStart = Date.now()
    setResponseHeader(event, 'x-request-id', requestId)
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    if (isAssetRequest(event.path)) return

    const started = event.context.requestStart

    serverLogger(event).info('request completed', {
      status: getResponseStatus(event),
      durationMs: started ? Date.now() - started : undefined,
    })
  })

  nitroApp.hooks.hook('error', async (error, { event }) => {
    const requestId = event?.context.requestId

    if (requestId) {
      const target = error as { data?: Record<string, unknown> }
      target.data = { ...(target.data ?? {}), requestId }
    }

    const statusCode = (error as { statusCode?: number, status?: number }).statusCode
      ?? (error as { status?: number }).status

    // Expected 4xx responses are handled by the API layer; only report 5xx.
    if (statusCode && statusCode < 500) return

    const user = event
      ? await getUserSession(event).then(session => session.user).catch(() => null)
      : null

    Sentry.withScope((scope) => {
      if (user) {
        scope.setUser({
          id: user.id,
          email: user.email,
          username: user.name,
        })
      }

      scope.setTransactionName(`${event?.method ?? 'UNKNOWN'} ${event?.path ?? 'unknown'}`)
      scope.setTag('requestId', requestId ?? 'unknown')
      scope.setContext('request', {
        method: event?.method,
        path: event?.path,
        requestId,
        statusCode,
      })

      Sentry.captureException(error)
    })

    await Sentry.flush(2000)

    serverLogger(event).error('Unhandled server error', { error, userId: user?.id })
  })
})
