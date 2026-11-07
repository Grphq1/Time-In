import { ManagedRuntime } from 'effect'
import type { EffectRuntime } from './server-layer'
import { ServerLayer } from './server-layer'

export const effectRuntime: EffectRuntime = ManagedRuntime.make(ServerLayer)
