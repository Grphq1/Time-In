import { Effect } from 'effect'

export const logError = (message: string, cause?: unknown) =>
  Effect.runPromise(Effect.logError(message, cause))
