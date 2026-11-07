import type { User } from '../domain/user'

// Keeps createdAt out of the sealed session cookie; clients get it from /api/profile.
export const toSessionUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  visibility: user.visibility,
})
