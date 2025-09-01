import { EVENT_USER_POSITION_UPDATED } from '~/constants/events'
import { useBroadcastChannel } from './useBroadcastChannel'
import { useProfile } from '~/contexts/ProfileContext'

export const useUpdateUserPosition = () => {
  const { channel } = useBroadcastChannel('users-mouse-positions')
  const { profile } = useProfile()

  return {
    mutate: (position: { x: number; y: number }) => {
      channel?.send({
        type: 'broadcast',
        event: EVENT_USER_POSITION_UPDATED,
        payload: { ...profile, position }
      })
    }
  }
}
