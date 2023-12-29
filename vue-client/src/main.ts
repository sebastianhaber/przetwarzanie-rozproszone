import './assets/main.css'

import SignalR from '@/signalR/index'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import IndexApp from './Index.vue'

const app = createApp(IndexApp)

app.use(createPinia())
app.use(SignalR, {
  url: 'https://localhost:7126/gameHub'
})
app.mount('#app')
