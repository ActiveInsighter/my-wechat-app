<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="section-heading">
    <view class="section-copy">
      <text class="section-title">{{ title }}</text>
      <text v-if="subtitle" class="section-subtitle">{{ subtitle }}</text>
    </view>
    <button v-if="actionText" class="section-action" @tap="emit('action')">
      <text>{{ actionText }}</text>
      <uni-icons type="right" size="14" color="#8B928D" />
    </button>
  </view>
</template>

<style lang="scss" scoped>
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-copy {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.section-title {
  color: $color-text;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.section-subtitle {
  color: $color-text-muted;
  font-size: 22rpx;
}

.section-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: $color-text-secondary;
  font-size: 24rpx;
}
</style>
