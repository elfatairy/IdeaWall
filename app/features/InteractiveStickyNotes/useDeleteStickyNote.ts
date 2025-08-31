import { supabase } from '~/supabase'
import { useProfile } from '~/contexts/ProfileContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EVENT_STICKY_NOTES_DELETED } from '~/types/events'
import type { StickyNote } from '~/types/stickynote'

export const useDeleteStickyNote = (channel: ReturnType<typeof supabase.channel> | null) => {
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile) {
        throw new Error('User not found')
      }
      const { data, error } = await supabase.from('sticky_notes').delete().eq('id', id).select().single()
      if (error) {
        throw error
      }
      return data
    },
    onMutate: (id) => {
      const previousStickyNotes = queryClient.getQueryData(['sticky_notes'])
      queryClient.setQueryData(['sticky_notes'], (current: StickyNote[]) =>
        current?.filter((stickyNote) => stickyNote.id !== id)
      )
      return { id, previousStickyNotes }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['sticky_notes'], context?.previousStickyNotes)
    },
    onSuccess: (data) => {
      channel?.send({
        type: 'broadcast',
        event: EVENT_STICKY_NOTES_DELETED,
        payload: data.id
      })
    }
  })
}
