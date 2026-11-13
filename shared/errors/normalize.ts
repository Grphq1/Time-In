import type { AppErrorKind } from './types'
import { AppError, isAppError } from './types'

type ErrorLike = {
  code?: string
  data?: {
    code?: string
    message?: string
    requestId?: string
    statusMessage?: string
  }
  message?: string
  response?: {
    headers?: { get?: (name: string) => string | null }
    status?: number
  }
  status?: number
  statusCode?: number
  statusMessage?: string
}

const NETWORK_MESSAGE = /fetch failed|failed to fetch|networkerror|network request failed|load failed/i

function kindFromStatus(statusCode: number): AppErrorKind {
  if (statusCode === 401 || statusCode === 403) return 'auth'
  if (statusCode === 404) return 'not-found'
  if (statusCode === 400 || statusCode === 422) return 'validation'
  return 'api'
}

function isNetworkFailure(cause: unknown) {
  // Message-based: a bare `TypeError` is usually a code bug, not a failed fetch.
  return cause instanceof Error && NETWORK_MESSAGE.test(cause.message)
}

function dataMessage(error: ErrorLike) {
  const message = error.data?.message

  if (typeof message !== 'string') return undefined
  // Zod validation errors carry an issues array; never expose that to users.
  if (Array.isArray((error.data as { issues?: unknown })?.issues)) return undefined

  return message
}

/**
 * Converts anything caught by the app (FetchError, h3 error, native Error,
 * string) into one predictable error type with a safe user-facing message.
 */
export function normalizeError(cause: unknown): AppError {
  if (isAppError(cause)) return cause

  const error = (cause ?? {}) as ErrorLike
  const statusCode = error.statusCode ?? error.status ?? error.response?.status
  const kind: AppErrorKind = statusCode
    ? kindFromStatus(statusCode)
    : isNetworkFailure(cause)
      ? 'network'
      : 'unexpected'

  return new AppError({
    cause,
    kind,
    statusCode,
    code: error.data?.code ?? error.code,
    message:
      error.data?.statusMessage
      ?? dataMessage(error)
      ?? error.statusMessage,
    requestId:
      error.data?.requestId
      ?? error.response?.headers?.get?.('x-request-id')
      ?? undefined,
  })
}
