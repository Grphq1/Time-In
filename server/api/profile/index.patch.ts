import { mapProfileError } from '#server/features/auth/application/http-errors'
import { toSessionUser } from '#server/features/auth/application/session-user'
import { updateProfile } from '#server/features/auth/application/update-profile'
import { updateProfileSchema } from '#shared/schemas/profile'
import { runEffect } from '~~/server/shared/runtime/http'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const input = await readValidatedBody(event, updateProfileSchema.parse)

  const user = await runEffect(
    updateProfile(session.user.id, input),
    event.context.effectRuntime,
    mapProfileError,
  )

  await setUserSession(event, {
    user: toSessionUser(user),
  })

  return user
})
