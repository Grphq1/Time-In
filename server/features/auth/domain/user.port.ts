import type { Effect } from 'effect'
import { Context } from 'effect'
import type { Account } from './account'
import type { UserNotFoundError } from './errors'
import type { User } from './user'
import type { RepositoryError } from '#server/shared/types'

export class UserRepository extends Context.Service<
  UserRepository,
  {
    /** Creates the user and its first OAuth account in one transaction. */
    readonly createWithAccount: (
      user: User,
      account: Account,
    ) => Effect.Effect<void, RepositoryError>

    readonly update: (user: User) => Effect.Effect<void, RepositoryError>

    readonly findById: (id: string) => Effect.Effect<User, UserNotFoundError | RepositoryError>

    readonly findByEmail: (email: string) => Effect.Effect<User | null, RepositoryError>

    readonly searchByName: (
      query: string,
      excludeId: string,
      limit: number,
    ) => Effect.Effect<User[], RepositoryError>
  }
>()('UserRepository') {}
