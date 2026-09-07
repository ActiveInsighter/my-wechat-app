<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppSectionTitle from '@/components/AppSectionTitle.vue'
import DispatchTaskCard from '@/components/DispatchTaskCard.vue'
import { republishDispatchTask } from '@/api/dispatch'
import type { DispatchTaskRecord } from '@/features/dispatch/types'
import { useDispatchStore } from '@/stores/dispatch'
import { useWorkflowStore } from '@/stores/workflow'

const workflowStore = useWorkflowStore()
const dispatchStore = useDispatchStore()

const recentTasks = computed(() => dispatchStore.tasks.slice(0, 3))

const stats = computed(() => [
  { value: String(dispatchStore.draftCount), label: '草稿' },
  { value: String(dispatchStore.activeCount), label: '执行中' },
  { value: String(dispatchStore.failedCount), label: '失败' },
])

async function refresh(showToast = false) {
  if (!workflowStore.session) return
  try {
    await dispatchStore.refresh(workflowStore.session)
    if (showToast) uni.showToast({ title: '已同步', icon: 'success' })
  } catch (error) {
    if (showToast) {
      uni.showToast({
        title: error instanceof Error ? error.message : '同步失败',
        icon: 'none',
      })
    }
  }
}

function createTask() {
  if (!workflowStore.isConnected) {
    uni.switchTab({ url: '/pages/profile/profile' })
    return
  }
  uni.navigateTo({ url: '/pages/task-editor/task-editor' })
}

function openQueue() {
  uni.switchTab({ url: '/pages/explore/explore' })
}

function openSettings() {
  uni.switchTab({ url: '/pages/profile/profile' })
}

function openTask(task: DispatchTaskRecord) {
  uni.navigateTo({ url: `/pages/task-editor/task-editor?id=${encodeURIComponent(task.id)}` })
}

async function republish(task: DispatchTaskRecord) {
  if (!workflowStore.session) return
  try {
    const created = await republishDispatchTask(workflowStore.session, task)
    dispatchStore.upsert(created)
    uni.showToast({ title: '已重新发布', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '重新发布失败',
      icon: 'none',
    })
  }
}

onShow(() => {
  void refresh(false)
})
</script>

