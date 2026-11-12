import * as Sentry from '@sentry/nuxt'

const { public: { sentry } } = useRuntimeConfig()

Sentry.init({
  dsn: sentry.dsn,
  enabled: Boolean(sentry.dsn),
  environment: sentry.environment,
  release: sentry.release || undefined,
  tracesSampleRate: Number(sentry.tracesSampleRate) || 0,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
})
