import { pocketBaseRequest } from './pocketbase'
import type {
  DispatchRequestedAction,
  DispatchTaskCreateInput,
  DispatchTaskInput,
  DispatchTaskRecord,
  PocketBaseListResponse,
  WorkflowSession,
} from '@/features/dispatch/types'
import { normalizeQueueText, toRepublishInput } from '@/features/dispatch/model'

const COLLECTION_URL = '/api/collections/aw_dispatch_tasks/records'

function taskPayload(session: WorkflowSession, input: DispatchTaskCreateInput) {
  return {
    owner: session.ownerId,
    title: input.title.trim() || '云端任务',
    queueText: normalizeQueueText(input.queueText),
    executionMode: input.executionMode,
    maxConcurrency: input.executionMode === 'serial'
      ? 1
      : Math.min(16, Math.max(1, Math.trunc(input.maxConcurrency || 1))),
    executionSettings: input.executionSettings || {},
    status: input.status,
    requestedAction: 'none',
    commandVersion: 0,
    totalEvents: 0,
    completedEvents: 0,
    lastError: '',
  }
}

export async function listDispatchTasks(
  session: WorkflowSession,
  page = 1,
  perPage = 50,
): Promise<PocketBaseListResponse<DispatchTaskRecord>> {
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: COLLECTION_URL,
    token: session.token,
    data: {
      page,
      perPage,
      sort: '-updated',
    },
  })
}

export async function getDispatchTask(
  session: WorkflowSession,
  taskId: string,
): Promise<DispatchTaskRecord> {
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${COLLECTION_URL}/${encodeURIComponent(taskId)}`,
    token: session.token,
  })
}

export async function createDispatchTask(
  session: WorkflowSession,
  input: DispatchTaskCreateInput,
): Promise<DispatchTaskRecord> {
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: COLLECTION_URL,
    method: 'POST',
    token: session.token,
    data: taskPayload(session, input),
  })
}

export async function updateDraftTask(
  session: WorkflowSession,
  taskId: string,
  input: DispatchTaskInput,
): Promise<DispatchTaskRecord> {
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${COLLECTION_URL}/${encodeURIComponent(taskId)}`,
    method: 'PATCH',
    token: session.token,
    data: {
      title: input.title.trim() || '云端任务',
      queueText: normalizeQueueText(input.queueText),
      executionMode: input.executionMode,
      maxConcurrency: input.executionMode === 'serial'
        ? 1
        : Math.min(16, Math.max(1, Math.trunc(input.maxConcurrency || 1))),
      executionSettings: input.executionSettings || {},
    },
  })
}

export async function publishDraftTask(
  session: WorkflowSession,
  task: DispatchTaskRecord,
  input: DispatchTaskInput,
): Promise<DispatchTaskRecord> {
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${COLLECTION_URL}/${encodeURIComponent(task.id)}`,
    method: 'PATCH',
    token: session.token,
    data: {
      title: input.title.trim() || '云端任务',
      queueText: normalizeQueueText(input.queueText),
      executionMode: input.executionMode,
      maxConcurrency: input.executionMode === 'serial'
        ? 1
        : Math.min(16, Math.max(1, Math.trunc(input.maxConcurrency || 1))),
      executionSettings: input.executionSettings || {},
      status: 'queued',
      requestedAction: 'none',
      commandVersion: task.commandVersion + 1,
    },
  })
}

export async function cloneDispatchTaskAsDraft(
  session: WorkflowSession,
  task: DispatchTaskRecord,
): Promise<DispatchTaskRecord> {
  const input = toRepublishInput(task)
  return createDispatchTask(session, {
    ...input,
    status: 'draft',
    executionSettings: {
      ...input.executionSettings,
      source: 'wechat-miniapp',
      clonedFromTaskId: task.id,
    },
  })
}

export async function republishDispatchTask(
  session: WorkflowSession,
  task: DispatchTaskRecord,
): Promise<DispatchTaskRecord> {
  return createDispatchTask(session, toRepublishInput(task))
}

export async function requestDispatchAction(
  session: WorkflowSession,
  task: DispatchTaskRecord,
  action: Exclude<DispatchRequestedAction, 'none'>,
): Promise<DispatchTaskRecord> {
  const status = action === 'resume'
    ? (task.status === 'draft' ? 'queued' : 'running')
    : task.status

  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${COLLECTION_URL}/${encodeURIComponent(task.id)}`,
    method: 'PATCH',
    token: session.token,
    data: {
      requestedAction: action,
      commandVersion: task.commandVersion + 1,
      status,
    },
  })
}

export async function deleteDraftTask(session: WorkflowSession, taskId: string): Promise<void> {
  await pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${COLLECTION_URL}/${encodeURIComponent(taskId)}`,
    method: 'DELETE',
    token: session.token,
  })
}
