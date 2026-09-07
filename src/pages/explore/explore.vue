<script setup lang="ts">
import { computed, ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import DispatchTaskCard from '@/components/DispatchTaskCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { republishDispatchTask } from '@/api/dispatch'
import type { DispatchTaskRecord, DispatchTaskStatus } from '@/features/dispatch/types'
import { useDispatchStore } from '@/stores/dispatch'
import { useWorkflowStore } from '@/stores/workflow'

type FilterKey = 'all' | DispatchTaskStatus

const workflowStore = useWorkflowStore()
const dispatchStore = useDispatchStore()
const filter = ref<FilterKey>('all')
const keyword = ref('')
const republishingId = ref('')

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'queued', label: '等待' },
  { key: 'running', label: '执行中' },
  { key: 'succeeded', label: '完成' },
  { key: 'failed', label: '失败' },
]

const filteredTasks = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return dispatchStore.tasks.filter((task) => {
    const statusMatched = filter.value === 'all' || task.status === filter.value
    const keywordMatched = !query || `${task.title}\n${task.queueText}`.toLowerCase().includes(query)
    return statusMatched && keywordMatched
  })
})

async function refresh(showError = true) {
  if (!workflowStore.session) return
  try {
    await dispatchStore.refresh(workflowStore.session)
  } catch (error) {
    if (showError) {
      uni.showToast({
        title: error instanceof Error ? error.message : '刷新失败',
        icon: 'none',
      })
    }
  }
}

function openSettings() {
  uni.switchTab({ url: '/pages/profile/profile' })
}

function createTask() {
  if (!workflowStore.isConnected) {
    openSettings()
    return
  }
  uni.navigateTo({ url: '/pages/task-editor/task-editor' })
}

function openTask(task: DispatchTaskRecord) {
  uni.navigateTo({ url: `/pages/task-editor/task-editor?id=${encodeURIComponent(task.id)}` })
}

async function republish(task: DispatchTaskRecord) {
  if (!workflowStore.session || republishingId.value) return
  republishingId.value = task.id
  try {
    const created = await republishDispatchTask(workflowStore.session, task)
    dispatchStore.upsert(created)
    uni.showToast({ title: '已重新发布', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '重新发布失败',
      icon: 'none',
    })
  } finally {
    republishingId.value = ''
  }
}

onShow(() => {
  void refresh(false)
})

onPullDownRefresh(async () => {
  await refresh()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="content-wrap queue-page">
        <view class="header">
          <view>
            <text class="eyebrow">ANYWORKFLOW QUEUE</text>
            <text class="page-title">任务队列</text>
            <text class="page-description">在手机上写提示词、保存草稿并发布到电脑执行。</text>
          </view>
          <button class="create-button" @tap="createTask">
            <uni-icons type="plusempty" size="20" color="#FFFFFF" />
          </button>
        </view>

        <view v-if="!workflowStore.isConnected" class="connect-card">
          <text class="connect-card__title">先连接 AnyWorkflow</text>
          <text class="connect-card__description">使用 aw_clients 普通账户登录 PocketBase 后，即可同步你的云端任务。</text>
          <button class="primary-button" @tap="openSettings">去连接</button>
        </view>

        <template v-else>
          <uni-search-bar
            v-model="keyword"
            class="search-bar"
            radius="16"
            placeholder="搜索标题或提示词"
            cancel-text=""
          />

          <scroll-view class="filter-scroll" scroll-x>
            <view class="filter-row">
              <button
                v-for="item in filters"
                :key="item.key"
                class="filter-chip"
                :class="{ active: filter === item.key }"
                @tap="filter = item.key"
              >
                {{ item.label }}
              </button>
            </view>
          </scroll-view>

          <view v-if="dispatchStore.loading && !dispatchStore.loaded" class="loading-block">
            <text>正在同步任务…</text>
          </view>

          <view v-else-if="filteredTasks.length" class="task-list">
            <DispatchTaskCard
              v-for="task in filteredTasks"
              :key="task.id"
              :task="task"
              @open="openTask"
              @republish="republish"
            />
          </view>

          <EmptyState
            v-else
            title="还没有匹配的任务"
            description="可以先写一条草稿，确认后再发布执行。"
            action-text="新建任务"
            @action="createTask"
          />
        </template>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.queue-page {
  padding-top: 32rpx;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.header > view {
  display: flex;
  flex: 1;
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
  font-size: 42rpx;
  font-weight: 700;
}

.page-description {
  color: $color-text-secondary;
  font-size: 23rpx;
  line-height: 1.55;
}

.create-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin: 6rpx 0 0;
  padding: 0;
  background: $color-primary;
  border-radius: 50%;
}

.connect-card {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 28rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-lg;
}

.connect-card__title {
  color: $color-text;
  font-size: 30rpx;
  font-weight: 700;
}

.connect-card__description {
  color: $color-text-secondary;
  font-size: 23rpx;
  line-height: 1.6;
}

.primary-button {
  margin: 8rpx 0 0;
  padding: 18rpx 24rpx;
  color: #fff;
  background: $color-primary;
  border-radius: $radius-pill;
  font-size: 24rpx;
}

.search-bar {
  margin: 0 -18rpx 20rpx;
}

.filter-scroll {
  margin-bottom: 28rpx;
  white-space: nowrap;
}

.filter-row {
  display: flex;
  gap: 12rpx;
}

.filter-chip {
  flex: 0 0 auto;
  margin: 0;
  padding: 12rpx 20rpx;
  color: $color-text-secondary;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-pill;
  font-size: 22rpx;
  line-height: 1.2;
}

.filter-chip.active {
  color: #fff;
  background: $color-primary;
  border-color: $color-primary;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 36rpx;
}

.loading-block {
  padding: 70rpx 0;
  color: $color-text-muted;
  font-size: 24rpx;
  text-align: center;
}
</style>
