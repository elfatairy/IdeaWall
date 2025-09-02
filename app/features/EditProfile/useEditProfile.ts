import type { AvatarFullConfig } from 'react-nice-avatar'
import { useProfile } from '~/contexts/ProfileContext'
import { supabase } from '~/supabase'
import type { Json } from '~/types/supabase'
import { useMutation } from '@tanstack/react-query'
import type { Position } from '~/types/general'

const editProfile = async (params: { name: string; avatar: AvatarFullConfig }) => {
  const { name, avatar } = params
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Failed to get user')
  }
  const { data, error } = await supabase
    .from('users')
    .update({ name, avatarConfig: avatar as Json })
    .eq('id', user.id)
    .select()
    .single()
  if (!data) {
    throw new Error('Failed to update user')
  }
  if (error) {
    throw error
  }
  return data
}

export const useEditProfile = () => {
  const { setProfile } = useProfile()

  return useMutation({
    mutationFn: editProfile,
    onSuccess: (data) => {
      setProfile({
        ...data,
        avatarConfig: data.avatarConfig as AvatarFullConfig,
        position: data.position as Position
      })
    },
    onError: (error) => {
      console.error(error)
    }
  })
}
