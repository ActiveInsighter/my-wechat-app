import { getStorage, STORAGE_KEYS } from '@/utils/storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export function request<T>(options: UniApp.RequestOptions): Promise<T> {
  const token = getStorage<string>(STORAGE_KEYS.token)
  const header = {
    ...(options.header || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: `${API_BASE_URL}${options.url}`,
      header,
      timeout: options.timeout || 10_000,
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data as T)
          return
        }

        reject(new Error(`Request failed with status ${response.statusCode}`))
      },
      fail: reject,
    })
  })
}
