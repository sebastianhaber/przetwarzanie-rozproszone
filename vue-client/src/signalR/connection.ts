import { createEventHook } from '@vueuse/core'
import { tryOnScopeDispose } from '@vueuse/shared'
import { inject, shallowRef } from 'vue'
import { signalRSymbol, type SignalRConnectionReturn } from './index.js'

export const useSignalROn = (methodName: string, newMethod: (...props: any) => void) => {
  const signalrConnection = inject<SignalRConnectionReturn>(signalRSymbol)

  if (signalrConnection) {
    const { connection } = signalrConnection

    tryOnScopeDispose(() => {
      connection?.off(methodName)
    })

    console.log('Watching connection.on:', methodName)
    return connection?.on(methodName, (...arg) => {
      newMethod(...arg)
    })
  }
  console.log('--- connection')
}

export const useSignalRInvoke = (methodName: string, withConnectionId?: boolean) => {
  const signalrConnection = inject<SignalRConnectionReturn>(signalRSymbol)

  if (signalrConnection) {
    const { connection } = signalrConnection
    const invokeResult = createEventHook()
    const invokeError = createEventHook()

    const execute = (...args: any) => {
      console.log(...args)
      if (withConnectionId) {
        connection
          ?.invoke(methodName, ...args, connection.connectionId)
          .then((result) => invokeResult.trigger(result))
          .catch((error) => invokeError.trigger(error.message))
      } else {
        connection
          ?.invoke(methodName, ...args)
          .then((result) => invokeResult.trigger(result))
          .catch((error) => invokeError.trigger(error.message))
      }
    }

    const data = shallowRef(null)
    invokeResult.on((d) => {
      data.value = d
    })

    const error = shallowRef(null)
    invokeError.on((d) => {
      error.value = d
    })

    return { execute, data, error, onInvokeResult: invokeResult.on, onInvokeError: invokeError.on }
  }
  return {
    execute: () => null,
    data: undefined,
    error: undefined,
    onInvokeResult: () => null,
    onInvokeError: () => null
  }
}
