import { and, eq } from 'drizzle-orm'
import { Effect, Layer } from 'effect'
import { db, schema } from '@nuxthub/db'
import type { Account } from '../domain/account'
import { AccountRepository } from '../domain/account.port'
import { tryDb } from '#server/shared/runtime/drizzle'

export const drizzleAccountAdapter = Layer.succeed(AccountRepository, {
  save: (account: Account) =>
    tryDb(() => db.insert(schema.accounts).values(account).run()),

  findByProviderAndProviderAccountId: (provider, providerAccountId) =>
    tryDb(() =>
      db
        .select()
        .from(schema.accounts)
        .where(and(
          eq(schema.accounts.provider, provider),
          eq(schema.accounts.providerAccountId, providerAccountId),
        ))
        .get(),
    ).pipe(
      Effect.map(account => account
        ? {
            id: account.id,
            provider: account.provider as Account['provider'],
            providerAccountId: account.providerAccountId,
            userId: account.userId,
            createdAt: account.createdAt as Date,
          } as Account
        : null),
    ),
})
