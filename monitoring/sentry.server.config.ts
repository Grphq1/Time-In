import * as Sentry from '@sentry/nuxt'

const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN ?? ''

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NUXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  release: process.env.NUXT_PUBLIC_SENTRY_RELEASE || process.env.SENTRY_RELEASE || undefined,
  tracesSampleRate: Number(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) || 0,
  // server/plugins/observability.ts captures with user and request context.
  enableNitroErrorHandler: false,
})
