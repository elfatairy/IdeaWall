import { useEffect, useState } from 'react'
import { useBroadcastChannels, type Channel } from '~/contexts/BroadcaseChannels'

type Handler = {
  event: string
  callback: (payload: any) => void
}

export const useBroadcastChannel = (channelName: string, handlers?: Handler[]) => {
  const { getChannel } = useBroadcastChannels()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const _channel = getChannel(channelName)

    handlers?.forEach((handler) => {
      _channel.on('broadcast', { event: handler.event }, handler.callback)
    })

    _channel.subscribe(async (status) => {
      setIsConnected(status === 'SUBSCRIBED')
    })

    setChannel(_channel)

    return () => {}
  }, [channelName, getChannel, handlers])

  return { channel, isConnected }
}
