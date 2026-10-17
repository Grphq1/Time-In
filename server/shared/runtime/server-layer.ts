import { Layer } from 'effect'
import { drizzleAccountAdapter } from '#server/features/auth/infrastructure/drizzle-account.repository'
import { drizzleUserAdapter } from '#server/features/auth/infrastructure/drizzle-user.repository'

const authLayer = Layer.merge(drizzleUserAdapter, drizzleAccountAdapter)

export const ServerLayer = Layer.merge(authLayer)
