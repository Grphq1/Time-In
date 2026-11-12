import type { H3Event } from 'h3'
import { Formatter, Layer, Logger, LogLevel, References } from 'effect'
import { createConsola } from 'consola'

declare module 'h3' {
  interface H3EventContext {
    requestId?: string
    requestStart?: number
  }
}

type Level = 'debug' | 'info' | 'warn' | 'error'

// Severity rank: higher rank means more verbose. `None` disables logging.
const RANK: Record<Level, number> = { error: 0, warn: 1, info: 2, debug: 3 }

const LEVELS = new Map(LogLevel.values.map(level => [level.toUpperCase(), level]))

/** Resolve the minimum log level from `NUXT_LOG_LEVEL`, then environment defaults. */
export function resolveLogLevel(): LogLevel.LogLevel {
  const raw = process.env.NUXT_LOG_LEVEL?.toUpperCase()
  const configured = raw ? LEVELS.get(raw) : undefined

  if (configured) return configured

  if (process.env.VITEST) return 'Error'
  return process.env.NODE_ENV === 'production' ? 'Info' : 'Debug'
}

function toSinkRank(level: LogLevel.LogLevel): number {
  switch (level) {
    case 'None':
      return -1
    case 'Fatal':
    case 'Error':
      return RANK.error
    case 'Warn':
      return RANK.warn
    case 'Info':
      return RANK.info
    default:
      return RANK.debug
  }
}

// The shared sink owns level filtering, so consola itself must never drop a line.
const consola = createConsola({ level: 5 })

const SERVICE = 'time-in'
const ENVIRONMENT = process.env.NODE_ENV ?? 'development'

// shortcut: only top-level keys are redacted; extend for nested payloads if needed
const SENSITIVE = /pass|secret|token|cookie|auth|session|credential|api[-_]?key/i

function redact(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, SENSITIVE.test(key) ? '[REDACTED]' : value]),
  )
}

export function serializeForLog(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack }
  }

  return value
}

/**
 * Single log sink shared by the Effect logger and the h3 request logger:
 * readable consola output in development, one JSON line per entry in production.
 */
function write(level: Level, message: string, data: Record<string, unknown> = {}) {
  if (RANK[level] > toSinkRank(resolveLogLevel())) return

  const payload = redact(data)

  if (import.meta.dev) {
    // consola prints its own timestamp and level, and `message` is already the
    // first argument, so only the extra fields are passed here.
    if (Object.keys(payload).length > 0) consola[level](message, payload)
    else consola[level](message)
    return
  }

  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    service: SERVICE,
    env: ENVIRONMENT,
    message,
    ...payload,
  })

  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else if (level === 'debug') console.debug(line)
  else console.log(line)
}

function toLevel(level: string): Level {
  switch (level) {
    case 'FATAL':
    case 'ERROR':
      return 'error'
    case 'WARN':
      return 'warn'
    case 'DEBUG':
    case 'TRACE':
      return 'debug'
    default:
      return 'info'
  }
}

/**
 * Effect logger that routes structured log entries through the shared consola
 * sink. Reuses Effect's own structured formatter so message/cause/annotations/
 * spans/fiber are rendered the same way the framework does.
 */
export const effectLogger: Logger.Logger<unknown, void> = Logger.make((options) => {
  const structured = Logger.formatStructured.log(options)

  const messages = Array.isArray(structured.message) ? structured.message : [structured.message]
  const message = messages
    .map(part => (typeof part === 'string' ? part : Formatter.format(part, { space: 0 })))
    .join(' ')

  write(toLevel(structured.level), message, {
    ...structured.annotations,
    fiberId: structured.fiberId,
    ...(Object.keys(structured.spans).length > 0 ? { spans: structured.spans } : {}),
    ...(structured.cause ? { cause: structured.cause } : {}),
  })
})

/** Installs the custom logger and applies the configured minimum log level. */
export const LoggerLayer = Layer.merge(
  Logger.layer([effectLogger, Logger.tracerLogger]),
  Layer.succeed(References.MinimumLogLevel, resolveLogLevel()),
)

/**
 * Structured server logger for non-Effect code (h3 handlers and plugins). In
 * production each line is JSON so it can be shipped to any log collector;
 * development keeps the readable consola output.
 */
export function serverLogger(event?: H3Event) {
  const base = {
    requestId: event?.context.requestId,
    method: event?.method,
    path: event?.path,
  }

  return {
    info: (message: string, data?: Record<string, unknown>) => write('info', message, { ...base, ...data }),
    warn: (message: string, data?: Record<string, unknown>) => write('warn', message, { ...base, ...data }),
    error: (message: string, data?: Record<string, unknown>) =>
      write('error', message, {
        ...base,
        ...Object.fromEntries(
          Object.entries(data ?? {}).map(([key, value]) => [key, serializeForLog(value)]),
        ),
      }),
  }
}
