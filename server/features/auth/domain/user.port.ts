import type { Effect } from 'effect'
import { Context } from 'effect'
import type { RepositoryError, UserNotFoundError } from './errors'
import type { User } from './user'

export class UserRepository extends Context.Service<
  UserRepository,
  {
    readonly save: (user: User) => Effect.Effect<void, RepositoryError>

    readonly findById: (id: string) => Effect.Effect<User, UserNotFoundError | RepositoryError>
  }
>()('UserRepository') {}
