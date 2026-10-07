import { Data, Effect } from 'effect'
import type {
  AccountLinkedToAnotherUserError,
  RepositoryError,
  UserNotFoundError,
} from '~/server/features/auth/domain/errors'

type AppError
  = | AccountLinkedToAnotherUserError
    | RepositoryError
    | UserNotFoundError

export interface EffectRuntime {
  runPromise: <A, E, R>(effect: Effect.Effect<A, E, R>) => Promise<A>
  dispose: () => void | Promise<void>
}

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

export const runEffect = async <A, R>(
  program: Effect.Effect<A, AppError, R>,
  runtime: EffectRuntime,
) =>
  runtime.runPromise(
    program.pipe(
      Effect.catchTags({
        AccountLinkedToAnotherUserError: error =>
          Effect.fail(new HttpError({
            statusCode: 409,
            code: 'account-linked',
            message: `This GitHub account is already linked to user ${error.userId}.`,
          })),
        UserNotFoundError: () =>
          Effect.fail(new HttpError({
            statusCode: 401,
            code: 'session-missing',
            message: 'Your session is no longer valid. Please sign in again.',
          })),
        RepositoryError: error =>
          Effect.logError('[RepositoryError]', error.cause).pipe(
            Effect.andThen(Effect.fail(new HttpError({
              statusCode: 500,
              code: 'auth-failed',
              message: 'We could not complete your sign in.',
            }))),
          ),
      }),
      Effect.catchDefect(defect =>
        Effect.logError('[Defect]', defect).pipe(
          Effect.andThen(Effect.fail(new HttpError({
            statusCode: 500,
            code: 'auth-failed',
            message: 'Unexpected error while signing in.',
          }))),
        ),
      ),
    ),
  ).catch((error: unknown): never => {
    if (error instanceof HttpError) {
      throw toHttpError(error)
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unexpected error while signing in.',
      data: { code: 'auth-failed' },
    })
  })
