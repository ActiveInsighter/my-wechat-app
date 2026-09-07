<script setup lang="ts">
import { computed } from 'vue'
import type { DispatchTaskRecord } from '@/features/dispatch/types'
import { progressText, taskStatusLabel } from '@/features/dispatch/model'

const props = defineProps<{ task: DispatchTaskRecord }>()
const emit = defineEmits<{
  open: [task: DispatchTaskRecord]
  republish: [task: DispatchTaskRecord]
}>()

const statusLabel = computed(() => taskStatusLabel(props.task.status))
const progress = computed(() => progressText(props.task))
const canRepublish = computed(() => ['succeeded', 'failed', 'canceled'].includes(props.task.status))
</script>

<template>
  <view class="task-card" @tap="emit('open', task)">
    <view class="task-card__top">
      <view class="task-card__copy">
        <text class="task-card__title">{{ task.title || '云端任务' }}</text>
        <text class="task-card__meta">{{ statusLabel }} · {{ progress }}</text>
      </view>
      <view class="task-card__status" :class="`is-${task.status}`">
        <text>{{ statusLabel }}</text>
      </view>
    </view>

    <text class="task-card__queue">{{ task.queueText }}</text>

    <view class="task-card__footer">
      <text class="task-card__time">{{ task.updated }}</text>
      <button
        v-if="canRepublish"
        class="task-card__action"
        @tap.stop="emit('republish', task)"
      >
        重新发布
      </button>
      <uni-icons v-else type="right" size="16" color="#A5AEA8" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.task-card {
  padding: 24rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.task-card__top,
.task-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.task-card__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.task-card__title {
  overflow: hidden;
  color: $color-text;
  font-size: 29rpx;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-card__meta,
.task-card__time {
  color: $color-text-muted;
  font-size: 21rpx;
}

.task-card__status {
  padding: 7rpx 12rpx;
  color: $color-text-secondary;
  background: $color-primary-soft;
  border-radius: $radius-pill;
  font-size: 20rpx;
}

.task-card__status.is-running,
.task-card__status.is-succeeded {
  color: $color-success;
  background: #edf6ef;
}

.task-card__status.is-failed,
.task-card__status.is-canceled {
  color: #a75b55;
  background: #fff0ee;
}

.task-card__queue {
  display: -webkit-box;
  overflow: hidden;
  margin: 20rpx 0;
  color: $color-text-secondary;
  font-size: 23rpx;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.task-card__action {
  margin: 0;
  padding: 10rpx 16rpx;
  color: $color-primary;
  background: $color-primary-soft;
  border-radius: $radius-pill;
  font-size: 21rpx;
  line-height: 1.2;
}
</style>
