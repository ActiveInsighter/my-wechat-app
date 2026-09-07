<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()

const emit = defineEmits<{
  tap: []
}>()
</script>

<template>
  <button class="quick-action" @tap="emit('tap')">
    <view class="icon-box">
      <uni-icons :type="icon" size="24" color="#143B36" />
    </view>
    <view class="action-copy">
      <text class="action-title">{{ title }}</text>
      <text class="action-description">{{ description }}</text>
    </view>
    <uni-icons class="action-arrow" type="right" size="14" color="#A5AEA8" />
  </button>
</template>

<style lang="scss" scoped>
.quick-action {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 22rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  text-align: left;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 72rpx;
  width: 72rpx;
  height: 72rpx;
  margin-right: 18rpx;
  background: $color-primary-soft;
  border-radius: 20rpx;
}

.action-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
}

.action-title {
  color: $color-text;
  font-size: 28rpx;
  font-weight: 600;
}

.action-description {
  overflow: hidden;
  color: $color-text-muted;
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-arrow {
  flex: 0 0 auto;
}
</style>
