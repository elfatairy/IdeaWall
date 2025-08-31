import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '~/supabase'

export type Channel = ReturnType<typeof supabase.channel>

const BroadcaseChannelsContext = createContext<{
  channels: Record<string, Channel>,
  getChannel: (channelName: string) => Channel
} | undefined>(undefined)

export const BroadcaseChannels = ({ children }: { children: React.ReactNode }) => {
  const [channels, setChannels] = useState<Record<string, Channel>>({})

  const getChannel = useCallback((channelName: string) => {
    if (channels[channelName]) {
      return channels[channelName]
    }
    const channel = supabase.channel(channelName)
    setChannels((prev) => ({ ...prev, [channelName]: channel }))
    return channel
  }, [channels])

  return (
    <BroadcaseChannelsContext.Provider value={{ channels, getChannel }}>
      {children}
    </BroadcaseChannelsContext.Provider>
  )
}

export const useBroadcastChannels = () => {
  const context = useContext(BroadcaseChannelsContext)
  if (!context) {
    throw new Error('useBroadcastChannels must be used within a BroadcaseChannels')
  }
  return context
}
