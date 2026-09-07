<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onLaunch(() => {
  appStore.markReady()
})

onShow(() => {
  // 预留全局回到前台时的刷新入口。
})

onHide(() => {
  // 预留全局离开前台时的清理入口。
})
</script>

<style lang="scss">
page {
  background: $color-bg;
  color: $color-text;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

button::after {
  border: 0;
}
</style>
