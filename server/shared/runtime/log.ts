import { serverLogger } from '#server/utils/logger'

export async function logError(message: string, cause?: unknown) {
  serverLogger().error(message, { error: cause })
}
