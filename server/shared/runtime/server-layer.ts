import { Layer, type ManagedRuntime } from 'effect'
import { drizzleAccountAdapter } from '#server/features/auth/infrastructure/drizzle-account.repository'
import { drizzleUserAdapter } from '#server/features/auth/infrastructure/drizzle-user.repository'
import { LoggerLayer } from '#server/utils/logger'

export const ServerLayer = Layer.mergeAll(drizzleUserAdapter, drizzleAccountAdapter, LoggerLayer)

export type ServerServices = Layer.Success<typeof ServerLayer>
export type EffectRuntime = ManagedRuntime.ManagedRuntime<
  ServerServices,
  Layer.Error<typeof ServerLayer>
>
