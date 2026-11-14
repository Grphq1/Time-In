import * as Sentry from '@sentry/nuxt'
import { reportError } from '~/utils/error-reporter'

/**
 * Last line of defense on the client. Sentry's global handlers and the Nuxt
 * module already capture these; we only add app context and keep one place for
 * future user feedback. Fatal render errors still land on `error.vue`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { user } = useUserSession()

  watch(user, (value) => {
    Sentry.setUser(value
      ? {
          id: value.id,
          email: value.email,
          username: value.name,
        }
      : null)
  }, { immediate: true })

  nuxtApp.hook('vue:error', (cause, _instance, info) => {
    reportError(cause, {
      capture: false,
      extra: { info },
      source: 'vue:error',
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, {
      capture: false,
      source: 'unhandledrejection',
    })
  })

  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, {
      capture: false,
      source: 'window:error',
    })
  })
})
