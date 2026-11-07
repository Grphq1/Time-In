import { Data } from 'effect'
import type { Provider } from './account'

export class AccountLinkedToAnotherUserError extends Data.TaggedClass('AccountLinkedToAnotherUserError')<{
  readonly accountId: string
  readonly userId: string
  readonly provider: string
}> {}

export class EmailAlreadyRegisteredError extends Data.TaggedError('EmailAlreadyRegisteredError')<{
  readonly email: string
  readonly provider: Provider
}> {}

export class ProviderEmailMissingError extends Data.TaggedError('ProviderEmailMissingError')<{
  readonly provider: Provider
}> {}

export class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  readonly id: string
}> {}
