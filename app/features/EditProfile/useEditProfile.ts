import { useState } from 'react'
import type { AvatarFullConfig } from 'react-nice-avatar'
import { useProfile } from '~/contexts/ProfileContext'
import { supabase } from '~/supabase'
import type { Json } from '~/types/supabase'
import type { Result } from '~/types/result'

export const useEditProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setProfile } = useProfile()

  const editProfile = async (name: string, avatar: AvatarFullConfig): Promise<Result<{ id: string }>> => {
    try {
      setIsLoading(true)
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: new Error('Failed to get user') }
      }
      const { data, error } = await supabase
        .from('users')
        .update({ name, avatarConfig: avatar as Json })
        .eq('id', user.id)
        .select()
        .single()
      if (error) {
        return { success: false, error }
      }
      setProfile({
        id: data.id,
        name,
        avatarConfig: avatar,
        position: { x: 0, y: 0 }
      })
      setIsLoading(false)

      return { success: true, data: { id: data.id } }
    } catch (error) {
      return { success: false, error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  return { editProfile, isLoading }
}
