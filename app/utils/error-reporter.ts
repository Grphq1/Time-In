import * as Sentry from '@sentry/nuxt'
import type { AppError } from '#shared/errors'
import { normalizeError } from '#shared/errors'
import { logger } from '~/utils/logger'

export interface ErrorReportOptions {
  /** Override the default capture policy (unexpected errors and 5xx only). */
  capture?: boolean
  extra?: Record<string, unknown>
  source?: string
  tags?: Record<string, string>
}

function shouldCapture(error: AppError) {
  return error.kind === 'unexpected' || (error.statusCode ?? 0) >= 500
}

/**
 * Single entry point for client-side error reporting. Callers give us any
 * thrown value; we normalize it, log a safe message and send context to Sentry.
 */
export function reportError(cause: unknown, options: ErrorReportOptions = {}): AppError {
  const error = normalizeError(cause)
  const capture = options.capture ?? shouldCapture(error)

  logger.error(error.message, {
    code: error.code,
    kind: error.kind,
    requestId: error.requestId,
    source: options.source,
    statusCode: error.statusCode,
  })

  if (capture) {
    Sentry.addBreadcrumb({
      category: 'app.error',
      level: 'error',
      message: error.message,
      data: {
        code: error.code,
        kind: error.kind,
        statusCode: error.statusCode,
      },
    })

    Sentry.captureException(error, {
      tags: {
        ...options.tags,
        errorCode: error.code ?? 'none',
        errorKind: error.kind,
      },
      extra: {
        ...options.extra,
        requestId: error.requestId,
        source: options.source,
        statusCode: error.statusCode,
      },
    })
  }

  return error
}
