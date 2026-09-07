import { defineStore } from 'pinia'
import {
  getStorage,
  removeStorage,
  setStorage,
  STORAGE_KEYS,
} from '@/utils/storage'
import type { WorkflowSession } from '@/features/dispatch/types'
import { loginPocketBase, validatePocketBaseSession } from '@/api/pocketbase'

const DEFAULT_BASE_URL = import.meta.env.VITE_POCKETBASE_URL || import.meta.env.VITE_API_BASE_URL || ''

interface WorkflowState {
  session: WorkflowSession | null
  baseUrlDraft: string
  validating: boolean
}

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowState => {
    const session = getStorage<WorkflowSession>(STORAGE_KEYS.workflowSession)
    return {
      session,
      baseUrlDraft: session?.baseUrl || DEFAULT_BASE_URL,
      validating: false,
    }
  },
  getters: {
    isConnected: (state) => Boolean(state.session?.token && state.session?.ownerId),
    ownerId: (state) => state.session?.ownerId || '',
    displayName: (state) => state.session?.name || state.session?.email || '未连接',
  },
  actions: {
    async login(baseUrl: string, email: string, password: string) {
      const session = await loginPocketBase(baseUrl, email, password)
      this.session = session
      this.baseUrlDraft = session.baseUrl
      setStorage(STORAGE_KEYS.workflowSession, session)
      return session
    },
    async validate() {
      if (!this.session) return false
      this.validating = true
      try {
        await validatePocketBaseSession(this.session)
        return true
      } finally {
        this.validating = false
      }
    },
    logout() {
      this.session = null
      removeStorage(STORAGE_KEYS.workflowSession)
    },
  },
})
