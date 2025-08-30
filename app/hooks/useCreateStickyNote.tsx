import { supabase } from '~/supabase'
import { useApi } from './useApi'
import { useProfile } from '~/contexts/ProfileContext'

export const useCreateStickyNote = () => {
  const { profile } = useProfile()
  const createStickyNote = async (params: { content: string, color: string, position: { x: number, y: number } }) => {
    const { content, color, position } = params
    if (!profile) {
      throw new Error('User not found')
    }
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert({ content, color, position, user_id: profile.id })
      .select()
      .single()
    if (error) {
      throw error
    }
    return data
  }
  return useApi({
    apiFunction: createStickyNote
  })
}
