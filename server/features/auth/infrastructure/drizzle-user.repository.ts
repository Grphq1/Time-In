import { eq } from 'drizzle-orm'
import { Effect, Layer } from 'effect'
import { db, schema } from '@nuxthub/db'
import { UserNotFoundError } from '../domain/errors'
import type { User } from '../domain/user'
import { UserRepository } from '../domain/user.port'
import { tryDb } from '~/server/shared/runtime/drizzle'

export const drizzleUserAdapter = Layer.succeed(UserRepository, {
  save: (user: User) =>
    tryDb(() => db.insert(schema.users).values(user).run()),

  findById: (id: string) =>
    tryDb(() => db.select().from(schema.users).where(eq(schema.users.id, id)).get()).pipe(
      Effect.flatMap((user) => {
        if (!user) {
          return Effect.fail(new UserNotFoundError({ id }))
        }

        return Effect.succeed({
          id: user.id,
          name: user.name,
          email: user.email ?? '',
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        })
      }),
    ),
})
