<script setup lang="ts">
import { computed, ref } from 'vue'
import AppSectionTitle from '@/components/AppSectionTitle.vue'
import EmptyState from '@/components/EmptyState.vue'

const keyword = ref('')

const tools = [
  {
    icon: 'calendar',
    title: '日程管理',
    description: '把时间留给真正重要的事情',
    tag: '效率',
  },
  {
    icon: 'compose',
    title: '灵感记录',
    description: '随手记下灵感，之后慢慢整理',
    tag: '记录',
  },
  {
    icon: 'list',
    title: '清单模板',
    description: '从成熟模板开始，减少重复准备',
    tag: '模板',
  },
  {
    icon: 'paperplane',
    title: '分享空间',
    description: '和伙伴共享进度与想法',
    tag: '协作',
  },
]

const filteredTools = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return tools
  return tools.filter((tool) => `${tool.title}${tool.description}${tool.tag}`.toLowerCase().includes(query))
})

function openTool(title: string) {
  uni.showToast({
    title: `${title}功能待接入`,
    icon: 'none',
  })
}

function clearSearch() {
  keyword.value = ''
}
</script>

<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="content-wrap explore-content">
        <view class="intro-block">
          <text class="eyebrow">DISCOVER YOUR FLOW</text>
          <text class="page-title">发现更多可能</text>
          <text class="page-description">挑一个顺手的工具，让每一步都更清晰。</text>
        </view>

        <uni-search-bar
          v-model="keyword"
          class="search-bar"
          radius="16"
          placeholder="搜索工具或模板"
          cancel-text=""
          @clear="clearSearch"
        />

        <AppSectionTitle title="工具箱" subtitle="为你的日常准备" />
        <view v-if="filteredTools.length" class="tool-list">
          <button v-for="tool in filteredTools" :key="tool.title" class="tool-card" @tap="openTool(tool.title)">
            <view class="tool-icon">
              <uni-icons :type="tool.icon" size="24" color="#143B36" />
            </view>
            <view class="tool-copy">
              <view class="tool-title-row">
                <text class="tool-title">{{ tool.title }}</text>
                <text class="tool-tag">{{ tool.tag }}</text>
              </view>
              <text class="tool-description">{{ tool.description }}</text>
            </view>
            <uni-icons type="right" size="16" color="#A5AEA8" />
          </button>
        </view>
        <EmptyState
          v-else
          title="没有找到匹配内容"
          description="换个关键词试试看"
          action-text="清除搜索"
          @action="clearSearch"
        />

        <view class="tip-card">
          <view class="tip-icon">
            <uni-icons type="lightbulb" size="20" color="#C77A30" />
          </view>
          <view class="tip-copy">
            <text class="tip-title">小提示</text>
            <text class="tip-description">你可以把常用的功能放到首页快捷入口。</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.explore-content {
  padding-top: 32rpx;
}

.intro-block {
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

.page-description {
  color: $color-text-secondary;
  font-size: 25rpx;
}

.search-bar {
  margin: 0 -18rpx 42rpx;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 48rpx;
}

.tool-card {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 24rpx;
  background: $color-surface;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  text-align: left;
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 76rpx;
  width: 76rpx;
  height: 76rpx;
  margin-right: 20rpx;
  background: $color-primary-soft;
  border-radius: 22rpx;
}

.tool-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.tool-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tool-title {
  color: $color-text;
  font-size: 29rpx;
  font-weight: 600;
}

.tool-tag {
  padding: 4rpx 10rpx;
  color: $color-success;
  background: #edf6ef;
  border-radius: $radius-pill;
  font-size: 19rpx;
}

.tool-description {
  color: $color-text-secondary;
  font-size: 23rpx;
}

.tip-card {
  display: flex;
  align-items: center;
  padding: 22rpx 24rpx;
  background: #fff7eb;
  border: 1rpx solid #f5e4ca;
  border-radius: $radius-md;
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 56rpx;
  width: 56rpx;
  height: 56rpx;
  margin-right: 16rpx;
  background: #ffecd0;
  border-radius: 50%;
}

.tip-copy {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.tip-title {
  color: #8a5c29;
  font-size: 24rpx;
  font-weight: 600;
}

.tip-description {
  color: #9a7950;
  font-size: 22rpx;
}
</style>
