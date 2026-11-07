import { Effect } from 'effect'
import { HttpError } from '../../../shared/runtime/http'
import type { RepositoryError } from '../../../shared/types'
import type {
  AccountLinkedToAnotherUserError,
  EmailAlreadyRegisteredError,
  ProviderEmailMissingError,
  UserNotFoundError,
} from '../domain/errors'

export type AuthError
  = | AccountLinkedToAnotherUserError
    | EmailAlreadyRegisteredError
    | ProviderEmailMissingError
    | RepositoryError
    | UserNotFoundError

export type ProfileError = RepositoryError | UserNotFoundError

const logRepositoryFailure = (message: string, error: RepositoryError) =>
  Effect.logError(message, error.cause)

export const mapAuthError = (error: AuthError): Effect.Effect<never, HttpError> => {
  switch (error._tag) {
    case 'AccountLinkedToAnotherUserError':
      return Effect.fail(new HttpError({
        statusCode: 409,
        code: 'account-linked',
        message: 'This account is already linked to another user.',
      }))
    case 'EmailAlreadyRegisteredError':
      return Effect.fail(new HttpError({
        statusCode: 409,
        code: 'email-in-use',
        message: 'An account with this email already exists. Sign in with your other provider.',
      }))
    case 'ProviderEmailMissingError':
      return Effect.fail(new HttpError({
        statusCode: 400,
        code: 'email-required',
        message: 'Your provider did not share an email address. Use another sign-in method.',
      }))
    case 'UserNotFoundError':
      return Effect.fail(new HttpError({
        statusCode: 401,
        code: 'session-missing',
        message: 'Your session is no longer valid. Please sign in again.',
      }))
    case 'RepositoryError':
      return logRepositoryFailure('[RepositoryError] OAuth login failed', error).pipe(
        Effect.andThen(Effect.fail(new HttpError({
          statusCode: 500,
          code: 'auth-failed',
          message: 'We could not complete your sign in.',
        }))),
      )
  }
}

export const mapProfileError = (error: ProfileError): Effect.Effect<never, HttpError> => {
  switch (error._tag) {
    case 'UserNotFoundError':
      return Effect.fail(new HttpError({
        statusCode: 401,
        code: 'session-missing',
        message: 'Your session is no longer valid. Please sign in again.',
      }))
    case 'RepositoryError':
      return logRepositoryFailure('[RepositoryError] Profile request failed', error).pipe(
        Effect.andThen(Effect.fail(new HttpError({
          statusCode: 500,
          code: 'request-failed',
          message: 'Something went wrong while processing your request.',
        }))),
      )
  }
}
