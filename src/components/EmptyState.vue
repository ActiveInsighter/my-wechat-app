<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  actionText?: string
}>(), {
  description: '这里暂时还没有内容',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="empty-state">
    <view class="empty-icon">
      <uni-icons type="info" size="28" color="#6F7974" />
    </view>
    <text class="empty-title">{{ title }}</text>
    <text class="empty-description">{{ description }}</text>
    <button v-if="actionText" class="empty-action" @tap="emit('action')">{{ actionText }}</button>
  </view>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 72rpx 32rpx;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 20rpx;
  background: #edf1ec;
  border-radius: 50%;
}

.empty-title {
  color: $color-text;
  font-size: 28rpx;
  font-weight: 600;
}

.empty-description {
  margin-top: 10rpx;
  color: $color-text-muted;
  font-size: 24rpx;
}

.empty-action {
  margin-top: 24rpx;
  padding: 14rpx 24rpx;
  color: $color-primary;
  background: $color-primary-soft;
  border-radius: $radius-pill;
  font-size: 24rpx;
}
</style>
