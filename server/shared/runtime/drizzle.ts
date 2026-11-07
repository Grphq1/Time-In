import { Effect } from 'effect'
import { RepositoryError } from '../types'

export const tryDb = <A>(promise: () => Promise<A>) =>
  Effect.tryPromise({ try: promise, catch: cause => new RepositoryError({ cause }) })
