import { DateTime, Effect } from 'effect'
import type { Provider } from '../domain/account'
import { AccountRepository } from '../domain/account.port'
import { AccountLinkedToAnotherUserError } from '../domain/errors'
import type { User } from '../domain/user'
import { UserRepository } from '../domain/user.port'

interface OAuthLoginInput {
  provider: Provider
  providerAccountId: string
  name: string
  email: string | null
  avatarUrl: string | null
}

export const handleOAuthLogin = (input: {
  profile: OAuthLoginInput
  currentUserId: string | null
}) =>
  Effect.gen(function* () {
    const users = yield* UserRepository
    const accounts = yield* AccountRepository
    const now = yield* DateTime.nowAsDate
    const { profile, currentUserId } = input

    yield* Effect.logInfo('Handling OAuth login', {
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
    })

    const existing = yield* accounts.findByProviderAndProviderAccountId(
      profile.provider,
      profile.providerAccountId,
    )

    if (existing) {
      if (currentUserId && currentUserId !== existing.userId) {
        yield* Effect.logWarning('OAuth account already linked to another user', {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          currentUserId,
          linkedUserId: existing.userId,
        })

        return yield* Effect.fail(
          new AccountLinkedToAnotherUserError({
            provider: profile.provider,
            userId: existing.userId,
            accountId: existing.id,
          }),
        )
      }

      yield* Effect.logInfo('OAuth account already linked, loading existing user', {
        userId: existing.userId,
      })

      return yield* users.findById(existing.userId)
    }

    let user: User

    if (currentUserId) {
      user = yield* users.findById(currentUserId)
    }
    else {
      yield* Effect.logInfo('Creating user for OAuth login', {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      })

      user = {
        id: crypto.randomUUID(),
        name: profile.name,
        email: profile.email ?? '',
        avatarUrl: profile.avatarUrl,
        createdAt: now,
      }
      yield* users.save(user)
    }

    yield* accounts.save({
      id: crypto.randomUUID(),
      userId: user.id,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      createdAt: now,
    })

    yield* Effect.logInfo('OAuth login completed', { userId: user.id })
    return user
  })
