import { defineStore } from 'pinia'
import { listDispatchTasks } from '@/api/dispatch'
import type { DispatchTaskRecord, WorkflowSession } from '@/features/dispatch/types'

interface DispatchState {
  tasks: DispatchTaskRecord[]
  loading: boolean
  loaded: boolean
  errorMessage: string
}

export const useDispatchStore = defineStore('dispatch', {
  state: (): DispatchState => ({
    tasks: [],
    loading: false,
    loaded: false,
    errorMessage: '',
  }),
  getters: {
    draftCount: (state) => state.tasks.filter((task) => task.status === 'draft').length,
    activeCount: (state) => state.tasks.filter((task) => ['queued', 'running'].includes(task.status)).length,
    failedCount: (state) => state.tasks.filter((task) => task.status === 'failed').length,
  },
  actions: {
    async refresh(session: WorkflowSession) {
      if (this.loading) return
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await listDispatchTasks(session)
        this.tasks = response.items
        this.loaded = true
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : '任务列表加载失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    upsert(task: DispatchTaskRecord) {
      const index = this.tasks.findIndex((item) => item.id === task.id)
      if (index === -1) this.tasks.unshift(task)
      else this.tasks.splice(index, 1, task)
    },
    remove(taskId: string) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId)
    },
    clear() {
      this.tasks = []
      this.loaded = false
      this.errorMessage = ''
    },
  },
})
