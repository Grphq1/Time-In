import { and, eq, ne, sql } from 'drizzle-orm'
import { Effect, Layer } from 'effect'
import { db, schema } from '@nuxthub/db'
import { UserNotFoundError } from '../domain/errors'
import type { User } from '../domain/user'
import { UserRepository } from '../domain/user.port'
import { tryDb } from '#server/shared/runtime/drizzle'

function dbUserToDomain(
  user: typeof schema.users.$inferSelect,
): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    visibility: user.visibility,
    createdAt: user.createdAt,
  }
}

export const drizzleUserAdapter = Layer.succeed(UserRepository, {
  save: (user: User) =>
    tryDb(() => db.insert(schema.users).values(user).run()),

  update: (user: User) =>
    tryDb(() =>
      db
        .update(schema.users)
        .set({
          name: user.name,
          avatarUrl: user.avatarUrl,
          visibility: user.visibility,
        })
        .where(eq(schema.users.id, user.id))
        .run(),
    ),

  findById: (id: string) =>
    tryDb(() => db.select().from(schema.users).where(eq(schema.users.id, id)).get()).pipe(
      Effect.flatMap((user) => {
        if (!user) {
          return Effect.fail(new UserNotFoundError({ id }))
        }

        return Effect.succeed(dbUserToDomain(user))
      }),
    ),

  findByEmail: (email: string) =>
    tryDb(() =>
      db
        .select()
        .from(schema.users)
        .where(sql`lower(${schema.users.email}) = ${email.toLowerCase()}`)
        .get(),
    ).pipe(Effect.map(user => user ? dbUserToDomain(user) : null)),

  searchByName: (query, excludeId, limit) =>
    tryDb(() =>
      db
        .select()
        .from(schema.users)
        .where(and(
          ne(schema.users.id, excludeId),
          sql`lower(${schema.users.name}) like ${`%${query.toLowerCase()}%`}`,
        ))
        .orderBy(schema.users.name)
        .limit(limit),
    ).pipe(Effect.map(rows => rows.map(dbUserToDomain))),
})
