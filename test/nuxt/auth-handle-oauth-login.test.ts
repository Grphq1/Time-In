import { db, schema } from '@nuxthub/db'
import { ManagedRuntime } from 'effect'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { handleOAuthLogin } from '../../server/features/auth/application/handle-oauth-login'
import {
  AccountLinkedToAnotherUserError,
  EmailAlreadyRegisteredError,
  ProviderEmailMissingError,
  UserNotFoundError,
} from '../../server/features/auth/domain/errors'
import { ServerLayer } from '../../server/shared/runtime/server-layer'

const runtime = ManagedRuntime.make(ServerLayer)

const login = (input: Parameters<typeof handleOAuthLogin>[0]) =>
  runtime.runPromise(handleOAuthLogin(input))

const baseProfile = {
  provider: 'github' as const,
  providerAccountId: 'github-account-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  avatarUrl: 'https://example.com/avatar.png',
}

beforeEach(async () => {
  await db.delete(schema.accounts).run()
  await db.delete(schema.users).run()
})

afterAll(async () => {
  await runtime.dispose()
})

describe('handleOAuthLogin with the test database', () => {
  it('creates a user and reuses it for the same OAuth account', async () => {
    const first = await login({
      profile: baseProfile,
      currentUserId: null,
    })

    const second = await login({
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
    const existingUser = await login({
      profile: baseProfile,
      currentUserId: null,
    })

    const linked = await login({
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
      },
      currentUserId: existingUser.id,
    })

    expect(linked.id).toBe(existingUser.id)

    const accountLookup = await login({
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
      },
      currentUserId: null,
    })

    expect(accountLookup.id).toBe(existingUser.id)
  })

  it('rejects when the OAuth account is already linked to another user', async () => {
    await login({
      profile: baseProfile,
      currentUserId: null,
    })

    const otherUser = await login({
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
        email: 'grace@example.com',
      },
      currentUserId: null,
    })

    await expect(
      login({
        profile: baseProfile,
        currentUserId: otherUser.id,
      }),
    ).rejects.toBeInstanceOf(AccountLinkedToAnotherUserError)
  })

  it('loads the linked user when signing in again while already signed in', async () => {
    const first = await login({ profile: baseProfile, currentUserId: null })

    const second = await login({
      profile: { ...baseProfile, name: 'Ignored name' },
      currentUserId: first.id,
    })

    expect(second).toEqual(first)
  })

  it('keeps the current user profile when linking a new account', async () => {
    const first = await login({ profile: baseProfile, currentUserId: null })

    const linked = await login({
      profile: {
        ...baseProfile,
        providerAccountId: 'github-account-2',
        name: 'Ignored name',
        email: 'ignored@example.com',
        avatarUrl: null,
      },
      currentUserId: first.id,
    })

    expect(linked).toEqual(first)
  })

  it('treats the same account id on different providers as separate users', async () => {
    const sharedId = 'shared-account-id'

    const githubUser = await login({
      profile: { ...baseProfile, provider: 'github', providerAccountId: sharedId },
      currentUserId: null,
    })

    const googleUser = await login({
      profile: {
        ...baseProfile,
        provider: 'google',
        providerAccountId: sharedId,
        email: 'grace@example.com',
      },
      currentUserId: null,
    })

    expect(googleUser.id).not.toBe(githubUser.id)
  })

  it('rejects an email that already belongs to another user', async () => {
    await login({ profile: baseProfile, currentUserId: null })

    await expect(
      login({
        profile: {
          ...baseProfile,
          provider: 'google',
          providerAccountId: 'google-account-1',
          email: 'ADA@example.com',
        },
        currentUserId: null,
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError)
  })

  it('normalizes the provider email before storing it', async () => {
    const user = await login({
      profile: { ...baseProfile, email: '  ADA@Example.com  ' },
      currentUserId: null,
    })

    expect(user.email).toBe('ada@example.com')
  })

  it('rejects an empty provider email', async () => {
    await expect(
      login({
        profile: { ...baseProfile, email: '   ' },
        currentUserId: null,
      }),
    ).rejects.toBeInstanceOf(ProviderEmailMissingError)
  })

  it('fails when linking to a user that no longer exists', async () => {
    await expect(
      login({
        profile: baseProfile,
        currentUserId: 'missing-user',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('creates a public user', async () => {
    const user = await login({
      profile: baseProfile,
      currentUserId: null,
    })

    expect(user.visibility).toBe('public')
    expect(user.createdAt).toBeInstanceOf(Date)
  })
})
