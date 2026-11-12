import { Effect, Layer, ManagedRuntime } from 'effect'
import { afterAll, describe, expect, it } from 'vitest'
import { HttpError, runEffect } from '../../server/shared/runtime/http'

const runtime = ManagedRuntime.make(Layer.empty)

const failAs = (statusCode: number, code: string) =>
  () => Effect.fail(new HttpError({ statusCode, code, message: code }))

afterAll(async () => {
  await runtime.dispose()
})

describe('runEffect', () => {
  it('returns the program result on success', async () => {
    await expect(runEffect(Effect.succeed('ok'), runtime, failAs(400, 'never'))).resolves.toBe('ok')
  })

  it('maps a typed failure to an HTTP error', async () => {
    const thrown = await runEffect(
      Effect.fail('missing'),
      runtime,
      failAs(401, 'session-missing'),
    ).catch(error => error as { data: { code: string }, statusCode: number, statusMessage: string })

    expect(thrown.statusCode).toBe(401)
    expect(thrown.statusMessage).toBe('session-missing')
    expect(thrown.data.code).toBe('session-missing')
  })

  it('turns an unexpected defect into a 500 without leaking it', async () => {
    const thrown = await runEffect(
      Effect.sync(() => {
        throw new Error('database password is hunter2')
      }),
      runtime,
      failAs(400, 'never'),
    ).catch(error => error as { data: { code: string }, statusCode: number, statusMessage: string })

    expect(thrown.statusCode).toBe(500)
    expect(thrown.data.code).toBe('internal-error')
    expect(thrown.statusMessage).not.toContain('hunter2')
  })
})
