<script setup lang="ts">
import { useAppStore } from '@/stores/app-store'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import GameView from './components/GameView.vue'
import LoginView from './components/LoginView.vue'
import IconLoadingVue from './components/icons/IconLoading.vue'
import { Toaster, useToast } from './components/ui/toast'
import { useSignalROn } from './signalR/connection'
import { useGameStore } from './stores/game-store'

const { isConnected } = storeToRefs(useAppStore())
const { userName, roomName } = storeToRefs(useGameStore())
const { setMessages, setConnectedUsers, setGameOverMessage } = useGameStore()
const { toast } = useToast()

onMounted(() => {
  useSignalROn('UpdateMessages', (messages: string[]) => {
    console.log('listener messages:', messages)
    setMessages(messages)
  })
  // Update users
  useSignalROn('UpdateUsers', (users: string[]) => {
    console.log('listener users:', users)
    setConnectedUsers(users)
  })
  useSignalROn('ReceivePrivateMessage', (receivedUserName: string, message: string) => {
    console.log(receivedUserName, userName.value)
    if (userName.value === receivedUserName) {
      toast({ title: message })
    }
  })
  useSignalROn('GameOver', (receivedUserName: string, message: string) => {
    console.log('gameover', message)
    setGameOverMessage(message || 'Gra została zakończona.')
    if (userName.value === receivedUserName) {
      toast({ title: 'Brawo! Wygrałeś grę!' })
    }
  })
})
</script>

<template>
  <Toaster />
  <!-- Connected to signalR -->
  <section v-if="isConnected">
    <LoginView v-if="!roomName" />
    <GameView v-if="roomName && userName" />
  </section>

  <!-- Loading icon -->
  <div v-else class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <IconLoadingVue />
  </div>
</template>
