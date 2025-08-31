import { useEffect } from 'react'
import { useProfile } from '~/contexts/ProfileContext'
import { supabase } from '~/supabase'

const notifyOnline = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) {
    throw error
  }
}

export const useSendHeartbeat = () => {
  const { profile } = useProfile()

  useEffect(() => {
    if (!profile?.id) {
      return
    }

    const interval = setInterval(() => {
      notifyOnline(profile?.id)
    }, 10000)

    return () => clearInterval(interval)
  }, [profile?.id])
}
