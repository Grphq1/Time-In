import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AuthPage from '../../app/pages/auth.vue'

describe('auth page', () => {
  it('shows a specific message for an account already linked elsewhere', async () => {
    const wrapper = await mountSuspended(AuthPage, { route: '/auth?error=account-linked' })

    expect(wrapper.text()).toContain('Could not sign in')
    expect(wrapper.text()).toContain('already linked to another user')
  })

  it('shows the session expired message', async () => {
    const wrapper = await mountSuspended(AuthPage, { route: '/auth?error=session-missing' })

    expect(wrapper.text()).toContain('Your session is no longer valid')
  })

  it('shows a generic message for an unknown error code', async () => {
    const wrapper = await mountSuspended(AuthPage, { route: '/auth?error=unknown' })

    expect(wrapper.text()).toContain('We could not sign you in')
  })

  it('shows no error when none is provided', async () => {
    const wrapper = await mountSuspended(AuthPage, { route: '/auth' })

    expect(wrapper.text()).not.toContain('Could not sign in')
    expect(wrapper.text()).toContain('Continue with Google')
    expect(wrapper.text()).toContain('Continue with GitHub')
  })
})
