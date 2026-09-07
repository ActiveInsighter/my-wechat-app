import type {
  DispatchTaskCreateInput,
  DispatchTaskRecord,
  DispatchTaskStatus,
} from './types'

const STATUS_LABELS: Record<DispatchTaskStatus, string> = {
  draft: '草稿',
  queued: '等待执行',
  running: '执行中',
  succeeded: '已完成',
  failed: '失败',
  canceled: '已取消',
}

export function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/u, '')
}

export function normalizeQueueText(value: string): string {
  return value.replace(/\r\n?/gu, '\n')
}

export function taskStatusLabel(status: DispatchTaskStatus): string {
  return STATUS_LABELS[status]
}

export function canEditTask(task: Pick<DispatchTaskRecord, 'status'>): boolean {
  return task.status === 'draft'
}

export function isActiveTask(task: Pick<DispatchTaskRecord, 'status'>): boolean {
  return task.status === 'queued' || task.status === 'running'
}

export function isTerminalTask(task: Pick<DispatchTaskRecord, 'status'>): boolean {
  return ['succeeded', 'failed', 'canceled'].includes(task.status)
}

export function progressText(task: Pick<DispatchTaskRecord, 'totalEvents' | 'completedEvents'>): string {
  if (task.totalEvents <= 0) return '等待调度'
  return `${Math.min(task.completedEvents, task.totalEvents)}/${task.totalEvents}`
}

export function toRepublishInput(task: DispatchTaskRecord): DispatchTaskCreateInput {
  return {
    title: task.title,
    queueText: task.queueText,
    executionMode: task.executionMode,
    maxConcurrency: task.executionMode === 'serial' ? 1 : Math.max(1, task.maxConcurrency),
    executionSettings: task.executionSettings || {},
    status: 'queued',
  }
}
