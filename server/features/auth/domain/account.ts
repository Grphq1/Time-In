export type Provider = 'google' | 'github'

export interface Account {
  readonly id: string
  readonly provider: Provider
  readonly providerAccountId: string
  readonly userId: string
  readonly createdAt: Date
}
