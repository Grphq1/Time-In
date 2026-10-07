import { Effect, Layer, Ref } from 'effect'
import type { RepositoryError } from '../domain/errors'
import { UserNotFoundError } from '../domain/errors'
import type { User } from '../domain/user'
import { UserRepository } from '../domain/user.port'

export const inMemoryUserAdapter = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const usersRef = yield* Ref.make(new Map<string, User>())

    return {
      save: (user: User): Effect.Effect<void, RepositoryError> =>
        Ref.update(usersRef, (map) => {
          const newMap = new Map(map)
          newMap.set(user.id, user)
          return newMap
        }),

      findById: (id: string): Effect.Effect<User, UserNotFoundError | RepositoryError> =>
        Ref.get(usersRef).pipe(
          Effect.flatMap((map) => {
            const user = map.get(id)
            if (user === undefined) {
              return Effect.fail(new UserNotFoundError({ id }))
            }
            return Effect.succeed(user)
          }),
        ),
    }
  }),
)
