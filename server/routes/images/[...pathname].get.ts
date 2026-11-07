import { createError, getRouterParam } from 'h3'
import { blob } from 'hub:blob'
import { normalizeAvatarPath } from '#server/shared/image'

const notFound = () => createError({ statusCode: 404, statusMessage: 'Not Found' })

export default defineEventHandler(async (event) => {
  const pathname = normalizeAvatarPath(getRouterParam(event, 'pathname') ?? '')

  if (!pathname) {
    throw notFound()
  }

  return blob.serve(event, pathname)
})
