import { db, schema } from '@nuxthub/db'
import { ManagedRuntime } from 'effect'
import { createEvent, getResponseHeader } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { completeOAuthLogin } from '../../server/features/auth/infrastructure/oauth-callback'
import { ServerLayer } from '../../server/shared/runtime/server-layer'

const runtime = ManagedRuntime.make(ServerLayer)

const profile = {
  provider: 'github' as const,
  providerAccountId: 'github-account-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  avatarUrl: null,
}

const createOAuthEvent = () => {
  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.method = 'GET'
  req.url = '/auth/github'
  const res = new ServerResponse(req)
  const event = createEvent(req, res)
  event.context.effectRuntime = runtime
  return event
}

const runLogin = (overrides: Partial<Parameters<typeof completeOAuthLogin>[1]> = {}, deps: Partial<Parameters<typeof completeOAuthLogin>[2]> = {}) =>
  completeOAuthLogin(
    createOAuthEvent(),
    { ...profile, ...overrides },
    {
      getCurrentUserId: async () => null,
      saveSession: async () => {},
      ...deps,
    },
  )

beforeEach(async () => {
  await db.delete(schema.accounts).run()
  await db.delete(schema.users).run()
})

afterAll(async () => {
  await runtime.dispose()
})

describe('OAuth callback', () => {
  it('saves the session and redirects home on success', async () => {
    const event = createOAuthEvent()
    let savedUser: unknown

    await completeOAuthLogin(event, profile, {
      getCurrentUserId: async () => null,
      saveSession: async (user) => {
        savedUser = user
      },
    })

    expect(getResponseHeader(event, 'location')).toBe('/')
    expect(savedUser).toMatchObject({ email: profile.email })
  })

  it('redirects with session-failed when saving the session throws', async () => {
    const event = createOAuthEvent()

    await completeOAuthLogin(event, profile, {
      getCurrentUserId: async () => null,
      saveSession: async () => {
        throw new Error('session store unavailable')
      },
    })

    expect(getResponseHeader(event, 'location')).toBe('/auth?error=session-failed')
  })

  it('redirects with account-linked when the account belongs to another user', async () => {
    await runLogin()

    await runLogin({
      providerAccountId: 'github-account-2',
      email: 'grace@example.com',
    })

    const users = await db.select().from(schema.users).all()
    const otherUserId = users.find(user => user.email === 'grace@example.com')?.id

    const event = createOAuthEvent()
    await completeOAuthLogin(event, profile, {
      getCurrentUserId: async () => String(otherUserId),
      saveSession: async () => {},
    })

    expect(getResponseHeader(event, 'location')).toBe('/auth?error=account-linked')
  })

  it('redirects with email-in-use when another user already has the email', async () => {
    await runLogin()

    const event = createOAuthEvent()
    await completeOAuthLogin(event, {
      ...profile,
      provider: 'google',
      providerAccountId: 'google-account-1',
    }, {
      getCurrentUserId: async () => null,
      saveSession: async () => {},
    })

    expect(getResponseHeader(event, 'location')).toBe('/auth?error=email-in-use')
  })

  it('redirects with email-required when the provider sends no email', async () => {
    const event = createOAuthEvent()

    await completeOAuthLogin(event, { ...profile, email: '' }, {
      getCurrentUserId: async () => null,
      saveSession: async () => {},
    })

    expect(getResponseHeader(event, 'location')).toBe('/auth?error=email-required')
  })
})
