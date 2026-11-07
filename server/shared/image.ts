export type AvatarMime = 'image/gif' | 'image/jpeg' | 'image/png' | 'image/webp'

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, index) => bytes[offset + index] === value)

export function detectImageType(bytes: Uint8Array): AvatarMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return 'image/png'
  }

  if (startsWith(bytes, [0xFF, 0xD8, 0xFF])) {
    return 'image/jpeg'
  }

  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) {
    return 'image/gif'
  }

  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp'
  }

  return null
}

export function normalizeAvatarPath(rawPathname: string): string | null {
  const pathname = rawPathname.replace(/^\/+/, '')

  let decoded: string

  try {
    decoded = decodeURIComponent(pathname)
  }
  catch {
    return null
  }

  if (
    !decoded.startsWith('avatars/')
    || decoded.includes('..')
    || decoded.includes('\\')
    || /%2e/i.test(decoded)
  ) {
    return null
  }

  return decoded
}
