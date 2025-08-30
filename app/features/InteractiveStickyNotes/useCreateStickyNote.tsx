import { supabase } from '~/supabase'
import { useApi } from '../../hooks/useApi'
import { useProfile } from '~/contexts/ProfileContext'

export const useCreateStickyNote = () => {
  const { profile } = useProfile()
  const createStickyNote = async (params: { id?: string, content: string, color: string, position: { x: number, y: number } }) => {
    const { id, content, color, position } = params
    if (!profile) {
      throw new Error('User not found')
    }
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert({ id, content, color, position, user_id: profile.id })
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
