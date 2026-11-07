import { Effect } from 'effect'
import type { ProfileVisibility } from '#shared/schemas/profile'
import { UserRepository } from '../domain/user.port'

export interface UpdateProfileInput {
  readonly name?: string
  readonly avatarUrl?: string | null
  readonly visibility?: ProfileVisibility
}

export const updateProfile = (userId: string, input: UpdateProfileInput) =>
  Effect.gen(function* () {
    const users = yield* UserRepository
    const user = yield* users.findById(userId)

    const updated = {
      ...user,
      name: input.name ?? user.name,
      avatarUrl: input.avatarUrl === undefined ? user.avatarUrl : input.avatarUrl,
      visibility: input.visibility ?? user.visibility,
    }

    yield* users.update(updated)

    return updated
  })
