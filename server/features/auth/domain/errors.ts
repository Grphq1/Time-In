import { Data } from 'effect'

export class AccountLinkedToAnotherUserError extends Data.TaggedClass('AccountLinkedToAnotherUserError')<{
  readonly accountId: string
  readonly userId: string
  readonly provider: string
}> {}

export class RepositoryError extends Data.TaggedError('RepositoryError')<{
  readonly cause: unknown
}> {}

export class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  readonly id: string
}> {}
