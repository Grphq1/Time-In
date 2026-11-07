import type { User } from '#server/features/auth/domain/user'

export type UserProfile = User

type SerializedUserProfile = Omit<UserProfile, 'createdAt'> & {
  createdAt: string | Date
}

export function reviveUserProfile(raw: SerializedUserProfile): UserProfile {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
  }
}

export function formatProfileJoinedAt(value: string | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
  }).format(new Date(value))
}
