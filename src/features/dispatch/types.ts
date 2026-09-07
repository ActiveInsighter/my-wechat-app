export type DispatchExecutionMode = 'serial' | 'parallel'

export type DispatchTaskStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled'

export type DispatchRequestedAction = 'none' | 'pause' | 'resume' | 'cancel'

export interface PocketBaseListResponse<T> {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: T[]
}

export interface PocketBaseAuthRecord {
  id: string
  collectionId: string
  collectionName: string
  email?: string
  name?: string
  username?: string
  verified?: boolean
}

export interface PocketBaseAuthResponse {
  token: string
  record: PocketBaseAuthRecord
}

export interface WorkflowSession {
  baseUrl: string
  ownerId: string
  token: string
  email: string
  name?: string
}

export interface DispatchTaskRecord {
  id: string
  owner: string
  title: string
  queueText: string
  queueChecksum: string
  executionMode: DispatchExecutionMode
  maxConcurrency: number
  executionSettings: Record<string, unknown>
  status: DispatchTaskStatus
  requestedAction: DispatchRequestedAction
  commandVersion: number
  totalEvents: number
  completedEvents: number
  lastError: string
  startedAt?: string
  endedAt?: string
  created: string
  updated: string
}

export interface DispatchTaskInput {
  title: string
  queueText: string
  executionMode: DispatchExecutionMode
  maxConcurrency: number
  executionSettings?: Record<string, unknown>
}

export interface DispatchTaskCreateInput extends DispatchTaskInput {
  status: 'draft' | 'queued'
}
