import type { AvatarFullConfig } from 'react-nice-avatar'
import { useProfile } from '~/contexts/ProfileContext'
import { supabase } from '~/supabase'
import type { Json } from '~/types/supabase'
import { useMutation } from '@tanstack/react-query'

const createProfile = async (params: { name: string; avatar: AvatarFullConfig }) => {
  const { name, avatar } = params
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
    throw new Error('Failed to sign in anonymously')
  }
  const { data, error } = await supabase
    .from('users')
    .insert({ name, avatarConfig: avatar as Json, id: user.id })
    .select()
    .single()
  if (error) {
    throw error
  }
  return {
    id: data.id,
    name,
    avatarConfig: avatar,
    position: { x: 0, y: 0 }
  }
}

export const useCreateProfile = () => {
  const { setProfile } = useProfile()
  return useMutation({
    mutationFn: createProfile,
    onSuccess: (data) => {
      setProfile(data)
    }
  })
}
