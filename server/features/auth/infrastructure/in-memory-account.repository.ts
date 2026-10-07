import { Effect, Layer, Ref } from 'effect'
import type { Account } from '../domain/account'
import { AccountRepository } from '../domain/account.port'
import type { RepositoryError } from '../domain/errors'

export const inMemoryAccountAdapter = Layer.effect(
  AccountRepository,
  Effect.gen(function* () {
    const accountsRef = yield* Ref.make(new Map<string, Account>())

    return {
      save: (account: Account): Effect.Effect<void, RepositoryError> =>
        Ref.update(accountsRef, (map) => {
          const next = new Map(map)
          next.set(account.id, account)
          return next
        }),

      findByProviderAndProviderAccountId: (provider, providerAccountId): Effect.Effect<Account | null, RepositoryError> =>
        Ref.get(accountsRef).pipe(
          Effect.map((map) => {
            for (const account of map.values()) {
              if (account.provider === provider && account.providerAccountId === providerAccountId) {
                return account
              }
            }

            return null
          }),
        ),
    }
  }),
)
