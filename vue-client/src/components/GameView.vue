<script setup lang="ts">
import { useToast } from '@/components/ui/toast/use-toast'
import { useSignalRInvoke } from '@/signalR/connection'
import { useGameStore } from '@/stores/game-store'
import { storeToRefs } from 'pinia'
import { onUpdated, ref } from 'vue'
import { Button } from './ui/button'
import { Input } from './ui/input'

const { messages, roomName, userName, connectedUsers, gameOverMessage } =
  storeToRefs(useGameStore())
const { setUserInfo } = useGameStore()
const { execute: leaveRoomInvoke } = useSignalRInvoke('LeaveRoom')
const { execute: makeGuessInvoke } = useSignalRInvoke('MakeGuess', true)
const { toast } = useToast()

let somebodyWon = ref(!!messages?.value.find((el) => el.includes('wygrał grę z liczbą: ')))

// Chat
const bottomLineRef = ref<HTMLLIElement>()
const handleScrollToBottomOfChat = () => {
  bottomLineRef.value?.scrollIntoView({
    behavior: 'instant'
  })
}

// Form
const guessNumber = ref('')
function handleMakeGuess() {
  if (isInputDisabled()) {
    setUserInfo({
      roomName: '',
      userName: userName.value
    })
    return
  }
  const number = +guessNumber.value

  if (number === undefined) {
    toast({ title: 'Wprowadź liczbę' })
    return
  }
  makeGuessInvoke(roomName.value, userName.value, number)
  guessNumber.value = ''
}
const isInputDisabled = () =>
  connectedUsers.value.length < 2 || gameOverMessage.value.length > 0 || somebodyWon.value

// Automatyczny scroll na dół czatu
onUpdated(() => {
  handleScrollToBottomOfChat()
})

window.addEventListener('beforeunload', () => leaveRoomInvoke(roomName.value, userName.value))
</script>

<template>
  <div class="flex">
    <aside class="max-w-xs w-full bg-secondary p-4 flex flex-col gap-2 h-screen overflow-y-auto">
      <p>Pokój: {{ roomName }}</p>
      <p>Nazwa użytkownika: {{ userName }}</p>
      <section>
        <p>Zalogowani użytkownicy:</p>
        <ul class="list-decimal ml-6">
          <li v-for="user in connectedUsers">
            {{ user }}
            <span v-if="user === userName" class="text-primary font-bold">(Ty)</span>
          </li>
        </ul>
      </section>
    </aside>
    <section class="w-full p-4 space-y-2 max-w-3xl mx-auto">
      <ul class="h-[calc(100vh-2rem-.5rem-3rem)] overflow-y-auto">
        <li>Czat:</li>
        <li class="even:bg-secondary p-2 rounded" v-for="msg in messages">
          {{ msg }}
        </li>

        <!-- Gra zakończona -->
        <li
          v-if="somebodyWon || gameOverMessage.length > 0"
          class="text-destructive font-bold p-2 bg-destructive/10 rounded"
        >
          Gra została zakończona.
        </li>

        <!-- Oczekiwanie na gracza -->
        <li
          v-if="connectedUsers.length < 2 && !gameOverMessage.length && !somebodyWon"
          class="text-destructive font-bold p-2 bg-destructive/10 rounded"
        >
          Oczekiwanie na drugiego gracza...
        </li>
        <li class="opacity-0" ref="bottomLineRef">xd</li>
      </ul>
      <form @submit.prevent="handleMakeGuess" class="flex gap-2 h-12">
        <Input
          placeholder="Zgadnij liczbę"
          type="number"
          v-model="guessNumber"
          auto-focus="true"
          class="appearance-none"
          step="1"
          max="100"
          min="1"
        />
        <Button type="submit" :disabled="isInputDisabled()"> Zgadnij </Button>
      </form>
    </section>
  </div>
</template>
