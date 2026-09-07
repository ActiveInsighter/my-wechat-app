<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDispatchStore } from '@/stores/dispatch'
import { useWorkflowStore } from '@/stores/workflow'

const workflowStore = useWorkflowStore()
const dispatchStore = useDispatchStore()

const baseUrl = ref(workflowStore.baseUrlDraft)
const email = ref(workflowStore.session?.email || '')
const password = ref('')
const submitting = ref(false)
const testing = ref(false)

const connected = computed(() => workflowStore.isConnected)
const accountLabel = computed(() => workflowStore.displayName)

async function login() {
  if (!baseUrl.value.trim() || !email.value.trim() || !password.value) {
    uni.showToast({ title: '请填写服务地址、邮箱和密码', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const session = await workflowStore.login(baseUrl.value, email.value, password.value)
    password.value = ''
    await dispatchStore.refresh(session)
    uni.showToast({ title: 'AnyWorkflow 已连接', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '登录失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}

async function testConnection() {
  if (!workflowStore.session || testing.value) return
  testing.value = true
  try {
    await workflowStore.validate()
    uni.showToast({ title: '连接正常', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '连接验证失败',
      icon: 'none',
    })
  } finally {
    testing.value = false
  }
}

function openQueue() {
  uni.switchTab({ url: '/pages/explore/explore' })
}

function logout() {
  uni.showModal({
    title: '断开 AnyWorkflow？',
    content: '只会清除小程序本机保存的普通用户登录会话，不会删除云端任务。',
    success: (result) => {
      if (!result.confirm) return
      workflowStore.logout()
      dispatchStore.clear()
      password.value = ''
      uni.showToast({ title: '已断开', icon: 'success' })
    },
  })
}
</script>

<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="content-wrap settings-page">
        <view class="intro">
          <text class="eyebrow">ANYWORKFLOW CONNECTION</text>
          <text class="page-title">连接与设置</text>
          <text class="page-description">使用 PocketBase aw_clients 普通账户连接你的工作流后端。</text>
        </view>

        <view v-if="connected" class="connection-card">
          <view class="connection-indicator">
            <view class="connection-dot" />
          </view>
          <view class="connection-copy">
            <text class="connection-title">{{ accountLabel }}</text>
            <text class="connection-meta">{{ workflowStore.session?.baseUrl }}</text>
            <text class="connection-meta">Owner · {{ workflowStore.ownerId }}</text>
          </view>
        </view>

        <view v-if="!connected" class="form-card">
          <view class="field">
            <text class="field-label">PocketBase 地址</text>
            <input
              v-model="baseUrl"
              class="text-input"
              placeholder="https://pb.example.com"
              type="text"
            />
          </view>

          <view class="field">
            <text class="field-label">aw_clients 邮箱</text>
            <input
              v-model="email"
              class="text-input"
              placeholder="you@example.com"
              type="text"
            />
          </view>

          <view class="field">
            <text class="field-label">密码</text>
            <input
              v-model="password"
              class="text-input"
              placeholder="只用于本次登录"
              password
            />
          </view>

          <button class="primary-button" :loading="submitting" @tap="login">连接 AnyWorkflow</button>
          <text class="security-tip">密码不会保存；小程序只持久化 PocketBase 普通用户会话 token。</text>
        </view>

        <view v-else class="action-list">
          <button class="setting-action" :loading="testing" @tap="testConnection">
            <view class="setting-icon">
              <uni-icons type="refresh" size="20" color="#143B36" />
            </view>
            <view class="setting-copy">
              <text class="setting-title">测试连接</text>
              <text class="setting-description">验证当前用户 token 和服务端是否可用</text>
            </view>
            <uni-icons type="right" size="16" color="#A5AEA8" />
          </button>

          <button class="setting-action" @tap="openQueue">
            <view class="setting-icon">
              <uni-icons type="list" size="20" color="#143B36" />
            </view>
            <view class="setting-copy">
              <text class="setting-title">打开任务队列</text>
              <text class="setting-description">查看、修改草稿、发布和重新发布</text>
            </view>
            <uni-icons type="right" size="16" color="#A5AEA8" />
          </button>

          <button class="logout-button" @tap="logout">断开连接</button>
        </view>

        <view class="architecture-card">
          <text class="architecture-title">当前控制链路</text>
          <text class="architecture-line">小程序 → aw_dispatch_tasks → PocketBase Hook → n8n → 电脑端 AnyWorkflow</text>
          <text class="architecture-note">任务发布后正文锁定；需要修改已执行任务时，会复制为一个新任务重新发布。</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.settings-page {
  padding-top: 32rpx;
  padding-bottom: 48rpx;
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 30rpx;
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

.connection-card,
.form-card,
.architecture-card {
  padding: 26rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-lg;
}

.connection-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.connection-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background: #edf6ef;
  border-radius: 50%;
}

.connection-dot {
  width: 16rpx;
  height: 16rpx;
  background: $color-success;
  border-radius: 50%;
}

.connection-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 7rpx;
}

.connection-title {
  color: $color-text;
  font-size: 28rpx;
  font-weight: 700;
}

.connection-meta {
  overflow: hidden;
  color: $color-text-muted;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.field-label {
  color: $color-text;
  font-size: 24rpx;
  font-weight: 650;
}

.text-input {
  box-sizing: border-box;
  min-height: 84rpx;
  padding: 0 20rpx;
  background: #fbfcfa;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  color: $color-text;
  font-size: 25rpx;
}

.primary-button {
  width: 100%;
  margin: 4rpx 0 0;
  padding: 20rpx;
  color: #fff;
  background: $color-primary;
  border-radius: $radius-md;
  font-size: 26rpx;
  font-weight: 650;
}

.security-tip {
  color: $color-text-muted;
  font-size: 20rpx;
  line-height: 1.5;
  text-align: center;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.setting-action {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 22rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  text-align: left;
}

.setting-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  background: $color-primary-soft;
  border-radius: 18rpx;
}

.setting-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
}

.setting-title {
  color: $color-text;
  font-size: 26rpx;
  font-weight: 650;
}

.setting-description {
  color: $color-text-secondary;
  font-size: 21rpx;
}

.logout-button {
  margin-top: 10rpx;
  color: #a75b55;
  background: #fff0ee;
  border: 1rpx solid #f1d7d3;
  border-radius: $radius-md;
  font-size: 25rpx;
}

.architecture-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 30rpx;
}

.architecture-title {
  color: $color-text;
  font-size: 26rpx;
  font-weight: 700;
}

.architecture-line {
  color: $color-primary;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.6;
}

.architecture-note {
  color: $color-text-secondary;
  font-size: 21rpx;
  line-height: 1.55;
}
</style>
