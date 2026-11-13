export type AppErrorKind
  = | 'auth'
    | 'network'
    | 'not-found'
    | 'unexpected'
    | 'validation'
    | 'api'

export interface AppErrorOptions {
  cause?: unknown
  code?: string
  kind?: AppErrorKind
  message?: string
  requestId?: string
  statusCode?: number
}

export const USER_MESSAGES: Record<AppErrorKind, string> = {
  'auth': 'Your session has expired. Please sign in again.',
  'network': 'We could not reach the server. Check your connection and try again.',
  'not-found': 'We could not find what you were looking for.',
  'unexpected': 'Something unexpected happened. Please try again.',
  'validation': 'Some of the information you entered is not valid.',
  'api': 'Something went wrong on our side. Please try again.',
}

export class AppError extends Error {
  readonly kind: AppErrorKind
  readonly code?: string
  readonly requestId?: string
  readonly statusCode?: number

  constructor(options: AppErrorOptions = {}) {
    const kind = options.kind ?? 'unexpected'

    super(options.message ?? USER_MESSAGES[kind], { cause: options.cause })

    this.name = 'AppError'
    this.kind = kind
    this.code = options.code
    this.requestId = options.requestId
    this.statusCode = options.statusCode
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
