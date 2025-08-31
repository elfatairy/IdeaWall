import { useState } from 'react'
import type { User } from '~/contexts/ProfileContext'
import { useBroadcastChannel } from '~/hooks/useBroadcastChannel'
import { EVENT_USER_POSITION_UPDATED } from '~/types/events'

export const useUsersMousePositions = () => {
  const [users, setUsers] = useState<User[]>([])

  useBroadcastChannel('users-mouse-positions', [
    {
      event: EVENT_USER_POSITION_UPDATED,
      callback: (payload: { payload: User }) => {
        setUsers((prev) => prev.filter((user) => user.id !== payload.payload.id).concat(payload.payload))
      }
    }
  ])

  return {
    users
  }
}
