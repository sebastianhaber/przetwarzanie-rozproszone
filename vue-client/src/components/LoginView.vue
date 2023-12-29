<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import { useSignalRInvoke } from '@/signalR/connection'
import { useGameStore } from '@/stores/game-store'
import { ref } from 'vue'

const { setUserInfo, userName: storedUserName } = useGameStore()

let roomName = ref('')
let userName = ref(storedUserName || '')

const { execute: joinRoomInvoke, onInvokeResult } = useSignalRInvoke('JoinRoom')

function handleJoinRoom() {
  const room = roomName.value.trim()
  const user = userName.value.trim()

  if (!room || !user) {
    console.error('Podaj nazwę pokoju i nazwę użytkownika')
    return
  }

  joinRoomInvoke(room, user)
  onInvokeResult(console.log)
  setUserInfo({
    roomName: room,
    userName: user
  })
}
</script>

<template>
  <form
    @submit.prevent="handleJoinRoom"
    className="flex flex-col gap-4 bg-secondary p-4 max-w-lg w-full rounded mx-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  >
    <Input v-model="roomName" placeholder="Wpisz nazwę pokoju" autoFocus class="rounded" />
    <Input v-model="userName" placeholder="Wpisz nazwę użytkownika" />
    <Button type="submit">Graj</Button>
  </form>
</template>
