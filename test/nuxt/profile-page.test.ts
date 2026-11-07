import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ProfilePage from '../../app/pages/profile.vue'

const mockProfile = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  avatarUrl: null,
  visibility: 'public',
  createdAt: new Date('2026-10-01T09:00:00.000Z'),
}

mockNuxtImport('useGetProfile', () => () => ({
  data: ref(mockProfile),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn(),
}))

mockNuxtImport('useUpdateProfile', () => () => ({
  pending: ref(false),
  update: vi.fn(),
}))

mockNuxtImport('useToast', () => () => ({
  add: vi.fn(),
}))

describe('profile page', () => {
  it('shows the current profile and editable fields', async () => {
    const wrapper = await mountSuspended(ProfilePage)

    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Ada Lovelace')
    expect(wrapper.text()).toContain('ada@example.com')
    expect(wrapper.text()).toContain('Identity')
    expect(wrapper.text()).toContain('Display name')
    expect(wrapper.text()).toContain('Profile picture')
    expect(wrapper.text()).toContain('Upload a new photo')
    expect(wrapper.text()).toContain('Save changes')
  })
})
