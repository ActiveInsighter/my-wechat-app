<script setup lang="ts">
import { computed, ref } from 'vue'
import AppSectionTitle from '@/components/AppSectionTitle.vue'
import QuickActionCard from '@/components/QuickActionCard.vue'
import { getGreeting } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const completedToday = ref(6)
const greeting = getGreeting(new Date().getHours())
const displayName = computed(() => userStore.displayName)

const stats = [
  { icon: 'calendar', value: '12', label: '本周计划', color: '#143B36' },
  { icon: 'checkmarkempty', value: '86%', label: '完成率', color: '#3E8D69' },
  { icon: 'flag', value: '3', label: '进行中', color: '#C77A30' },
]

const quickActions = [
  { icon: 'compose', title: '新建计划', description: '把想法变成下一步行动' },
  { icon: 'calendar', title: '查看日历', description: '快速浏览近期安排' },
  { icon: 'scan', title: '扫一扫', description: '识别并保存重要信息' },
  { icon: 'gear', title: '偏好设置', description: '调整你的工作方式' },
]

function openAction(title: string) {
  uni.showToast({
    title: `${title}功能待接入`,
    icon: 'none',
  })
}

function checkIn() {
  completedToday.value += 1
  uni.showToast({
    title: '今日进度已更新',
    icon: 'success',
  })
}
</script>

<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="content-wrap home-content">
        <view class="topbar">
          <view>
            <text class="eyebrow">MINI WORKSPACE</text>
            <text class="brand-title">轻一点，做重要的事</text>
          </view>
          <button class="notification-button" aria-label="查看通知" @tap="openAction('通知')">
            <uni-icons type="notification" size="22" color="#143B36" />
            <view class="notification-dot" />
          </button>
        </view>

        <view class="hero-card">
          <view class="hero-copy">
            <text class="hero-kicker">{{ greeting }}，{{ displayName }}</text>
            <text class="hero-title">今天也留一点<br />时间给重要的事</text>
            <text class="hero-caption">完成一件小事，进度就会向前一步。</text>
          </view>
          <button class="hero-action" @tap="checkIn">
            <text>记录进度</text>
            <uni-icons type="arrow-right" size="16" color="#FFFFFF" />
          </button>
          <view class="hero-orbit orbit-one" />
          <view class="hero-orbit orbit-two" />
        </view>

        <view class="stats-grid">
          <view v-for="stat in stats" :key="stat.label" class="stat-card">
            <view class="stat-icon" :style="{ color: stat.color }">
              <uni-icons :type="stat.icon" size="20" :color="stat.color" />
            </view>
            <text class="stat-value">{{ stat.value }}</text>
            <text class="stat-label">{{ stat.label }}</text>
          </view>
        </view>

        <AppSectionTitle title="快捷入口" subtitle="常用功能，一触即达" action-text="全部" @action="openAction('快捷入口')" />
        <view class="quick-grid">
          <QuickActionCard
            v-for="action in quickActions"
            :key="action.title"
            :icon="action.icon"
            :title="action.title"
            :description="action.description"
            @tap="openAction(action.title)"
          />
        </view>

        <AppSectionTitle title="今日提醒" subtitle="保持节奏，不必着急" />
        <view class="reminder-card">
          <view class="reminder-mark">
            <uni-icons type="checkmarkempty" size="22" color="#3E8D69" />
          </view>
          <view class="reminder-copy">
            <text class="reminder-title">完成 {{ completedToday }} 件小事</text>
            <text class="reminder-description">不错的开始，继续保持稳定的节奏。</text>
          </view>
          <text class="reminder-time">进行中</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.home-content {
  padding-top: 28rpx;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 34rpx;
}

.topbar > view {
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

.brand-title {
  color: $color-primary;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.notification-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: 50%;
}

.notification-dot {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 10rpx;
  height: 10rpx;
  background: $color-accent;
  border: 2rpx solid $color-surface;
  border-radius: 50%;
}

.hero-card {
  position: relative;
  min-height: 342rpx;
  overflow: hidden;
  padding: 36rpx;
  background: $color-primary;
  border-radius: $radius-lg;
  box-shadow: 0 16rpx 40rpx rgba(20, 59, 54, 0.16);
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero-kicker {
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
}

.hero-title {
  margin-top: 18rpx;
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 1rpx;
}

.hero-caption {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.62);
  font-size: 23rpx;
}

.hero-action {
  position: absolute;
  z-index: 1;
  bottom: 34rpx;
  left: 36rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 22rpx;
  color: $color-primary;
  background: #ffffff;
  border-radius: $radius-pill;
  font-size: 24rpx;
  font-weight: 600;
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
  margin: 24rpx 0 48rpx;
}

.stat-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 22rpx 10rpx 20rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 12rpx;
  background: #f0f4ef;
  border-radius: 50%;
}

.stat-value {
  color: $color-text;
  font-size: 34rpx;
  font-weight: 700;
}

.stat-label {
  margin-top: 4rpx;
  color: $color-text-muted;
  font-size: 21rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 48rpx;
}

.reminder-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.reminder-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 64rpx;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  background: #e4f1e8;
  border-radius: 18rpx;
}

.reminder-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.reminder-title {
  color: $color-text;
  font-size: 27rpx;
  font-weight: 600;
}

.reminder-description {
  color: $color-text-secondary;
  font-size: 22rpx;
}

.reminder-time {
  padding: 8rpx 12rpx;
  color: $color-success;
  background: #edf6ef;
  border-radius: $radius-pill;
  font-size: 21rpx;
}
</style>
