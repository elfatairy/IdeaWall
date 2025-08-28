import { useState } from 'react'
import type { AvatarFullConfig } from 'react-nice-avatar'
import { useProfile } from '~/contexts/ProfileContext'
import { supabase } from '~/supabase'
import type { Json } from '~/types/supabase'
import type { Result } from '~/types/result'

export const useCreateProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setProfile } = useProfile()

  const createProfile = async (name: string, avatar: AvatarFullConfig): Promise<Result<{ id: string }>> => {
    try {
      setIsLoading(true)
      const {
        data: { user }
      } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            name,
            avatarConfig: avatar as Json
          }
        }
      })
      if (!user) {
        return { success: false, error: new Error('Failed to sign in anonymously') }
      }
      const { data, error } = await supabase
        .from('users')
        .insert({ name, avatarConfig: avatar as Json, id: user.id })
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

  return { createProfile, isLoading }
}
