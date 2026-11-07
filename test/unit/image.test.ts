import { describe, expect, it } from 'vitest'
import { detectImageType, normalizeAvatarPath } from '../../server/shared/image'

const bytes = (...values: number[]) => new Uint8Array(values)

describe('detectImageType', () => {
  it.each([
    ['png', [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 'image/png'],
    ['jpeg', [0xFF, 0xD8, 0xFF], 'image/jpeg'],
    ['gif', [0x47, 0x49, 0x46, 0x38], 'image/gif'],
    ['webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 'image/webp'],
  ])('detects %s', (_name, signature, expected) => {
    expect(detectImageType(bytes(...signature))).toBe(expected)
  })

  it('rejects an unknown signature', () => {
    expect(detectImageType(bytes(0x3C, 0x68, 0x74, 0x6D, 0x6C))).toBeNull()
  })

  it('rejects a truncated webp header', () => {
    expect(detectImageType(bytes(0x52, 0x49, 0x46, 0x46))).toBeNull()
  })
})

describe('normalizeAvatarPath', () => {
  it('keeps a valid avatar path', () => {
    expect(normalizeAvatarPath('/avatars/user-1/photo.png')).toBe('avatars/user-1/photo.png')
  })

  it.each([
    ['a different prefix', '/images/user-1/photo.png'],
    ['a parent segment', '/avatars/../secret.png'],
    ['an encoded parent segment', '/avatars/%2e%2e/secret.png'],
    ['a backslash', '/avatars/user-1\\secret.png'],
    ['an empty path', ''],
    ['a malformed escape', '/avatars/%E0%A4%A'],
  ])('rejects %s', (_name, pathname) => {
    expect(normalizeAvatarPath(pathname)).toBeNull()
  })
})
