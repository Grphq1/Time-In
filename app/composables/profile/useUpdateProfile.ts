import type { UpdateProfileSchema } from '#shared/schemas/profile'
import type { UserProfile } from '~/utils/profile'
import { reviveUserProfile } from '~/utils/profile'

export const useUpdateProfile = () => {
  const pending = ref(false)
  const api = useApi()
  const { fetch: refreshSession } = useUserSession()

  const update = async (input: UpdateProfileSchema): Promise<UserProfile> => {
    pending.value = true

    try {
      const profile = await api<UserProfile>('/api/profile', {
        method: 'PATCH',
        body: input,
      })

      await refreshSession()

      return reviveUserProfile(profile)
    }
    finally {
      pending.value = false
    }
  }

  return {
    pending,
    update,
  }
}
