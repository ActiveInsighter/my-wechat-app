import { describe, expect, it } from 'vitest'
import {
  canEditTask,
  normalizeBaseUrl,
  normalizeQueueText,
  progressText,
  taskStatusLabel,
  toRepublishInput,
} from '../src/features/dispatch/model'
import type { DispatchTaskRecord } from '../src/features/dispatch/types'

function task(overrides: Partial<DispatchTaskRecord> = {}): DispatchTaskRecord {
  return {
    id: 'task1',
    owner: 'owner1',
    title: '测试任务',
    queueText: '@task=测试\n@event=0907',
    queueChecksum: '',
    executionMode: 'serial',
    maxConcurrency: 1,
    executionSettings: {},
    status: 'draft',
    requestedAction: 'none',
    commandVersion: 0,
    totalEvents: 0,
    completedEvents: 0,
    lastError: '',
    created: '2026-09-07 00:00:00.000Z',
    updated: '2026-09-07 00:00:00.000Z',
    ...overrides,
  }
}

describe('dispatch model', () => {
  it('normalizes PocketBase URLs and queue line endings', () => {
    expect(normalizeBaseUrl(' https://pb.example.com/// ')).toBe('https://pb.example.com')
    expect(normalizeQueueText('a\r\nb\rc')).toBe('a\nb\nc')
  })

  it('only allows draft task body edits', () => {
    expect(canEditTask(task())).toBe(true)
    expect(canEditTask(task({ status: 'queued' }))).toBe(false)
  })

  it('formats status and progress', () => {
    expect(taskStatusLabel('running')).toBe('执行中')
    expect(progressText(task({ totalEvents: 4, completedEvents: 2 }))).toBe('2/4')
    expect(progressText(task())).toBe('等待调度')
  })

  it('republishes terminal tasks as a new queued task', () => {
    const input = toRepublishInput(task({
      status: 'failed',
      executionMode: 'parallel',
      maxConcurrency: 3,
    }))
    expect(input.status).toBe('queued')
    expect(input.queueText).toContain('@task=测试')
    expect(input.maxConcurrency).toBe(3)
  })
})
