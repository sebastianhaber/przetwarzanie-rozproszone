import { defineStore } from 'pinia'

export const useAppStore = defineStore('appStore', {
  state: () => {
    const isConnected = false

    return { isConnected }
  },
  actions: {
    setIsConnected(data: boolean) {
      this.isConnected = data
    }
  }
})
