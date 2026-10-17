import { Effect } from 'effect'
import { RepositoryError } from '#server/features/auth/domain/errors'

export const tryDb = <A>(promise: () => Promise<A>) =>
  Effect.tryPromise({ try: promise, catch: cause => new RepositoryError({ cause }) })
