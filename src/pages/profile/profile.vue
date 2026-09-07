<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const appStore = useAppStore()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const displayName = computed(() => userStore.displayName)

const preferences = [
  { icon: 'gear', title: '偏好设置', description: '通知、主题与默认选项' },
  { icon: 'info', title: '关于项目', description: '了解当前版本与开发信息' },
]

function startLogin() {
  uni.showToast({
    title: '登录流程待接入',
    icon: 'none',
  })
}

function openPreference(title: string) {
  uni.showToast({
    title: `${title}功能待接入`,
    icon: 'none',
  })
}

function logout() {
  userStore.logout()
  uni.showToast({ title: '已退出登录', icon: 'success' })
}
</script>

<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="content-wrap profile-content">
        <view class="profile-heading">
          <text class="eyebrow">YOUR SPACE</text>
          <text class="page-title">我的</text>
        </view>

        <view class="profile-card">
          <view class="avatar">
            <text>{{ isLoggedIn ? displayName.slice(0, 1) : '?' }}</text>
          </view>
          <view class="profile-copy">
            <text class="profile-name">{{ isLoggedIn ? displayName : '登录后同步你的数据' }}</text>
            <text class="profile-description">{{ isLoggedIn ? '你的工作空间已准备好' : '登录后可以保存计划与偏好' }}</text>
          </view>
          <button v-if="!isLoggedIn" class="login-button" @tap="startLogin">登录</button>
          <uni-icons v-else type="checkmarkempty" size="22" color="#3E8D69" />
        </view>

        <view class="overview-card">
          <view class="overview-item">
            <text class="overview-value">7</text>
            <text class="overview-label">连续使用天数</text>
          </view>
          <view class="overview-divider" />
          <view class="overview-item">
            <text class="overview-value">24</text>
            <text class="overview-label">已完成事项</text>
          </view>
          <view class="overview-divider" />
          <view class="overview-item">
            <text class="overview-value">86%</text>
            <text class="overview-label">本周完成率</text>
          </view>
        </view>

        <view class="section-heading">
          <text class="section-title">设置</text>
          <text class="section-subtitle">让工作台更像你</text>
        </view>

        <view class="preference-list">
          <button v-for="preference in preferences" :key="preference.title" class="preference-item" @tap="openPreference(preference.title)">
            <view class="preference-icon">
              <uni-icons :type="preference.icon" size="21" color="#143B36" />
            </view>
            <view class="preference-copy">
              <text class="preference-title">{{ preference.title }}</text>
              <text class="preference-description">{{ preference.description }}</text>
            </view>
            <uni-icons type="right" size="16" color="#A5AEA8" />
          </button>
        </view>

        <button v-if="isLoggedIn" class="logout-button" @tap="logout">退出登录</button>
        <text class="version-text">小程序工作台 · v{{ appStore.version }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.profile-content {
  padding-top: 32rpx;
}

.profile-heading {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 28rpx;
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

.profile-card {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background: $color-primary;
  border-radius: $radius-lg;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 88rpx;
  width: 88rpx;
  height: 88rpx;
  margin-right: 20rpx;
  color: $color-primary;
  background: #f0d7b9;
  border-radius: 50%;
  font-size: 34rpx;
  font-weight: 700;
}

.profile-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.profile-name {
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 600;
}

.profile-description {
  color: rgba(255, 255, 255, 0.64);
  font-size: 22rpx;
}

.login-button {
  padding: 14rpx 22rpx;
  color: $color-primary;
  background: #ffffff;
  border-radius: $radius-pill;
  font-size: 24rpx;
  font-weight: 600;
}

.overview-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 24rpx 0 48rpx;
  padding: 24rpx 8rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
}

.overview-item {
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.overview-value {
  color: $color-text;
  font-size: 32rpx;
  font-weight: 700;
}

.overview-label {
  color: $color-text-muted;
  font-size: 20rpx;
}

.overview-divider {
  width: 1rpx;
  height: 44rpx;
  background: $color-border;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-bottom: 20rpx;
}

.section-title {
  color: $color-text;
  font-size: 32rpx;
  font-weight: 700;
}

.section-subtitle {
  color: $color-text-muted;
  font-size: 22rpx;
}

.preference-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.preference-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 22rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  text-align: left;
}

.preference-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 64rpx;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  background: $color-primary-soft;
  border-radius: 18rpx;
}

.preference-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
}

.preference-title {
  color: $color-text;
  font-size: 27rpx;
  font-weight: 600;
}

.preference-description {
  color: $color-text-secondary;
  font-size: 22rpx;
}

.logout-button {
  margin-top: 32rpx;
  padding: 20rpx;
  color: #b7635d;
  background: #fff1ef;
  border: 1rpx solid #f2d9d6;
  border-radius: $radius-md;
  font-size: 26rpx;
}

.version-text {
  display: block;
  margin-top: 40rpx;
  color: $color-text-muted;
  font-size: 21rpx;
  text-align: center;
}
</style>
