import type { UserProfile } from '~/utils/profile'
import { reviveUserProfile } from '~/utils/profile'

export const useGetProfile = () => {
  return useFetch<UserProfile>('/api/profile', {
    key: 'profile',
    method: 'GET',
    server: false,
    lazy: true,
    transform: reviveUserProfile,
  })
}
