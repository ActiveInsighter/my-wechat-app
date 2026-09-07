import { request } from './request'
import type { UserProfile } from '@/stores/user'

export function fetchCurrentUser() {
  return request<UserProfile>({
    url: '/user/profile',
    method: 'GET',
  })
}
