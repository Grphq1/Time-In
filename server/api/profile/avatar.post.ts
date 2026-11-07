import { createError, getHeader } from 'h3'
import { blob, ensureBlob } from 'hub:blob'
import { getProfile } from '#server/features/auth/application/get-profile'
import { mapProfileError } from '#server/features/auth/application/http-errors'
import { toSessionUser } from '#server/features/auth/application/session-user'
import { updateProfile } from '#server/features/auth/application/update-profile'
import { detectImageType, type AvatarMime } from '#server/shared/image'
import { logError } from '#server/shared/runtime/log'
import { runEffect } from '~~/server/shared/runtime/http'

const AVATAR_TYPES: AvatarMime[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const EXTENSIONS: Record<AvatarMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const contentLength = Number(getHeader(event, 'content-length') ?? 0)

  // shortcut: chunked uploads have no content-length; ensureBlob still checks the real size
  if (contentLength > MAX_AVATAR_BYTES + 64 * 1024) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Choose an image smaller than 2 MB.',
      data: { code: 'avatar-too-large' },
    })
  }

  const form = await readFormData(event)
  const file = form.get('avatar')

  if (!(file instanceof File)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose an image to upload.',
      data: { code: 'avatar-required' },
    })
  }

  ensureBlob(file, {
    maxSize: '2MB',
    types: AVATAR_TYPES,
  })

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const detectedType = detectImageType(signature)

  if (!detectedType || detectedType !== file.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a PNG, JPEG, WebP or GIF image.',
      data: { code: 'avatar-invalid-type' },
    })
  }

  const extension = EXTENSIONS[detectedType]
  const pathname = `avatars/${session.user.id}/${crypto.randomUUID()}.${extension}`
  const previous = await runEffect(
    getProfile(session.user.id),
    event.context.effectRuntime,
    mapProfileError,
  )

  let uploaded: Awaited<ReturnType<typeof blob.put>>

  try {
    uploaded = await blob.put(pathname, file, {
      access: 'public',
      contentType: detectedType,
    })
  }
  catch (cause) {
    await logError('[AvatarUpload] Failed to store avatar', cause)

    throw createError({
      statusCode: 500,
      statusMessage: 'Could not upload your avatar.',
      data: { code: 'avatar-upload-failed' },
    })
  }

  const user = await runEffect(
    updateProfile(session.user.id, {
      avatarUrl: `/images/${uploaded.pathname}`,
    }),
    event.context.effectRuntime,
    mapProfileError,
  )

  await setUserSession(event, {
    user: toSessionUser(user),
  })

  const oldPath = previous.avatarUrl?.startsWith('/images/avatars/')
    ? previous.avatarUrl.slice('/images/'.length)
    : null

  if (oldPath && oldPath !== uploaded.pathname) {
    await blob.del(oldPath).catch(cause =>
      logError('[AvatarUpload] Failed to delete old avatar', cause),
    )
  }

  return user
})
