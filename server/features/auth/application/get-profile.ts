import { Effect } from 'effect'
import { UserRepository } from '../domain/user.port'

export const getProfile = (userId: string) =>
  Effect.gen(function* () {
    const users = yield* UserRepository

    return yield* users.findById(userId)
  })
