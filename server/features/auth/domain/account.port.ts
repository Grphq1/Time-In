import type { Effect } from 'effect'
import { Context } from 'effect'
import type { Account, Provider } from './account'
import type { RepositoryError } from '#server/shared/types'

export class AccountRepository extends Context.Service<
  AccountRepository,
  {
    readonly save: (account: Account) => Effect.Effect<void, RepositoryError>

    readonly findByProviderAndProviderAccountId: (
      provider: Provider,
      providerAccountId: string,
    ) => Effect.Effect<Account | null, RepositoryError>
  }
>()('AccountRepository') {}
