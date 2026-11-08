import { createEvent, getResponseHeader } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { describe, expect, it } from 'vitest'
import { withOAuthErrorRedirect } from '../../server/features/auth/infrastructure/oauth-route'

const createOAuthEvent = () => {
  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.method = 'GET'
  req.url = '/auth/google'
  const res = new ServerResponse(req)
  return createEvent(req, res)
}

describe('withOAuthErrorRedirect', () => {
  it('redirects to the auth page when the provider handler throws', async () => {
    const event = createOAuthEvent()
    const handler = withOAuthErrorRedirect('google', async () => {
      throw new Error('fetch failed')
    })

    await handler(event)

    expect(getResponseHeader(event, 'location')).toBe('/auth?error=google')
  })

  it('returns the handler result when nothing throws', async () => {
    const event = createOAuthEvent()
    const handler = withOAuthErrorRedirect('google', async () => 'ok')

    await expect(handler(event)).resolves.toBe('ok')
  })
})
