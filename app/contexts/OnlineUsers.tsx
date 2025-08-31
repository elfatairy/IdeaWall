import { useProfile, type User } from '~/contexts/ProfileContext'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '~/supabase'
import type { Position } from '~/types/general'
import type { AvatarConfig } from 'react-nice-avatar'

const OnlineUsersContext = createContext<{
  onlineUsers: User[]
}>({
  onlineUsers: []
})

const getOnlineUsers = async (userId?: string) => {
  const query = supabase.from('users').select('*').gt('last_activity_at', new Date(Date.now() - 10000).toISOString())
  if (userId) {
    query.not('id', 'eq', userId)
  }
  const { data, error } = await query
  if (error) {
    throw error
  }
  return data
}

const OnlineUsers = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const { profile } = useProfile()

  const updateOnlineUsers = useCallback(async () => {
    const users = await getOnlineUsers(profile?.id)

    setOnlineUsers(users.map((user) => ({
      ...user,
      position: user.position as Position,
      avatarConfig: user.avatarConfig as AvatarConfig
    })))
  }, [profile?.id])

  useEffect(() => {
    updateOnlineUsers()
    const interval = setInterval(updateOnlineUsers, 10000)
    return () => clearInterval(interval)
  }, [updateOnlineUsers])

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  )
}

export const useOnlineUsers = () => {
  const onlineUsers = useContext(OnlineUsersContext)
  if (!onlineUsers) {
    throw new Error('useOnlineUsers must be used within an OnlineUsersProvider')
  }
  return onlineUsers
}

export default OnlineUsers