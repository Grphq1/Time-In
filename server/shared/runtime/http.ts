import type { H3Event } from 'h3'
import { Data, Effect, type ManagedRuntime } from 'effect'
import { createError } from 'h3'
import { serializeForLog } from '#server/utils/logger'

export class HttpError extends Data.TaggedError('HttpError')<{
  readonly statusCode: number
  readonly code: string
  readonly message: string
}> {}

/** Log annotations that correlate Effect logs with the current request. */
export type RequestLogContext = {
  readonly requestId?: string
  readonly method?: string
  readonly path?: string
}

export const requestLogContext = (event: H3Event): RequestLogContext => ({
  requestId: event.context.requestId,
  method: event.method,
  path: event.path,
})

const toHttpError = (error: HttpError) =>
  createError({
    statusCode: error.statusCode,
    statusMessage: error.message,
    data: { code: error.code },
  })

const internalError = () =>
  new HttpError({
    statusCode: 500,
    code: 'internal-error',
    message: 'An unexpected error occurred. Please try again.',
  })

export const runEffect = async <A, E, R>(
  program: Effect.Effect<A, E, R>,
  runtime: ManagedRuntime.ManagedRuntime<R, never>,
  mapError: (error: E) => Effect.Effect<never, HttpError>,
  context?: RequestLogContext,
) =>
  runtime.runPromise(
    program.pipe(
      Effect.catch(mapError),
      Effect.catchDefect(defect =>
        Effect.logError('[Defect] Unhandled effect failure').pipe(
          Effect.annotateLogs({ error: serializeForLog(defect) }),
          Effect.andThen(Effect.fail(internalError())),
        ),
      ),
      Effect.annotateLogs(context ?? {}),
    ),
  ).catch((error: unknown): never => {
    if (error instanceof HttpError) {
      throw toHttpError(error)
    }

    throw toHttpError(internalError())
  })
