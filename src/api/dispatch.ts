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
const ACTION_URL = '/api/anyworkflow/dispatch/tasks'

function configurationPayload(input: DispatchTaskInput) {
  return {
    title: input.title.trim() || '云端任务',
    queueText: normalizeQueueText(input.queueText),
    executionMode: input.executionMode,
    maxConcurrency: input.executionMode === 'serial'
      ? 1
      : Math.min(16, Math.max(1, Math.trunc(input.maxConcurrency || 1))),
    executionSettings: input.executionSettings || {},
  }
}

function taskPayload(session: WorkflowSession, input: DispatchTaskCreateInput) {
  return {
    owner: session.ownerId,
    ...configurationPayload(input),
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
    url: `${ACTION_URL}/${encodeURIComponent(taskId)}/draft`,
    method: 'POST',
    token: session.token,
    data: configurationPayload(input),
  })
}

export async function publishDraftTask(
  session: WorkflowSession,
  task: DispatchTaskRecord,
  input: DispatchTaskInput,
): Promise<DispatchTaskRecord> {
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${ACTION_URL}/${encodeURIComponent(task.id)}/publish`,
    method: 'POST',
    token: session.token,
    data: configurationPayload(input),
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
  return pocketBaseRequest({
    baseUrl: session.baseUrl,
    url: `${ACTION_URL}/${encodeURIComponent(task.id)}/command`,
    method: 'POST',
    token: session.token,
    data: { action },
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