<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="content-wrap home-content">
        <view class="topbar">
          <view>
            <text class="eyebrow">ANYWORKFLOW REMOTE</text>
            <text class="brand-title">移动工作流控制台</text>
          </view>
          <button class="connection-button" @tap="openSettings">
            <view class="connection-dot" :class="{ online: workflowStore.isConnected }" />
            <text>{{ workflowStore.isConnected ? '已连接' : '未连接' }}</text>
          </button>
        </view>

        <view class="hero-card">
          <text class="hero-kicker">PROMPT → QUEUE → DESKTOP</text>
          <text class="hero-title">随时写提示词，<br />直接交给电脑执行。</text>
          <text class="hero-caption">
            {{ workflowStore.isConnected ? `当前账户：${workflowStore.displayName}` : '先连接 AnyWorkflow PocketBase 后端' }}
          </text>
          <button class="hero-action" @tap="createTask">
            <text>新建任务</text>
            <uni-icons type="arrow-right" size="16" color="#143B36" />
          </button>
          <view class="hero-orbit orbit-one" />
          <view class="hero-orbit orbit-two" />
        </view>

        <view class="stats-grid">
          <view v-for="stat in stats" :key="stat.label" class="stat-card">
            <text class="stat-value">{{ workflowStore.isConnected ? stat.value : '—' }}</text>
            <text class="stat-label">{{ stat.label }}</text>
          </view>
        </view>

        <AppSectionTitle title="快捷操作" subtitle="常用控制，一触即达" />
        <view class="quick-grid">
          <button class="quick-card" @tap="createTask">
            <uni-icons type="compose" size="23" color="#143B36" />
            <text class="quick-title">写提示词</text>
            <text class="quick-description">新建草稿或直接发布</text>
          </button>
          <button class="quick-card" @tap="openQueue">
            <uni-icons type="list" size="23" color="#143B36" />
            <text class="quick-title">任务队列</text>
            <text class="quick-description">查看状态与重新发布</text>
          </button>
          <button class="quick-card" @tap="refresh(true)">
            <uni-icons type="refresh" size="23" color="#143B36" />
            <text class="quick-title">同步状态</text>
            <text class="quick-description">刷新电脑端执行进度</text>
          </button>
          <button class="quick-card" @tap="openSettings">
            <uni-icons type="gear" size="23" color="#143B36" />
            <text class="quick-title">连接设置</text>
            <text class="quick-description">PocketBase 与账户</text>
          </button>
        </view>

        <template v-if="workflowStore.isConnected">
          <AppSectionTitle title="最近任务" subtitle="最近更新的三条任务" action-text="全部" @action="openQueue" />
          <view v-if="recentTasks.length" class="recent-list">
            <DispatchTaskCard
              v-for="task in recentTasks"
              :key="task.id"
              :task="task"
              @open="openTask"
              @republish="republish"
            />
          </view>
          <view v-else class="empty-card">
            <text class="empty-title">还没有云端任务</text>
            <text class="empty-description">从一条提示词开始，保存为草稿或直接发布。</text>
          </view>
        </template>

        <view v-else class="connect-card" @tap="openSettings">
          <view class="connect-icon">
            <uni-icons type="link" size="22" color="#143B36" />
          </view>
          <view class="connect-copy">
            <text class="connect-title">连接 AnyWorkflow</text>
            <text class="connect-description">登录 aw_clients 后同步你的 dispatch 任务。</text>
          </view>
          <uni-icons type="right" size="16" color="#A5AEA8" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.home-content {
  padding-top: 28rpx;
  padding-bottom: 48rpx;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.topbar > view {
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

.brand-title {
  color: $color-primary;
  font-size: 37rpx;
  font-weight: 700;
}

.connection-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 4rpx 0 0;
  padding: 10rpx 14rpx;
  color: $color-text-secondary;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-pill;
  font-size: 20rpx;
  line-height: 1.2;
}

.connection-dot {
  width: 12rpx;
  height: 12rpx;
  background: #c2c8c4;
  border-radius: 50%;
}

.connection-dot.online {
  background: $color-success;
}

.hero-card {
  position: relative;
  min-height: 330rpx;
  overflow: hidden;
  padding: 36rpx;
  background: $color-primary;
  border-radius: $radius-lg;
  box-shadow: 0 16rpx 40rpx rgba(20, 59, 54, 0.16);
}

.hero-kicker,
.hero-title,
.hero-caption,
.hero-action {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  display: block;
  color: rgba(255, 255, 255, 0.68);
  font-size: 20rpx;
  letter-spacing: 2rpx;
}

.hero-title {
  display: block;
  margin-top: 16rpx;
  color: #fff;
  font-size: 43rpx;
  font-weight: 700;
  line-height: 1.35;
}

.hero-caption {
  display: block;
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.62);
  font-size: 22rpx;
}

.hero-action {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: fit-content;
  margin: 28rpx 0 0;
  padding: 15rpx 22rpx;
  color: $color-primary;
  background: #fff;
  border-radius: $radius-pill;
  font-size: 24rpx;
  font-weight: 650;
}

.hero-orbit {
  position: absolute;
  border: 1rpx solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}

.orbit-one {
  right: -108rpx;
  bottom: -164rpx;
  width: 420rpx;
  height: 420rpx;
}

.orbit-two {
  right: -34rpx;
  bottom: -90rpx;
  width: 270rpx;
  height: 270rpx;
  border-color: rgba(233, 155, 90, 0.34);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin: 24rpx 0 44rpx;
}

.stat-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 22rpx 10rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.stat-value {
  color: $color-text;
  font-size: 34rpx;
  font-weight: 700;
}

.stat-label {
  margin-top: 5rpx;
  color: $color-text-muted;
  font-size: 21rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 44rpx;
}

.quick-card {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin: 0;
  padding: 24rpx;
  flex-direction: column;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  text-align: left;
}

.quick-title {
  margin-top: 18rpx;
  color: $color-text;
  font-size: 27rpx;
  font-weight: 650;
}

.quick-description {
  margin-top: 7rpx;
  color: $color-text-secondary;
  font-size: 21rpx;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-card,
.connect-card {
  padding: 24rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.empty-card {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.empty-title {
  color: $color-text;
  font-size: 26rpx;
  font-weight: 650;
}

.empty-description {
  color: $color-text-secondary;
  font-size: 22rpx;
}

.connect-card {
  display: flex;
  align-items: center;
}

.connect-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  background: $color-primary-soft;
  border-radius: 18rpx;
}

.connect-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
}

.connect-title {
  color: $color-text;
  font-size: 26rpx;
  font-weight: 650;
}

.connect-description {
  color: $color-text-secondary;
  font-size: 21rpx;
}
</style>
