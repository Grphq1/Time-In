import { mapProfileError } from '#server/features/auth/application/http-errors'
import { getProfile } from '#server/features/auth/application/get-profile'
import { runEffect, requestLogContext } from '~~/server/shared/runtime/http'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  return runEffect(
    getProfile(session.user.id),
    event.context.effectRuntime,
    mapProfileError,
    requestLogContext(event),
  )
})
