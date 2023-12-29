import { defineStore } from 'pinia'

interface GameData extends UserInfo {
  messages: string[]
  connectedUsers: string[]
  gameOverMessage: string
}
interface UserInfo {
  userName: string
  roomName: string
}
export const useGameStore = defineStore('gameStore', {
  state: () => {
    const gameData: GameData = {
      roomName: '',
      userName: '',
      messages: [],
      connectedUsers: [],
      gameOverMessage: ''
    }

    return gameData
  },
  actions: {
    setUserInfo(data: UserInfo) {
      this.roomName = data.roomName || this.roomName
      this.userName = data.userName || this.userName
    },
    setMessages(msgs: string[]) {
      this.messages = msgs
    },
    setConnectedUsers(users: string[]) {
      this.connectedUsers = users
    },
    setGameOverMessage(message: string) {
      this.gameOverMessage = message
    }
  }
})
