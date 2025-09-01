import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '~/supabase'
import { EVENT_STICKY_NOTES_REACTION_ADDED } from '~/constants/events'
import { useBroadcastChannel } from '~/hooks/useBroadcastChannel'
import type { StickyNoteWithReactions } from '~/types/stickynote'

const reactToStickyNote = async (params: { userId: string; stickyNoteId: string; reaction: string }) => {
  const { userId, stickyNoteId, reaction } = params
  const { data, error } = await supabase
    .from('sticky_notes_reactions')
    .upsert(
      { reaction, sticky_note_id: stickyNoteId, user_id: userId },
      {
        onConflict: 'sticky_note_id, user_id'
      }
    )
    .select()
    .single()
  if (error) {
    throw error
  }
  return data
}

export const useReactToStickyNote = () => {
  const { channel } = useBroadcastChannel('sticky-notes')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reactToStickyNote,
    onMutate: (params) => {
      const previousStickyNotes = queryClient.getQueryData(['sticky_notes']) as StickyNoteWithReactions[]
      const newStickyNotes = previousStickyNotes?.map((stickyNote) =>
        stickyNote.id === params.stickyNoteId
          ? {
              ...stickyNote,
              sticky_notes_reactions: [
                ...(stickyNote.sticky_notes_reactions.filter((reaction) => reaction.user_id !== params.userId) ?? []),
                {
                  user_id: params.userId,
                  reaction: params.reaction,
                  sticky_note_id: params.stickyNoteId
                }
              ]
            }
          : stickyNote
      )

      queryClient.setQueryData(['sticky_notes'], newStickyNotes)
      return { params, previousStickyNotes }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['sticky_notes'], context?.previousStickyNotes)
    },
    onSuccess: (data) => {
      channel?.send({
        type: 'broadcast',
        event: EVENT_STICKY_NOTES_REACTION_ADDED,
        payload: data
      })
    }
  })
}
