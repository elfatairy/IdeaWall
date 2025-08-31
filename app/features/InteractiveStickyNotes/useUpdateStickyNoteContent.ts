import { useMutation } from '@tanstack/react-query'
import { supabase } from '~/supabase'
import { EVENT_STICKY_NOTES_CONTENT_UPDATED } from './stickyNotesEvents'
import { useChannel } from './StickyNotes'

const updateStickyNoteContent = async (params: { id: string; content: string }) => {
  const { id, content } = params
  const { data, error } = await supabase.from('sticky_notes').update({ content }).eq('id', id).select().single()
  if (error) {
    throw error
  }
  return data
}

export const useUpdateStickyNoteContent = () => {
  const channel = useChannel()

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
