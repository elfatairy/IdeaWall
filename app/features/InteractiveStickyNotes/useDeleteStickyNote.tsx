import { supabase } from '~/supabase'
import { useApi } from '../../hooks/useApi'
import { useProfile } from '~/contexts/ProfileContext'

export const useDeleteStickyNote = () => {
  const { profile } = useProfile()
  const deleteStickyNote = async (id: string) => {
    if (!profile) {
      throw new Error('User not found')
    }
    const { data, error } = await supabase
      .from('sticky_notes')
      .delete()
      .eq('id', id)
      .select()
      .single()
    if (error) {
      throw error
    }
    return data
  }
  return useApi({
    apiFunction: deleteStickyNote
  })
}
