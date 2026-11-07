import type { EffectRuntime } from '~~/server/shared/runtime/server-layer'
import { effectRuntime } from '~~/server/shared/runtime/effect-runtime'

declare module 'h3' {
  interface H3EventContext {
    effectRuntime: EffectRuntime
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context.effectRuntime = effectRuntime
  })
  nitroApp.hooks.hook('close', () => effectRuntime.dispose())
})
