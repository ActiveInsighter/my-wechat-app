import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isReady: false,
    version: '0.1.0',
  }),
  actions: {
    markReady() {
      this.isReady = true
    },
  },
})
