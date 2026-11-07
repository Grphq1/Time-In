import { describe, expect, it } from 'vitest'
import { avatarFileSchema, updateProfileSchema } from '../../shared/schemas/profile'

describe('updateProfileSchema', () => {
  it('trims the display name', () => {
    expect(updateProfileSchema.parse({ name: '  Ada Lovelace  ' })).toEqual({
      name: 'Ada Lovelace',
    })
  })

  it('accepts profile visibility', () => {
    expect(updateProfileSchema.parse({ visibility: 'friends' })).toEqual({
      visibility: 'friends',
    })
  })

  it.each([
    ['an empty body', {}],
    ['an empty name', { name: '' }],
    ['a name longer than 100 characters', { name: 'a'.repeat(101) }],
    ['an avatar url', { avatarUrl: 'https://example.com/avatar.png' }],
    ['an uploaded avatar path', { avatarUrl: '/images/avatars/user-1/a.png' }],
    ['an unknown field', { name: 'Ada', email: 'ada@example.com' }],
  ])('rejects %s', (_description, input) => {
    expect(updateProfileSchema.safeParse(input).success).toBe(false)
  })
})

describe('avatarFileSchema', () => {
  it('accepts a supported image under 2 MB', () => {
    const file = new File([new Uint8Array(1024)], 'avatar.png', { type: 'image/png' })

    expect(avatarFileSchema.safeParse(file).success).toBe(true)
  })

  it.each([
    ['an image over 2 MB', new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'avatar.png', { type: 'image/png' })],
    ['an unsupported file type', new File(['hello'], 'avatar.txt', { type: 'text/plain' })],
  ])('rejects %s', (_description, file) => {
    expect(avatarFileSchema.safeParse(file).success).toBe(false)
  })
})
