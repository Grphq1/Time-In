import type { UserProfile } from '~/utils/profile'
import { reviveUserProfile } from '~/utils/profile'

export const useGetProfile = () =>
  useApiFetch<UserProfile>('/api/profile', {
    key: 'profile',
    server: false,
    lazy: true,
    transform: reviveUserProfile,
  })
