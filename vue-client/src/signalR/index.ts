import { useAppStore } from '@/stores/app-store'
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr'
import { ref, type App, type Ref } from 'vue'

export const signalRSymbol = Symbol('signalr')

type TOptions = {
  url: string
}

export type SignalRConnectionReturn = {
  connectionStarted: Ref<boolean>
  connection: HubConnection | undefined
}
const createSignalRConnection = (config: TOptions): SignalRConnectionReturn => ({
  connectionStarted: ref(false),
  connection: new HubConnectionBuilder()
    .withUrl(config.url, {
      transport: HttpTransportType.WebSockets
    })
    .configureLogging(LogLevel.Information)
    .build()
})

export default {
  install: (app: App<Element>, options: TOptions) => {
    const signalrConnection = createSignalRConnection(options)

    app.provide(signalRSymbol, signalrConnection)

    const { connectionStarted, connection } = signalrConnection
    const { setIsConnected } = useAppStore()

    const start = () => {
      connection
        ?.start()
        .then(() => {
          connectionStarted.value = true
          console.log('Connected')
          setIsConnected(true)
        })
        .catch((err) => {
          connectionStarted.value = false
          setIsConnected(false)
          console.log('Error: disconnected')
          setTimeout(start, 5000)
        })
    }
    // connection.invoke
    connection?.onclose(() => {
      connectionStarted.value = false
      setIsConnected(false)
      console.log('Disconnected')
      start()
    })

    start()
  }
}
