import type { UserProfile } from '~/utils/profile'
import { reviveUserProfile } from '~/utils/profile'

export const useUploadAvatar = () => {
  const pending = ref(false)
  const { fetch: refreshSession } = useUserSession()

  const upload = async (file: File): Promise<UserProfile> => {
    pending.value = true

    try {
      const form = new FormData()
      form.append('avatar', file)

      const profile = await $fetch<UserProfile>('/api/profile/avatar', {
        method: 'POST',
        body: form,
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
    upload,
  }
}
