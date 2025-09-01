import { useMutation } from '@tanstack/react-query'
import { supabase } from '~/supabase'
import { EVENT_STICKY_NOTES_CONTENT_UPDATED } from '~/constants/events'
import { useBroadcastChannel } from '~/hooks/useBroadcastChannel'

const updateStickyNoteContent = async (params: { id: string; content: string }) => {
  const { id, content } = params
  const { data, error } = await supabase
    .from('sticky_notes')
    .update({ content })
    .eq('id', id)
    .select('*, user:users(*), sticky_notes_reactions:sticky_notes_reactions(*)')
    .single()

  if (error) {
    throw error
  }
  return data
}

export const useUpdateStickyNoteContent = () => {
  const { channel } = useBroadcastChannel('sticky-notes')

  return useMutation({
    mutationFn: updateStickyNoteContent,
    onSuccess: (data) => {
      channel?.send({
        type: 'broadcast',
        event: EVENT_STICKY_NOTES_CONTENT_UPDATED,
        payload: data
      })
    }
  })
}
