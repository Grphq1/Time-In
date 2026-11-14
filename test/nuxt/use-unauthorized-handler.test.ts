import { flushPromises } from '@vue/test-utils'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted, ref } from 'vue'
import { AppError } from '#shared/errors'
import { useApi } from '../../app/composables/useApi'
import { useUnauthorizedHandler } from '../../app/composables/useUnauthorizedHandler'

const mocks = vi.hoisted(() => ({
  clear: vi.fn(),
  fetcher: vi.fn(),
  navigateTo: vi.fn(),
}))

mockNuxtImport('useUserSession', () => () => ({ clear: mocks.clear }))
mockNuxtImport('useRequestFetch', () => () => mocks.fetcher)
mockNuxtImport('navigateTo', () => mocks.navigateTo)

beforeEach(() => {
  mocks.clear.mockReset().mockResolvedValue(undefined)
  mocks.fetcher.mockReset()
  mocks.navigateTo.mockReset().mockResolvedValue(undefined)
})

async function runHandler(cause: unknown) {
  const handled = ref<boolean | null>(null)

  const Probe = defineComponent({
    setup() {
      const handleUnauthorized = useUnauthorizedHandler()

      onMounted(async () => {
        handled.value = await handleUnauthorized(cause)
      })

      return () => h('div')
    },
  })

  await mountSuspended(Probe)
  await flushPromises()

  return handled.value
}

describe('useUnauthorizedHandler', () => {
  it('clears the session and redirects to sign in on 401', async () => {
    const handled = await runHandler(new AppError({ kind: 'auth', statusCode: 401 }))

    expect(handled).toBe(true)
    expect(mocks.clear).toHaveBeenCalledOnce()
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth?error=session-missing')
  })

  it('handles a raw fetch response with status 401', async () => {
    const handled = await runHandler({ status: 401 })

    expect(handled).toBe(true)
    expect(mocks.clear).toHaveBeenCalledOnce()
  })

  it('leaves 403 responses alone', async () => {
    const handled = await runHandler(new AppError({ kind: 'auth', statusCode: 403 }))

    expect(handled).toBe(false)
    expect(mocks.clear).not.toHaveBeenCalled()
    expect(mocks.navigateTo).not.toHaveBeenCalled()
  })

  it('is applied by useApi before the error reaches the caller', async () => {
    mocks.fetcher.mockRejectedValueOnce({ status: 401 })
    const thrown = ref<unknown>(null)

    const Probe = defineComponent({
      setup() {
        const api = useApi()

        onMounted(async () => {
          try {
            await api('/api/profile')
          }
          catch (cause) {
            thrown.value = cause
          }
        })

        return () => h('div')
      },
    })

    await mountSuspended(Probe)
    await flushPromises()

    expect(mocks.clear).toHaveBeenCalledOnce()
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth?error=session-missing')
    expect((thrown.value as AppError).statusCode).toBe(401)
  })
})
