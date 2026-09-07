import { defineStore } from 'pinia'
import { getStorage, removeStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'

export interface UserProfile {
  nickname: string
  avatarUrl?: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getStorage<string>(STORAGE_KEYS.token),
    profile: getStorage<UserProfile>(STORAGE_KEYS.profile),
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.profile?.nickname || '微信用户',
  },
  actions: {
    setToken(token: string) {
      this.token = token
      setStorage(STORAGE_KEYS.token, token)
    },
    setProfile(profile: UserProfile) {
      this.profile = profile
      setStorage(STORAGE_KEYS.profile, profile)
    },
    logout() {
      this.token = null
      this.profile = null
      removeStorage(STORAGE_KEYS.token)
      removeStorage(STORAGE_KEYS.profile)
    },
  },
})
