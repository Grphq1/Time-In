declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    avatar?: string | null
    avatarUrl?: string | null
    visibility?: 'public' | 'friends' | 'private'
  }
}
export {}
