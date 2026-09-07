<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  createDispatchTask,
  getDispatchTask,
  publishDraftTask,
  republishDispatchTask,
  requestDispatchAction,
  updateDraftTask,
} from '@/api/dispatch'
import type {
  DispatchExecutionMode,
  DispatchTaskRecord,
} from '@/features/dispatch/types'
import { canEditTask, taskStatusLabel } from '@/features/dispatch/model'
import { useDispatchStore } from '@/stores/dispatch'
import { useWorkflowStore } from '@/stores/workflow'

const workflowStore = useWorkflowStore()
const dispatchStore = useDispatchStore()

const taskId = ref('')
const task = ref<DispatchTaskRecord | null>(null)
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  queueText: '',
  executionMode: 'serial' as DispatchExecutionMode,
  maxConcurrency: 1,
})

const isExisting = computed(() => Boolean(task.value))
const isEditable = computed(() => !task.value || canEditTask(task.value))
const statusLabel = computed(() => task.value ? taskStatusLabel(task.value.status) : '新任务')
const canRepublish = computed(() =>
  Boolean(task.value && ['succeeded', 'failed', 'canceled'].includes(task.value.status)),
)
const canPause = computed(() =>
  Boolean(task.value && ['queued', 'running'].includes(task.value.status) && ['none', 'resume'].includes(task.value.requestedAction)),
)
const canResume = computed(() =>
  Boolean(task.value && task.value.requestedAction === 'pause'),
)
const canCancel = computed(() =>
  Boolean(task.value && ['queued', 'running'].includes(task.value.status) && task.value.requestedAction !== 'cancel'),
)

function requireSession() {
  if (!workflowStore.session) {
    uni.showToast({ title: '请先连接 AnyWorkflow', icon: 'none' })
    return null
  }
  return workflowStore.session
}

function fillForm(record: DispatchTaskRecord) {
  form.title = record.title || ''
  form.queueText = record.queueText || ''
  form.executionMode = record.executionMode
  form.maxConcurrency = record.executionMode === 'serial' ? 1 : record.maxConcurrency
}

