import { Data, Effect, type ManagedRuntime } from 'effect'
import { createError } from 'h3'

export class HttpError extends Data.TaggedError('HttpError')<{
  readonly statusCode: number
  readonly code: string
  readonly message: string
}> {}

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
) =>
  runtime.runPromise(
    program.pipe(
      Effect.catch(mapError),
      Effect.catchDefect(defect =>
        Effect.logError('[Defect]', defect).pipe(
          Effect.andThen(Effect.fail(internalError())),
        ),
      ),
    ),
  ).catch((error: unknown): never => {
    if (error instanceof HttpError) {
      throw toHttpError(error)
    }

    throw toHttpError(internalError())
  })
