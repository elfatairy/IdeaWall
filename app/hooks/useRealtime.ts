import { useEffect, useState } from 'react'
import { supabase } from '~/supabase'

type Handler = {
  event: string
  callback: (payload: any) => void
}

export const useBroadcastChannel = (channelName: string, handlers: Handler[]) => {
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newChannel = supabase.channel(channelName)
    handlers.forEach((handler) => {
      newChannel.on('broadcast', { event: handler.event }, handler.callback)
    })

    newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    })

    setChannel(newChannel)
    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [channelName, handlers])

  return { channel, isConnected }
}
