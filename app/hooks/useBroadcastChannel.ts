import { useEffect, useState } from 'react'
import { supabase } from '~/supabase'

type Handler = {
  event: string
  callback: (payload: any) => void
}

export const useBroadcastChannel = (channelName: string, handlers?: Handler[]) => {
  const [channel, setChannel] = useState<ReturnType<typeof import('~/supabase').supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const _channel = supabase.channel(channelName)

    handlers?.forEach((handler) => {
      _channel.on('broadcast', { event: handler.event }, handler.callback)
    })

    _channel.subscribe(async (status) => {
      setIsConnected(status === 'SUBSCRIBED')
    })

    setChannel(_channel)

    return () => {
      _channel.unsubscribe()
    }
  }, [channelName, handlers])

  return { channel, isConnected }
}
