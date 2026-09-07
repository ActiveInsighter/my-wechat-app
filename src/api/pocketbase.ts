import type {
  PocketBaseAuthResponse,
  WorkflowSession,
} from '@/features/dispatch/types'
import { normalizeBaseUrl } from '@/features/dispatch/model'

export class PocketBaseRequestError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly responseData?: unknown,
  ) {
    super(message)
    this.name = 'PocketBaseRequestError'
  }
}

interface PocketBaseRequestOptions {
  baseUrl: string
  url: string
  method?: UniApp.RequestOptions['method']
  data?: UniApp.RequestOptions['data']
  token?: string
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

export function pocketBaseRequest<T>(options: PocketBaseRequestOptions): Promise<T> {
  const baseUrl = normalizeBaseUrl(options.baseUrl)
  if (!baseUrl) return Promise.reject(new PocketBaseRequestError(0, '请先配置 PocketBase 地址'))

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: 15_000,
      header: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: options.token } : {}),
      },
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data as T)
          return
        }
        reject(
          new PocketBaseRequestError(
            response.statusCode,
            errorMessage(response.data, `PocketBase 请求失败 (${response.statusCode})`),
            response.data,
          ),
        )
      },
      fail: (error) => {
        reject(new PocketBaseRequestError(0, error.errMsg || '无法连接 PocketBase'))
      },
    })
  })
}

export async function loginPocketBase(
  baseUrl: string,
  email: string,
  password: string,
): Promise<WorkflowSession> {
  const response = await pocketBaseRequest<PocketBaseAuthResponse>({
    baseUrl,
    url: '/api/collections/aw_clients/auth-with-password',
    method: 'POST',
    data: {
      identity: email.trim(),
      password,
    },
  })

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    ownerId: response.record.id,
    token: response.token,
    email: response.record.email || email.trim(),
    name: response.record.name,
  }
}

export async function validatePocketBaseSession(session: WorkflowSession): Promise<void> {
  await pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `/api/collections/aw_clients/records/${encodeURIComponent(session.ownerId)}`,
    token: session.token,
  })
}
