import { ManagedRuntime, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { handleOAuthLogin } from '../../server/features/auth/application/handle-oauth-login'
import { AccountLinkedToAnotherUserError } from '../../server/features/auth/domain/errors'
import { inMemoryAccountAdapter } from '../../server/features/auth/infrastructure/in-memory-account.repository'
import { inMemoryUserAdapter } from '../../server/features/auth/infrastructure/in-memory-user.repository'

const createRuntime = () => ManagedRuntime.make(Layer.merge(inMemoryUserAdapter, inMemoryAccountAdapter))

const login = (runtime: ReturnType<typeof createRuntime>, input: Parameters<typeof handleOAuthLogin>[0]) =>
  runtime.runPromise(handleOAuthLogin(input))

const baseProfile = {
  provider: 'github' as const,
  providerAccountId: 'github-account-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  avatarUrl: 'https://example.com/avatar.png',
}

describe('handleOAuthLogin', () => {
  it('creates a user and reuses it for the same OAuth account', async () => {
    const runtime = createRuntime()

    const first = await login(runtime, {
      profile: baseProfile,
      currentUserId: null,
    })

    const second = await login(runtime, {
      profile: baseProfile,
      currentUserId: null,
    })

    expect(second.id).toBe(first.id)
    expect(second.name).toBe(baseProfile.name)
    expect(second.email).toBe(baseProfile.email)
    expect(second.avatarUrl).toBe(baseProfile.avatarUrl)
    expect(second.createdAt).toBeInstanceOf(Date)
  })

  it('links a new OAuth account to the current user', async () => {
    const runtime = createRuntime()

    const existingUser = await login(runtime, {
      profile: baseProfile,
      currentUserId: null,
    })

    const linked = await login(runtime, {
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
        name: 'Ada Lovelace Updated',
      },
      currentUserId: existingUser.id,
    })

    expect(linked.id).toBe(existingUser.id)

    const accountLookup = await login(runtime, {
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
      },
      currentUserId: null,
    })

    expect(accountLookup.id).toBe(existingUser.id)
  })

  it('rejects when the OAuth account is already linked to another user', async () => {
    const runtime = createRuntime()

    await login(runtime, {
      profile: baseProfile,
      currentUserId: null,
    })

    const otherUser = await login(runtime, {
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
      },
      currentUserId: null,
    })

    await expect(
      login(runtime, {
        profile: baseProfile,
        currentUserId: otherUser.id,
      }),
    ).rejects.toBeInstanceOf(AccountLinkedToAnotherUserError)
  })
})
