export const STORAGE_KEYS = {
  token: 'my-wechat-app:token',
  profile: 'my-wechat-app:profile',
  workflowSession: 'my-wechat-app:workflow-session',
} as const

export function getStorage<T>(key: string): T | null {
  const value = uni.getStorageSync(key)
  return value === '' || value === null || value === undefined ? null : (value as T)
}

export function setStorage<T>(key: string, value: T): void {
  uni.setStorageSync(key, value)
}

export function removeStorage(key: string): void {
  uni.removeStorageSync(key)
}
