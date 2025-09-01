import { supabase } from '~/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '~/contexts/ProfileContext'
import type { StickyNoteReaction, StickyNoteWithReactions } from '~/types/stickynote'
import { EVENT_STICKY_NOTES_CREATED } from '~/constants/events'
import { useBroadcastChannel } from '~/hooks/useBroadcastChannel'

const createStickyNote = async (params: {
  id?: string
  userId: string
  content: string
  color: string
  position: { x: number; y: number }
}) => {
  const { id, userId, content, color, position } = params
  const { data, error } = await supabase
    .from('sticky_notes')
    .insert({ id, content, color, position, user_id: userId })
    .select('*, user:users(*), sticky_notes_reactions:sticky_notes_reactions(*)')
    .single()
  if (!data) {
    throw new Error('Failed to create sticky note')
  }
  if (error) {
    throw error
  }
  return data
}

export const useCreateStickyNote = () => {
  const { channel } = useBroadcastChannel('sticky-notes')
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      id?: string
      content: string
      color: string
      position: { x: number; y: number }
      sticky_notes_reactions: StickyNoteReaction[]
    }) => {
      if (!profile?.id) {
        throw new Error('User profile not found. Please create a profile first.')
      }
      return createStickyNote({ ...params, userId: profile.id })
    },
    onMutate: (params) => {
      if (!profile?.id) {
        throw new Error('User profile not found. Please create a profile first.')
      }

      const tempStickyNote = {
        ...params,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: profile.id,
        user: profile
      }

      const previousStickyNotes = queryClient.getQueryData(['sticky_notes'])
      queryClient.setQueryData(['sticky_notes'], (current: StickyNoteWithReactions[]) => [
        ...(current ?? []),
        tempStickyNote
      ])
      return { params, previousStickyNotes }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['sticky_notes'], context?.previousStickyNotes)
    },
    onSuccess: (data) => {
      channel?.send({
        type: 'broadcast',
        event: EVENT_STICKY_NOTES_CREATED,
        payload: data
      })
    }
  })
}