async function loadTask() {
  const session = requireSession()
  if (!session || !taskId.value) return
  loading.value = true
  try {
    const record = await getDispatchTask(session, taskId.value)
    task.value = record
    fillForm(record)
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '任务加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

function validateForm(): boolean {
  if (!form.queueText.trim()) {
    uni.showToast({ title: '请输入提示词或消息队列', icon: 'none' })
    return false
  }
  if (form.queueText.length > 768 * 1024) {
    uni.showToast({ title: '队列内容超过后端上限', icon: 'none' })
    return false
  }
  return true
}

function payload() {
  return {
    title: form.title,
    queueText: form.queueText,
    executionMode: form.executionMode,
    maxConcurrency: form.executionMode === 'serial' ? 1 : form.maxConcurrency,
    executionSettings: { source: 'wechat-miniapp' },
  }
}

async function saveDraft() {
  if (!validateForm() || saving.value) return
  const session = requireSession()
  if (!session) return

  saving.value = true
  try {
    let saved: DispatchTaskRecord
    if (task.value) {
      if (!canEditTask(task.value)) {
        uni.showToast({ title: '已发布任务不可修改，请重新发布', icon: 'none' })
        return
      }
      saved = await updateDraftTask(session, task.value.id, payload())
    } else {
      saved = await createDispatchTask(session, {
        ...payload(),
        status: 'draft',
      })
    }
    task.value = saved
    taskId.value = saved.id
    dispatchStore.upsert(saved)
    uni.showToast({ title: '草稿已保存', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '保存失败',
      icon: 'none',
    })
  } finally {
    saving.value = false
  }
}

async function publish() {
  if (!validateForm() || saving.value) return
  const session = requireSession()
  if (!session) return

  saving.value = true
  try {
    let published: DispatchTaskRecord
    if (task.value) {
      if (!canEditTask(task.value)) {
        published = await republishDispatchTask(session, task.value)
      } else {
        published = await publishDraftTask(session, task.value, payload())
      }
    } else {
      published = await createDispatchTask(session, {
        ...payload(),
        status: 'queued',
      })
    }
    task.value = published
    taskId.value = published.id
    fillForm(published)
    dispatchStore.upsert(published)
    uni.showToast({ title: '已发布到电脑', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '发布失败',
      icon: 'none',
    })
  } finally {
    saving.value = false
  }
}

async function republish() {
  if (!task.value || saving.value) return
  const session = requireSession()
  if (!session) return
  saving.value = true
  try {
    const created = await republishDispatchTask(session, task.value)
    dispatchStore.upsert(created)
    task.value = created
    taskId.value = created.id
    fillForm(created)
    uni.showToast({ title: '已重新发布', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '重新发布失败',
      icon: 'none',
    })
  } finally {
    saving.value = false
  }
}

async function command(action: 'pause' | 'resume' | 'cancel') {
  if (!task.value || saving.value) return
  const session = requireSession()
  if (!session) return
  saving.value = true
  try {
    const updated = await requestDispatchAction(session, task.value, action)
    task.value = updated
    dispatchStore.upsert(updated)
    const labels = { pause: '已请求暂停', resume: '已请求继续', cancel: '已请求取消' }
    uni.showToast({ title: labels[action], icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '操作失败',
      icon: 'none',
    })
  } finally {
    saving.value = false
  }
}

function chooseMode(event: { detail: { value: string | number } }) {
  form.executionMode = Number(event.detail.value) === 1 ? 'parallel' : 'serial'
  if (form.executionMode === 'serial') form.maxConcurrency = 1
}

onLoad((query) => {
  taskId.value = typeof query?.id === 'string' ? query.id : ''
  if (taskId.value) void loadTask()
})
</script>

<template>
  <view class="page editor-page">
    <scroll-view class="editor-scroll" scroll-y>
      <view class="content-wrap editor-content">
        <view class="editor-header">
          <view>
            <text class="eyebrow">PROMPT QUEUE</text>
            <text class="page-title">{{ isExisting ? '任务详情' : '新建任务' }}</text>
          </view>
          <text class="status-pill">{{ statusLabel }}</text>
        </view>

        <view v-if="loading" class="loading-block">正在加载…</view>

        <template v-else>
          <view class="field">
            <text class="field-label">标题</text>
            <input
              v-model="form.title"
              class="text-input"
              placeholder="例如：数学补充知识"
              :disabled="!isEditable"
              maxlength="512"
            />
          </view>

          <view class="field">
            <view class="field-heading">
              <text class="field-label">提示词 / 消息队列</text>
              <text class="field-count">{{ form.queueText.length }} 字符</text>
            </view>
            <textarea
              v-model="form.queueText"
              class="queue-input"
              placeholder="@task=任务名&#10;@event=事件名&#10;@act {&#10;  https://chatgpt.com/&#10;  {你的提示词}&#10;}"
              :disabled="!isEditable"
              :maxlength="786432"
              auto-height
            />
            <text class="field-help">
              整段文本直接写入 aw_dispatch_tasks.queueText；发布后由现有调度链路唤醒电脑执行。
            </text>
          </view>

          <view class="field">
            <text class="field-label">执行模式</text>
            <picker
              :value="form.executionMode === 'parallel' ? 1 : 0"
              :range="['串行', '并行']"
              :disabled="!isEditable"
              @change="chooseMode"
            >
              <view class="picker-field">
                <text>{{ form.executionMode === 'parallel' ? '并行' : '串行' }}</text>
                <uni-icons type="down" size="16" color="#8B928D" />
              </view>
            </picker>
          </view>

          <view v-if="form.executionMode === 'parallel'" class="field">
            <text class="field-label">最大并发（1–16）</text>
            <slider
              :value="form.maxConcurrency"
              min="1"
              max="16"
              show-value
              :disabled="!isEditable"
              @change="form.maxConcurrency = Number($event.detail.value)"
            />
          </view>

          <view v-if="task?.lastError" class="error-card">
            <text class="error-title">最近错误</text>
            <text class="error-text">{{ task.lastError }}</text>
          </view>

          <view v-if="isEditable" class="action-stack">
            <button class="secondary-button" :loading="saving" @tap="saveDraft">保存草稿</button>
            <button class="primary-button" :loading="saving" @tap="publish">保存并发布</button>
          </view>

          <view v-else class="action-stack">
            <button v-if="canRepublish" class="primary-button" :loading="saving" @tap="republish">
              重新发布为新任务
            </button>
            <view v-if="canPause || canResume || canCancel" class="control-row">
              <button v-if="canPause" class="secondary-button control-button" @tap="command('pause')">暂停</button>
              <button v-if="canResume" class="secondary-button control-button" @tap="command('resume')">继续</button>
              <button v-if="canCancel" class="danger-button control-button" @tap="command('cancel')">取消</button>
            </view>
            <text class="readonly-tip">已发布任务正文保持不可变；需要修改内容时请重新发布一条新任务。</text>
          </view>
        </template>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.editor-page {
  min-height: 100vh;
}

.editor-scroll {
  height: 100vh;
}

.editor-content {
  padding-top: 30rpx;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.editor-header,
.field-heading,
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.editor-header {
  margin-bottom: 34rpx;
}

.editor-header > view {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.eyebrow {
  color: $color-text-muted;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
}

.page-title {
  color: $color-primary;
  font-size: 40rpx;
  font-weight: 700;
}

.status-pill {
  padding: 8rpx 14rpx;
  color: $color-primary;
  background: $color-primary-soft;
  border-radius: $radius-pill;
  font-size: 21rpx;
}

.field {
  margin-bottom: 30rpx;
}

.field-label {
  display: block;
  margin-bottom: 12rpx;
  color: $color-text;
  font-size: 25rpx;
  font-weight: 650;
}

.field-heading .field-label {
  margin-bottom: 12rpx;
}

.field-count,
.field-help,
.readonly-tip {
  color: $color-text-muted;
  font-size: 20rpx;
}

.text-input,
.queue-input,
.picker-field {
  box-sizing: border-box;
  width: 100%;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.text-input,
.picker-field {
  min-height: 88rpx;
  padding: 0 22rpx;
  color: $color-text;
  font-size: 26rpx;
}

.picker-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.queue-input {
  min-height: 500rpx;
  padding: 22rpx;
  color: $color-text;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 24rpx;
  line-height: 1.62;
}

.field-help {
  display: block;
  margin-top: 12rpx;
  line-height: 1.55;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 42rpx;
}

.primary-button,
.secondary-button,
.danger-button {
  width: 100%;
  margin: 0;
  padding: 20rpx 24rpx;
  border-radius: $radius-md;
  font-size: 26rpx;
  font-weight: 650;
}

.primary-button {
  color: #fff;
  background: $color-primary;
}

.secondary-button {
  color: $color-primary;
  background: $color-surface;
  border: 1rpx solid $color-border;
}

.danger-button {
  color: #a75b55;
  background: #fff0ee;
  border: 1rpx solid #f1d7d3;
}

.control-button {
  flex: 1;
}

.readonly-tip {
  line-height: 1.55;
  text-align: center;
}

.error-card {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 22rpx;
  color: #8c4e49;
  background: #fff1ef;
  border: 1rpx solid #f0d8d5;
  border-radius: $radius-md;
}

.error-title {
  font-size: 24rpx;
  font-weight: 700;
}

.error-text {
  font-size: 22rpx;
  line-height: 1.55;
}

.loading-block {
  padding: 100rpx 0;
  color: $color-text-muted;
  text-align: center;
}
</style>
