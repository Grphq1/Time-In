import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { Effect, Logger } from 'effect'
import { effectLogger, resolveLogLevel, serverLogger } from '../../server/utils/logger'

beforeEach(() => {
  process.env.NUXT_LOG_LEVEL = 'Debug'
})

afterEach(() => {
  delete process.env.NUXT_LOG_LEVEL
  vi.restoreAllMocks()
})

describe('effectLogger', () => {
  it('writes annotations, spans, and level as a JSON line', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    Effect.runSync(
      Effect.logInfo('hello').pipe(
        Effect.annotateLogs({ requestId: 'abc', userId: 42 }),
        Effect.withLogSpan('checkout'),
        Effect.provide(Logger.layer([effectLogger])),
      ),
    )
    expect(log).toHaveBeenCalledTimes(1)
    const line = JSON.parse(String(log.mock.calls[0][0]))
    expect(line).toMatchObject({
      level: 'info',
      message: 'hello',
      requestId: 'abc',
      userId: 42,
    })
    expect(line.spans).toEqual({ checkout: expect.any(Number) })
    expect(line.fiberId).toBeDefined()
    expect(line.time).toBeDefined()
  })

  it('formats object messages instead of [object Object]', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    Effect.runSync(
      Effect.logInfo('Handling OAuth login', { provider: 'github' }).pipe(
        Effect.provide(Logger.layer([effectLogger])),
      ),
    )
    const line = JSON.parse(String(log.mock.calls[0][0]))
    expect(line.message).toContain('Handling OAuth login')
    expect(line.message).toContain('github')
    expect(line.message).not.toContain('[object Object]')
  })
})

describe('serverLogger', () => {
  it('includes request context when event provided', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const event = {
      context: { requestId: 'req-1' },
      method: 'GET',
      path: '/api/test',
    } as unknown as H3Event
    serverLogger(event).info('listing sessions')
    const line = JSON.parse(String(log.mock.calls[0][0]))
    expect(line).toMatchObject({
      level: 'info',
      message: 'listing sessions',
      requestId: 'req-1',
      method: 'GET',
      path: '/api/test',
    })
  })

  it('serializes Error objects', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    serverLogger().error('failed', { err: new TypeError('bad') })
    const line = JSON.parse(String(error.mock.calls[0][0]))
    expect(line.err).toEqual({ name: 'TypeError', message: 'bad', stack: expect.any(String) })
  })
})

describe('redaction', () => {
  it('redacts sensitive top-level fields', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    serverLogger().info('login', {
      password: 'hunter2',
      authorization: 'Bearer abc',
      userId: 'user-1',
    })
    const line = JSON.parse(String(log.mock.calls[0][0]))
    expect(line).toMatchObject({
      password: '[REDACTED]',
      authorization: '[REDACTED]',
      userId: 'user-1',
    })
  })
})

describe('log level', () => {
  it('defaults to Error under the test runner', () => {
    delete process.env.NUXT_LOG_LEVEL
    expect(resolveLogLevel()).toBe('Error')
  })

  it('accepts a case-insensitive NUXT_LOG_LEVEL override', () => {
    process.env.NUXT_LOG_LEVEL = 'warn'
    expect(resolveLogLevel()).toBe('Warn')
  })

  it('ignores unknown level values', () => {
    process.env.NUXT_LOG_LEVEL = 'nope'
    expect(resolveLogLevel()).toBe('Error')
  })

  it('drops entries below the configured level', () => {
    process.env.NUXT_LOG_LEVEL = 'Warn'
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const logger = serverLogger()
    logger.info('hidden')
    logger.warn('shown')
    expect(log).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
