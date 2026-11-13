import { describe, expect, it } from 'vitest'
import { AppError, isAppError, normalizeError } from '../../shared/errors'

describe('normalizeError', () => {
  it('keeps a safe API message and request id', () => {
    const error = normalizeError({
      statusCode: 500,
      data: {
        code: 'request-failed',
        statusMessage: 'Something went wrong while processing your request.',
        requestId: 'req_123',
      },
    })

    expect(error.kind).toBe('api')
    expect(error.message).toBe('Something went wrong while processing your request.')
    expect(error.code).toBe('request-failed')
    expect(error.requestId).toBe('req_123')
  })

  it('maps auth and validation status codes', () => {
    expect(normalizeError({ statusCode: 401 }).kind).toBe('auth')
    expect(normalizeError({ statusCode: 422 }).kind).toBe('validation')
    expect(normalizeError({ statusCode: 404 }).kind).toBe('not-found')
  })

  it('uses the top-level h3 status message', () => {
    const error = normalizeError({
      statusCode: 400,
      statusMessage: 'Choose an image smaller than 2 MB.',
      data: { code: 'avatar-too-large' },
    })

    expect(error.message).toBe('Choose an image smaller than 2 MB.')
    expect(error.kind).toBe('validation')
  })

  it('does not leak zod issue details', () => {
    const error = normalizeError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        issues: [{ message: 'Expected string, received number', path: ['name'] }],
        message: '[\n  {\n    "code": "invalid_type"\n  }\n]',
      },
    })

    expect(error.message).not.toContain('invalid_type')
  })

  it('treats fetch failures as network errors', () => {
    expect(normalizeError(new TypeError('fetch failed')).kind).toBe('network')
    expect(normalizeError(new TypeError('Failed to fetch')).kind).toBe('network')
  })

  it('treats other TypeErrors as unexpected, not network', () => {
    expect(normalizeError(new TypeError('x is not a function')).kind).toBe('unexpected')
  })

  it('never exposes an internal error message', () => {
    const error = normalizeError(new Error('database password is hunter2'))

    expect(error.kind).toBe('unexpected')
    expect(error.message).not.toContain('hunter2')
  })

  it('returns the same AppError when called twice', () => {
    const first = new AppError({ kind: 'network' })

    expect(normalizeError(first)).toBe(first)
    expect(isAppError(first)).toBe(true)
  })
})
